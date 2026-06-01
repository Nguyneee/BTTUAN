const { Order, ORDER_STATUS } = require('../models/Order');

const AUTO_CONFIRM_DELAY_MS = 30 * 60 * 1000; // 30 minutes
const JOB_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes

let intervalId = null;

/**
 * Auto-confirm pending orders that have been waiting for more than 30 minutes.
 */
async function autoConfirmOrders() {
  try {
    const cutoffTime = new Date(Date.now() - AUTO_CONFIRM_DELAY_MS);

    const ordersToConfirm = await Order.find({
      status: ORDER_STATUS.PENDING,
      createdAt: { $lt: cutoffTime },
    });

    if (ordersToConfirm.length === 0) {
      return;
    }

    const updatePromises = ordersToConfirm.map((order) => {
      order.addStatusHistory(
        ORDER_STATUS.CONFIRMED,
        'Hệ thống tự động xác nhận sau 30 phút'
      );
      order.status = ORDER_STATUS.CONFIRMED;
      return order.save();
    });

    await Promise.all(updatePromises);
    console.log(`[AutoConfirmJob] Successfully auto-confirmed ${ordersToConfirm.length} order(s)`);
  } catch (error) {
    console.error('[AutoConfirmJob] Error auto-confirming orders:', error.message);
  }
}

/**
 * Start the background job.
 */
function startAutoConfirmJob() {
  if (intervalId) {
    console.log('[AutoConfirmJob] Already running');
    return;
  }

  console.log(`[AutoConfirmJob] Started — checking every ${JOB_INTERVAL_MS / 1000 / 60} minutes for orders older than ${AUTO_CONFIRM_DELAY_MS / 1000 / 60} minutes`);

  // Run immediately on start (in case server restarted)
  autoConfirmOrders();

  // Then run on interval
  intervalId = setInterval(autoConfirmOrders, JOB_INTERVAL_MS);
}

/**
 * Stop the background job.
 */
function stopAutoConfirmJob() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[AutoConfirmJob] Stopped');
  }
}

module.exports = { startAutoConfirmJob, stopAutoConfirmJob };
