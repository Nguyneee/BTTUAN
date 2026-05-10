const eventBus = require('./eventBus');

eventBus.on('user:registered', async ({ userId, email, username }) => {
  try {
    console.log(`📧 [Event] user:registered — ${email}`);
  } catch (err) {
    console.error('[EventBus] user:registered handler error:', err.message);
  }
});

eventBus.on('user:passwordReset', async ({ email, resetToken }) => {
  try {
    console.log(`📧 [Event] user:passwordReset — ${email}`);
  } catch (err) {
    console.error('[EventBus] user:passwordReset handler error:', err.message);
  }
});

module.exports = eventBus;
