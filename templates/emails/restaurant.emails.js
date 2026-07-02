const getOtpEmailTemplate = ({ name, otp, appName }) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fdf7f0; padding: 50px 20px;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.08);">
    
      <!-- Header -->
      <div style="background-color: #f3873aff; color: #fff; text-align: center; padding: 25px 15px; border-top-left-radius: 12px; border-top-right-radius: 12px;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 700;">Your OTP Code</h1>
        <p style="margin: 5px 0 0; font-size: 14px;">Secure Login Verification</p>
      </div>
    
      <!-- Body -->
      <div style="padding: 30px; text-align: center; color: #333; line-height: 1.6;">
        <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 15px; margin-top: 10px;">Enter the OTP below to complete your login. This OTP is valid for <strong>10 minutes</strong>.</p>
    
        <!-- OTP Box -->
        <div style="margin: 30px 0;">
          <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 15px 40px; border-radius: 8px; background-color: #FFF4E6; color: #FF6B00; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            ${otp}
          </span>
        </div>
    
        <p style="font-size: 13px; color: #7f8c8d; margin-top: 25px;">If you did not request this OTP, you can safely ignore this email.</p>
      </div>
    
      <!-- Footer -->
      <div style="background-color: #FFF4E6; text-align: center; padding: 15px; font-size: 12px; color: #7f8c8d;">
        &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
      </div>
    </div>
  </div>
`;


const getVerifyForgotPasswordOtpTemplate = ({ name, otp, appName }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Verification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">🔐 Password Reset Request</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                Hello <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                We received a request to reset your password. Use the verification code below to proceed with resetting your password.
              </p>
              
              <!-- OTP Box -->
              <table role="presentation" style="width: 100%; margin: 0 0 30px;">
                <tr>
                  <td align="center" style="padding: 30px; background-color: #f8f9fa; border-radius: 8px; border: 2px dashed #667eea;">
                    <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${otp}
                    </div>
                    <p style="margin: 15px 0 0; color: #666666; font-size: 13px;">
                      ⏱️ Valid for 10 minutes
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Warning Box -->
              <table role="presentation" style="width: 100%; margin: 0 0 20px;">
                <tr>
                  <td style="padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                      ⚠️ <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact our support team immediately. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.5;">
                This is an automated email. Please do not reply to this message.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;


const getApprovedRestaurantOwnerEmail = ({ name, email, appName }) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f6fa; padding: 30px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background-color: #2E86C1; color: #fff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Restaurant Approved!</h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #333; line-height: 1.6;">
        <p>Hello <strong>${name}</strong>,</p>
        <p>We are excited to inform you that your restaurant has been <strong>approved</strong> successfully and is now live on our platform!</p>
        
        <h3 style="color: #2E86C1; margin-top: 30px;">Your Login Credentials</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 10px; background-color: #f1f2f6; font-weight: bold;">Email</td>
            <td style="padding: 10px; background-color: #f1f2f6;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background-color: #ffffff; font-weight: bold;">Password</td>
            <td style="padding: 10px; background-color: #ffffff;">123456</td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #7f8c8d;">For security reasons, please change your password immediately after logging in.</p>
        <p>Thank you,<br/>Team ${appName}</p>
      </div>

      <!-- Footer -->
      <div style="background-color: #ecf0f1; text-align: center; padding: 15px; font-size: 12px; color: #7f8c8d;">
        &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
      </div>
    </div>
  </div>
`;


const getRejectedRestaurantOwnerEmail = ({ name, reason, appName }) => `
<!DOCTYPE html>
<html>
<body style="margin:0;background:#f4f4f4;font-family:'Inter',sans-serif;color:#333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f4f4f4;">
    <tr>
      <td align="center">
        <table width="600"
               style="background:#1F1F1F;border-radius:16px;
                      box-shadow:0 12px 30px rgba(0,0,0,0.25);
                      overflow:hidden;color:white;">
          
          <!-- Header -->
          <tr>
            <td style="padding:40px 30px;text-align:center;background:#000;">
              <h1 style="margin:0;font-size:32px;color:#C6FF00;">
                Restaurant Rejected
              </h1>
              <p style="margin-top:10px;color:#aaa;font-size:14px;">Validation Update</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <p style="font-size:16px;color:#eee;">
                Hello <strong style="color:#C6FF00;">${name}</strong>,
              </p>

              <p style="font-size:16px;color:#ddd;line-height:1.7;">
                Your restaurant application has been reviewed, but we are unable to approve it at this time.
              </p>

              ${reason ? `
              <div style="background:#151515;border-left:4px solid #C6FF00;
                          padding:20px;margin:30px 0;border-radius:6px;">
                <p style="margin:0;color:#C6FF00;font-weight:bold;">Reason:</p>
                <p style="margin-top:6px;color:#ccc;">${reason}</p>
              </div>
              ` : ''}

              <div style="text-align:center;margin:40px 0;">
                <a href="mailto:support@example.com"
                   style="background:#C6FF00;color:#111;text-decoration:none;
                   padding:14px 40px;border-radius:50px;font-weight:bold;font-size:16px;
                   display:inline-block;">
                   Contact Support
                </a>
              </div>

              <p style="margin-top:30px;color:#ccc;">Regards,<br>
                <strong style="color:#C6FF00;">${appName}</strong></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#000;text-align:center;padding:20px;color:#777;font-size:12px;">
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;





const getResetPasswordEmail = ({ name, resetLink, appName }) => {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f5f7; padding: 30px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background-color: #34495E; color: #fff; padding: 22px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">Reset Your Password</h1>
        </div>

        <!-- Body -->
        <div style="padding: 30px; color: #333; line-height: 1.6;">
          <p>Hello <strong>${name}</strong>,</p>

          <p>We received a request to reset your password. If you made this request, click the button below to set a new password.</p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
              style="display: inline-block; padding: 12px 28px; background-color: #34495E; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </p>

          <p>If the button doesn’t work, please copy and paste the link below into your browser:</p>

          <p style="word-break: break-all; background: #f0f0f0; padding: 12px; border-radius: 5px; font-size: 14px;">
            ${resetLink}
          </p>

          <p style="font-size: 14px; color: #7f8c8d; margin-top: 25px;">
            If you did not request a password reset, you can safely ignore this email — your account is secure.
          </p>

          <p>Thank you,<br/>Team ${appName}</p>
        </div>

        <!-- Footer -->
      <div style="background-color: #ecf0f1; text-align: center; padding: 15px; font-size: 12px; color: #7f8c8d;">
        &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
      </div>

      </div>
    </div>
  `;
};


const getAdminResetPasswordEmail = ({ name, email, newPassword, appName }) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f6fa; padding: 30px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">

      <!-- Header -->
      <div style="background-color: #2E86C1; color: #fff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Password Reset by Admin</h1>
      </div>

      <!-- Body -->
      <div style="padding: 30px; color: #333; line-height: 1.6;">
        <p>Hello <strong>${name}</strong>,</p>

        <p>Your account password has been <strong>reset by the admin</strong>.  
        You can now log in using the new temporary password provided below.</p>

        <h3 style="color: #2E86C1; margin-top: 30px;">Your Updated Login Details</h3>

        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 10px; background-color: #f1f2f6; font-weight: bold;">Email</td>
            <td style="padding: 10px; background-color: #f1f2f6;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; background-color: #ffffff; font-weight: bold;">New Password</td>
            <td style="padding: 10px; background-color: #ffffff;">${newPassword}</td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #7f8c8d;">
          For security reasons, please change your password immediately after logging in.
        </p>

        <p>Thank you,<br/>Team ${appName}</p>
      </div>

      <!-- Footer -->
      <div style="background-color: #ecf0f1; text-align: center; padding: 15px; font-size: 12px; color: #7f8c8d;">
        &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
      </div>

    </div>
  </div>
`;



module.exports = {
  getOtpEmailTemplate,
  getVerifyForgotPasswordOtpTemplate,
  getApprovedRestaurantOwnerEmail,
  getRejectedRestaurantOwnerEmail,
  getResetPasswordEmail,
  getAdminResetPasswordEmail
};