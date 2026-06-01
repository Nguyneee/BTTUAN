const { Order, ORDER_STATUS } = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { ApiResponse } = require('../shared/utils/apiResponse');

/**
 * Helper: parse date range from query
 */
function getDateRange(startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * GET /api/stats/revenue
 * Thống kê doanh thu theo ngày/tuần/tháng
 * Query: startDate, endDate, groupBy (day|week|month)
 */
const getRevenueStats = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    // Format date group expression
    const groupFormats = {
      day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      week: { $dateToString: { format: '%Y-W%V', date: '$createdAt' } },
      month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
    };
    const dateGroup = groupFormats[groupBy] || groupFormats.day;

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: ORDER_STATUS.DELIVERED,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: dateGroup,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Tổng doanh thu trong kỳ
    const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
    const totalOrders = revenueData.reduce((s, d) => s + d.orders, 0);

    // Doanh thu kỳ trước (so sánh)
    const periodMs = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodMs);
    const prevEnd = new Date(start.getTime() - 1);

    const prevResult = await Order.aggregate([
      {
        $match: {
          status: ORDER_STATUS.DELIVERED,
          createdAt: { $gte: prevStart, $lte: prevEnd },
        },
      },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
    ]);
    const prevRevenue = prevResult[0]?.revenue || 0;
    const prevOrders = prevResult[0]?.orders || 0;

    const revenueGrowth = prevRevenue === 0 ? 100 : ((totalRevenue - prevRevenue) / prevRevenue) * 100;
    const ordersGrowth = prevOrders === 0 ? 100 : ((totalOrders - prevOrders) / prevOrders) * 100;

    return res.status(200).json(
      ApiResponse.success({
        chart: revenueData.map((d) => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
        summary: {
          totalRevenue,
          totalOrders,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          ordersGrowth: Math.round(ordersGrowth * 10) / 10,
          prevRevenue,
          prevOrders,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stats/orders
 * Thống kê đơn hàng theo trạng thái + danh sách
 * Query: status (optional), startDate, endDate, page, limit
 */
const getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate, status, page = 1, limit = 10 } = req.query;
    const { start, end } = getDateRange(startDate, endDate);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const dateMatch = { createdAt: { $gte: start, $lte: end } };

    // Đếm theo từng trạng thái
    const statusCounts = await Order.aggregate([
      { $match: dateMatch },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
    ]);

    const statusMap = {};
    statusCounts.forEach((s) => {
      statusMap[s._id] = { count: s.count, total: s.total };
    });

    const allStatuses = Object.values(ORDER_STATUS);
    const byStatus = allStatuses.map((st) => ({
      status: st,
      count: statusMap[st]?.count || 0,
      total: statusMap[st]?.total || 0,
    }));
    const grandTotal = byStatus.reduce((s, d) => s + d.count, 0);

    // Danh sách đơn (filter theo status nếu có)
    const listQuery = { ...dateMatch };
    if (status && Object.values(ORDER_STATUS).includes(status)) {
      listQuery.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(listQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'username email'),
      Order.countDocuments(listQuery),
    ]);

    return res.status(200).json(
      ApiResponse.success({
        byStatus,
        grandTotal,
        list: {
          data: orders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stats/cashflow
 * Thống kê dòng tiền: đơn đang giao (tiền chờ) vs đơn đã giao (doanh thu)
 * Query: startDate, endDate, groupBy
 */
const getCashflowStats = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    const groupFormats = {
      day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      week: { $dateToString: { format: '%Y-W%V', date: '$createdAt' } },
      month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
    };
    const dateGroup = groupFormats[groupBy] || groupFormats.day;

    const cashflowData = await Order.aggregate([
      {
        $match: {
          status: { $in: [ORDER_STATUS.SHIPPING, ORDER_STATUS.DELIVERED] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { date: dateGroup, status: '$status' },
          amount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Pivot data: { date, pending (SHIPPING), received (DELIVERED) }
    const pivotMap = {};
    cashflowData.forEach((d) => {
      const date = d._id.date;
      if (!pivotMap[date]) pivotMap[date] = { date, pendingAmount: 0, receivedAmount: 0, pendingCount: 0, receivedCount: 0 };
      if (d._id.status === ORDER_STATUS.SHIPPING) {
        pivotMap[date].pendingAmount = d.amount;
        pivotMap[date].pendingCount = d.count;
      } else if (d._id.status === ORDER_STATUS.DELIVERED) {
        pivotMap[date].receivedAmount = d.amount;
        pivotMap[date].receivedCount = d.count;
      }
    });

    const chart = Object.values(pivotMap).sort((a, b) => a.date.localeCompare(b.date));

    // Tổng dòng tiền
    const [shippingTotal, deliveredTotal, cancelledTotal] = await Promise.all([
      Order.aggregate([
        { $match: { status: ORDER_STATUS.SHIPPING } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { status: ORDER_STATUS.DELIVERED } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { status: ORDER_STATUS.CANCELLED } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
    ]);

    return res.status(200).json(
      ApiResponse.success({
        chart,
        summary: {
          pendingAmount: shippingTotal[0]?.total || 0,
          pendingCount: shippingTotal[0]?.count || 0,
          receivedAmount: deliveredTotal[0]?.total || 0,
          receivedCount: deliveredTotal[0]?.count || 0,
          cancelledAmount: cancelledTotal[0]?.total || 0,
          cancelledCount: cancelledTotal[0]?.count || 0,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stats/customers
 * Thống kê khách hàng mới theo thời gian
 * Query: startDate, endDate, groupBy
 */
const getCustomerStats = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    const groupFormats = {
      day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      week: { $dateToString: { format: '%Y-W%V', date: '$createdAt' } },
      month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
    };
    const dateGroup = groupFormats[groupBy] || groupFormats.day;

    const [newCustomers, totalCustomers] = await Promise.all([
      User.aggregate([
        {
          $match: {
            role: 'member',
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: dateGroup,
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.countDocuments({ role: 'member' }),
    ]);

    const totalNew = newCustomers.reduce((s, d) => s + d.count, 0);

    // Kỳ trước
    const periodMs = end.getTime() - start.getTime();
    const prevResult = await User.countDocuments({
      role: 'member',
      createdAt: {
        $gte: new Date(start.getTime() - periodMs),
        $lte: new Date(start.getTime() - 1),
      },
    });
    const growth = prevResult === 0 ? 100 : ((totalNew - prevResult) / prevResult) * 100;

    return res.status(200).json(
      ApiResponse.success({
        chart: newCustomers.map((d) => ({ date: d._id, count: d.count })),
        summary: {
          totalNew,
          totalCustomers,
          prevPeriodNew: prevResult,
          growth: Math.round(growth * 10) / 10,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stats/top-products
 * Top sản phẩm bán chạy nhất
 * Query: limit (default 10), startDate, endDate
 */
const getTopProducts = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    const { start, end } = getDateRange(startDate, endDate);

    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: [ORDER_STATUS.DELIVERED, ORDER_STATUS.SHIPPING] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: parseInt(limit) },
    ]);

    return res.status(200).json(
      ApiResponse.success({
        products: topProducts.map((p, idx) => ({
          rank: idx + 1,
          productId: p._id,
          name: p.name,
          image: p.image,
          totalSold: p.totalSold,
          totalRevenue: p.totalRevenue,
          orderCount: p.orderCount,
        })),
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/stats/overview
 * Tổng quan nhanh (cards summary)
 */
const getOverview = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(thisMonthStart.getTime() - 1);

    const [
      totalOrders,
      todayOrders,
      thisMonthRevenue,
      lastMonthRevenue,
      totalCustomers,
      newCustomersToday,
      pendingOrders,
      shippingOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.aggregate([
        { $match: { status: ORDER_STATUS.DELIVERED, createdAt: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { status: ORDER_STATUS.DELIVERED, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ role: 'member', createdAt: { $gte: today, $lt: tomorrow } }),
      Order.countDocuments({ status: ORDER_STATUS.PENDING }),
      Order.countDocuments({ status: ORDER_STATUS.SHIPPING }),
    ]);

    const thisRevenue = thisMonthRevenue[0]?.total || 0;
    const lastRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastRevenue === 0 ? 100 : ((thisRevenue - lastRevenue) / lastRevenue) * 100;

    return res.status(200).json(
      ApiResponse.success({
        totalOrders,
        todayOrders,
        thisMonthRevenue: thisRevenue,
        lastMonthRevenue: lastRevenue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        totalCustomers,
        newCustomersToday,
        pendingOrders,
        shippingOrders,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRevenueStats,
  getOrderStats,
  getCashflowStats,
  getCustomerStats,
  getTopProducts,
  getOverview,
};
