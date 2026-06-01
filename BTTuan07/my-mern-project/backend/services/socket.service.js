const { Server } = require('socket.io');
const { verifyAccessToken } = require('../shared/utils/jwt');
const User = require('../models/User');

let io = null;

/**
 * Khởi tạo Socket.io server
 * @param {http.Server} httpServer
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // ── Middleware xác thực JWT ──────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Không có token xác thực'));
      }
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.sub).select('_id username email role');
      if (!user) {
        return next(new Error('Người dùng không tồn tại'));
      }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Token không hợp lệ'));
    }
  });

  // ── Connection handler ───────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Socket connected: ${user.username} (${user.role})`);

    // Join personal room (nhận notification cá nhân)
    socket.join(`user:${user._id}`);

    // Nếu là admin → join admin room
    if (user.role === 'admin') {
      socket.join('admin');
      console.log(`👑 Admin ${user.username} joined admin room`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.username}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
}

/**
 * Lấy instance io (dùng ở các controller)
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io chưa được khởi tạo');
  }
  return io;
}

/**
 * Gửi notification tới user cụ thể
 * @param {string} userId
 * @param {string} event
 * @param {object} payload
 */
function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

/**
 * Gửi notification tới tất cả admin
 * @param {string} event
 * @param {object} payload
 */
function emitToAdmins(event, payload) {
  if (!io) return;
  io.to('admin').emit(event, payload);
}

module.exports = { initSocket, getIO, emitToUser, emitToAdmins };
