const nodemailer = require('nodemailer');

// Create reusable email transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send an email using the configured transporter
exports.sendWinnerEmail = async ({ to, name, campaign, prize, coupon }) => {

  const mailOptions = {
    from: `"Tiffany Lucky Draw" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🎉 Congratulations! You’re a Tiffany Winner!",

    html: `
<div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 10px;">

        <table width="600" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.15);">

          <!-- Header -->
          <tr>
            <td style="background:#000;color:#fff;text-align:center;padding:25px;">
              <h1 style="margin:0;letter-spacing:2px;">TIFFANY</h1>
              <p style="margin:5px 0 0;font-size:14px;opacity:0.8;">
                Lucky Draw Campaign
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">

              <!-- Name first -->
              <p style="font-size:16px;">Dear <strong>${name}</strong>,</p>

              <!-- Congratulations -->
              <h2 style="color:#28a745;margin-top:10px;">
                🎉 Congratulations!
              </h2>

              <p style="font-size:15px;line-height:1.6;color:#333;">
                We are excited to inform you that you have been selected as a winner in our 
                <strong>${campaign}</strong>.
              </p>

              <!-- Highlight Box -->
              <div style="margin:20px 0;padding:15px;background:#f8f9fa;border-left:4px solid #28a745;border-radius:6px;">
                
                <p style="margin:0;"><strong>🎁 Prize:</strong></p>
                <p style="margin:5px 0;color:#6f42c1;;font-weight:bold;">
                  ${prize}
                </p>

                <p style="margin:10px 0 0;"><strong>🎟 Coupon Code:</strong></p>
                <p style="margin:5px 0;color:#6f42c1;;font-weight:bold;">
                  ${coupon}
                </p>

              </div>

              <p style="font-size:15px;">
                Your prize will be delivered to you very soon 🎁. Our team will contact you shortly for further process.
              </p>

             

              <p style="font-size:14px;">
                We hope to see you again soon! Keep participating in our campaigns for more exciting rewards 🎉
              </p>

              <p style="margin-top:20px;">
                Thank you for being a part of <strong>Tiffany</strong> 💎
              </p>

              <p style="margin-top:25px;">
                Best regards,<br/>
                <strong>Team Tiffany</strong><br/>
                📧 ${process.env.EMAIL_USER}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f1f1;text-align:center;padding:15px;font-size:12px;color:#777;">
              © ${new Date().getFullYear()} Tiffany. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</div>
`
  };

  await transporter.sendMail(mailOptions);
};

// Generate a 6-digit OTP as string
exports.generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Return an expiration timestamp 10 minutes from now
exports.expiresOTP = () => new Date(Date.now() + 10 * 60000);
