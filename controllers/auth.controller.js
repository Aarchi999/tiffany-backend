const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS

  }
});

const User = db.User;

    // ================= LOGIN =================

exports.login = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password required",
        data: []
      });
    }

    // username = email
    const user = await User.findOne({
      where: { email: username }
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        data: []
      });
    }

    // safer active check
   if (user.is_active === '0') {
      return res.status(403).json({
        message: "User inactive"
      });
    }

    let match = false;
    const dbPassword = user.password_hash;

    if (!dbPassword) {
      return res.status(500).json({
        message: "Password missing in DB"
      });
    }

    // ✅ hashed password
    if (dbPassword.startsWith("$2")) {
      match = await bcrypt.compare(password, dbPassword);
    } else {
      // ✅ plain password support
      match = password === dbPassword;

      // ✅ auto upgrade to hash
      if (match) {
        const newHash = await bcrypt.hash(password, 10);
        await user.update({ password: newHash });
        console.log("Password upgraded to hash for:", user.email);
      }
    }

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials",
        data: []
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET || "secret",
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h" }
    );

    // frontend expected format
    return res.json([
      {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.mail,
        Token: token
      }
    ]);

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      status: 500,
      message: err.message,
      data: []
    });
  }
};

// ================= FORGOT PASSWORD =================

// exports.forgotPassword = async(req,res) => {
//   try{
//      console.log("FORGOT BODY:", req.body);

//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         status: 400,
//         message: "Email is required"
//       });
//     }

//     const user = await User.findOne({
//       where: { email }
//     });

//     // ⚠️ do not reveal if user exists (security + frontend friendly)
//     if (!user) {
//       return res.json({
//         status: 200,
//         message: "If email exists, reset link generated"
//       });
//     }
//     // simple reset token (no utils/services as per your rule)
//     const resetToken = jwt.sign(
//       { id: user.id },
//       process.env.JWT_ACCESS_SECRET || "secret",
//       { expiresIn: "15m" }
//     );

//     // if column exists you can save — otherwise ignore safely
//     if (user.reset_token !== undefined) {
//       await user.update({ reset_token: resetToken });
//     }

//     // since email service ignored — log token
//     console.log("RESET TOKEN for", email, ":", resetToken);

//     return res.json({
//       status: 200,
//       message: "Reset token generated (check server log)"
//     });

//   } catch (err) {
//     console.error("FORGOT ERROR:", err);
//     return res.status(500).json({
//       status: 500,
//       message: err.message
//     });
//   }
// };


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 400,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ where: { email } });

    // always return success (security best practice)
    if (!user) {
      return res.json({
        status: 200,
        message: "If email exists, OTP sent"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({
      otp_code: otp,
      otp_expires_at: expiry
    });

   await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "🔐 Password Reset OTP - Your Security Code",

  html: `
  <div style="font-family: Arial, sans-serif; background:#f4f6f9; padding:20px;">
    
    <div style="max-width:500px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:#4f46e5; padding:20px; text-align:center; color:white;">
        <h2 style="margin:0;">Password Reset Request</h2>
      </div>

      <!-- Body -->
      <div style="padding:30px; text-align:center;">
        <p style="font-size:16px; color:#333;">
          Use the following OTP to reset your password
        </p>

        <div style="
          font-size:28px;
          letter-spacing:6px;
          font-weight:bold;
          color:#4f46e5;
          background:#f1f5ff;
          padding:15px;
          margin:20px 0;
          border-radius:8px;
          display:inline-block;
        ">
          ${otp}
        </div>

        <p style="color:#666; font-size:14px;">
          This OTP is valid for <b>10 minutes</b>. Do not share it with anyone.
        </p>

        <a href="#" style="
          display:inline-block;
          margin-top:20px;
          padding:12px 20px;
          background:#4f46e5;
          color:#fff;
          text-decoration:none;
          border-radius:6px;
        ">
          Secure Your Account
        </a>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#888;">
        © ${new Date().getFullYear()} Your Company. All rights reserved.
      </div>

    </div>
  </div>
  `
});

    return res.json({
      status: 200,
      message: "OTP sent to email"
    });

  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message
    });
  }
};  

// ================= VERIFY OTP =================

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp_code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    return res.json({
      message: "OTP verified successfully"
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ================= RESET PASSWORD =================

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({
        message: "Email, OTP and password required"
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // ✅ check OTP
    if (user.otp_code !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // ✅ check expiry
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await user.update({
      password_hash: hashedPassword,
      otp_code: null,
      otp_expires_at: null
    });

    return res.json({
      message: "Password reset successful"
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// ================= LOGOUT =================

exports.logout = async (req, res) => {
  try {
    // JWT stateless → frontend removes token
    // backend just confirms

    return res.json({
      status: 200,
      message: "Logout successful"
    });

  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({
      status: 500,
      message: err.message
    });
  }
};
