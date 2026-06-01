const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generate 6-digit OTP code
 */
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP email for registration or password reset
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} type - 'register' or 'reset'
 * @param {string} username - Optional username for personalized email
 */
async function sendOtpEmail(email, otp, type = 'register', username = '') {
  const isRegister = type === 'register';
  const subject = isRegister ? 'Mã xác thực đăng ký TechStore' : 'Mã đặt lại mật khẩu TechStore';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; text-align: center; }
        .otp-box { background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; }
        .warning { color: #6b7280; font-size: 12px; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔌 TechStore</h1>
        </div>
        <div class="content">
          <p>Xin chào${username ? ` ${username}` : ''},</p>
          <p>${isRegister ? 'Cảm ơn bạn đã đăng ký tài khoản TechStore!' : 'Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn.'}</p>
          <p>Mã xác thực của bạn:</p>
          <div class="otp-box">
            <span class="otp-code">${otp}</span>
          </div>
          <p class="warning">⚠️ Mã này có hiệu lực trong <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
          ${isRegister ? '<p>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>' : '<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và tài khoản của bạn vẫn an toàn.</p>'}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} TechStore. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    TechStore - ${subject}
    
    Xin chào${username ? ` ${username}` : ''},
    
    ${isRegister ? 'Cảm ơn bạn đã đăng ký tài khoản TechStore!' : 'Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn.'}
    
    Mã xác thực của bạn: ${otp}
    
    Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.
    
    © ${new Date().getFullYear()} TechStore
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

module.exports = {
  sendOtpEmail,
  generateOtp,
};
