// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const {
//   users,
//   roles,
//   user_roles,
//   user_devices,
//   Sequelize,
//   restaurants,
//   restaurant_staff,
//   sequelize
// } = require('../../../models');

// // ------------- UTILLS -------------
// const {
//   isValidEmail,
//   isValidOTP,
//   isValidPassword
// } = require('../../../utils/validation.util');
// const { generateRandomPassword } = require('../../../utils/generateRandomPassword.utils');

// // ------------- SERVICES -------------
// const {
//   sendEmail,
//   generateOTP,
//   expiresOTP
// } = require('../../../services/email.service');
// const { sendToSingleToken } = require('../../../services/notification.service');
// const logger = require('../../../services/logger.service');
// const { getRequestInfo } = require('../../../services/logger.service');
// const {
//   generateAccessToken,
//   verifyRefreshToken,
//   generateRefreshToken,
//   verifyAccessToken
// } = require('../../../services/token.service');
// const {
//   bcryptCompare,
//   bcryptHash
// } = require('../../../services/crypto.service');
// const { getUserPermissions } = require('../../../services/permission.service');

// // ------------- TEMPLATES -------------
// const { getResetPasswordEmail, getAdminResetPasswordEmail, getOtpEmailTemplate } = require('../../../templates/emails/restaurant.emails');


// const COOKIE_ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
// const COOKIE_REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// const ModuleName = 'admin';

// const login = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     console.log("role", role);

//     // Validate email and password format
//     if (!email || !password || !isValidEmail(email) || !isValidPassword(password)) {
//       // Only fetch user if email exists
//       const user = await users.findOne({ where: { email, deleted_at: null } });
//       if (user) {
//         await user.increment('failed_login_attempts');
//         if (user.failed_login_attempts + 1 >= 5) {
//           logger.error({
//             type: 'LOGIN_ATTEMPT',
//             request: getRequestInfo(req),
//             response: { status: 429, message: 'Maximum login attempts reached', data: [{ failed_login_attempts: user.failed_login_attempts }] },
//           }, ModuleName);
//           return res.json({ status: 429, message: 'Maximum login attempts reached', data: [{ failed_login_attempts: user.failed_login_attempts }] });
//         }
//       }

//       logger.error({
//         type: 'LOGIN_ATTEMPT',
//         request: getRequestInfo(req),
//         response: { status: 422, message: 'Invalid email or password format', data: [] },
//       }, ModuleName);
//       return res.json({ status: 422, message: 'Invalid email or password format', data: [] });
//     }

//     // Fetch user once
//     const user = await users.findOne({ where: { email, deleted_at: null } });
//     if (!user) {
//       logger.error({
//         type: 'LOGIN_ATTEMPT',
//         request: getRequestInfo(req),
//         response: { status: 404, message: 'User not found', data: [] },
//       }, ModuleName);
//       return res.json({ status: 404, message: 'User not found', data: [] });
//     }

//     const userRole = await user_roles.findOne({
//       where: { user_id: user.id },
//       include: [{
//         model: roles,
//         as: 'role',
//         attributes: ['id', 'name'], // fields from roles table
//       }],
//     });

//     const roleName = userRole?.role?.name || null;
//     console.log("🚀 ~ roleName:", roleName);

//     // Only check role if provided
//     if (!role.includes(roleName)) {
//       logger.error({
//         type: 'LOGIN_ATTEMPT',
//         request: getRequestInfo(req),
//         response: { status: 403, message: 'Access denied', data: [] },
//       }, ModuleName);
//       return res.json({ status: 403, message: 'Access denied', data: [] });
//     }

//     if (user.is_active !== '1') {
//       logger.error({
//         type: 'LOGIN_ATTEMPT',
//         request: getRequestInfo(req),
//         response: { status: 403, message: 'Account not approved yet. Please wait for admin approval.', data: [] },
//       }, ModuleName);
//       return res.json({ status: 403, message: 'Account not approved yet. Please wait for admin approval.', data: [] });
//     }


//     // Check password
//     const match = await bcrypt.compare(password, user.password_hash);
//     if (!match) {
//       await user.increment('failed_login_attempts');

//       if (user.failed_login_attempts + 1 >= 5) {
//         logger.error({
//           type: 'LOGIN_ATTEMPT',
//           request: getRequestInfo(req),
//           response: { status: 429, message: 'Maximum login attempts reached', data: [{ failed_login_attempts: user.failed_login_attempts }] },
//         }, ModuleName);
//         return res.json({ status: 429, message: 'Maximum login attempts reached', data: [{ failed_login_attempts: user.failed_login_attempts }] });
//       }

//       logger.error({
//         type: 'LOGIN_ATTEMPT',
//         request: getRequestInfo(req),
//         response: { status: 401, message: 'Incorrect password', data: [] },
//       }, ModuleName);
//       return res.json({ status: 401, message: 'Invalid email or password', data: [] });
//     }

//     // Reset failed attempts
//     if (user.failed_login_attempts > 0) await user.update({ failed_login_attempts: 0 });

//     // Generate OTP
//     const otp = generateOTP();
//     const otpExpires = expiresOTP();

//     // Save OTP but respond immediately
//     user.update({ otp_code: otp, otp_expires_at: otpExpires }).catch(console.error);

//     const otpEmail = getOtpEmailTemplate({
//       name: user.name,
//       otp,
//       appName: process.env.APP_NAME || "Zestigo App"
//     });

//     sendEmail(user.email, "Your Login OTP", otpEmail).catch(console.error);


//     logger.success({
//       type: 'LOGIN_ATTEMPT',
//       request: getRequestInfo(req),
//       response: { status: 200, message: 'OTP sent to your email', data: { email, role: roleName } },
//     }, ModuleName);

//     return res.json({ status: 200, message: 'OTP sent to your email', data: { email, role: roleName } });

//   } catch (error) {
//     logger.error({
//       type: 'LOGIN_ATTEMPT',
//       request: getRequestInfo(req),
//       response: { status: 500, message: error.message, data: [] },
//     }, ModuleName);
//     return res.json({ status: 500, message: error.message, data: [] });
//   }
// };


// // ResetOTP Controller — Handles resends OTP - /api/admin/resend-otp
// const resendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       logger.error({
//         type: 'RESEND_OTP',
//         request: getRequestInfo(req),
//         response: { status: 422, message: 'Email is required', data: [] },
//       }, ModuleName);
//       return res.json({ status: 422, message: 'Email is required', data: [] });
//     }

//     const user = await users.findOne({ where: { email, deleted_at: null } });

//     if (!user) {
//       logger.error({
//         type: 'RESEND_OTP',
//         request: getRequestInfo(req),
//         response: { status: 404, message: 'User not found', data: [] },
//       }, ModuleName);
//       return res.json({ status: 404, message: 'User not found', data: [] });
//     }

//     if (user.is_active !== '1') {
//       logger.error({
//         type: 'RESEND_OTP',
//         request: getRequestInfo(req),
//         response: { status: 403, message: 'Account disabled', data: [] },
//       }, ModuleName);
//       return res.json({ status: 403, message: 'Account disabled', data: [] });
//     }


//     const otp = generateOTP();
//     const otpExpires = expiresOTP();

//     // Save OTP asynchronously
//     user.update({ otp_code: otp, otp_expires_at: otpExpires }).catch(console.error);

//     // Send email asynchronously
//     sendEmail(email, 'Your Resend OTP', `Your OTP is ${otp}`).catch(console.error);

//     logger.success({
//       type: 'RESEND_OTP',
//       request: getRequestInfo(req),
//       response: { status: 200, message: 'OTP resent successfully', data: { email } },
//     }, ModuleName);

//     // Respond immediately
//     return res.json({ status: 200, message: 'OTP resent successfully', data: { email } });

//   } catch (error) {
//     logger.error({
//       type: 'RESEND_OTP',
//       request: getRequestInfo(req),
//       response: { status: 500, message: error.message, data: [] },
//     }, ModuleName);
//     return res.json({ status: 500, message: error.message, data: [] });
//   }
// };



// // VERIFY OTP Controller — Verifies OTP and issues tokens - /api/admin/verify-otp
// const verifyOTP = async (req, res) => {
//   try {
//     const { email, otp, device_type, os_type, device_name, fcmToken } = req.body;

//     if (!email || !otp || !isValidEmail(email) || !isValidOTP(otp)) {
//       logger.error({
//         type: 'VERIFY_OTP',
//         request: getRequestInfo(req),
//         response: { status: 422, message: 'Invalid email or OTP format', data: [] },
//       }, ModuleName);
//       return res.json({ status: 422, message: 'Invalid email or OTP format', data: [] });
//     }

//     const user = await users.findOne({ where: { email, deleted_at: null } });
//     if (!user) {
//       logger.error({
//         type: 'VERIFY_OTP',
//         request: getRequestInfo(req),
//         response: { status: 404, message: 'User not found', data: [] },
//       }, ModuleName);
//       return res.json({ status: 404, message: 'User not found', data: [] });
//     }

//     if (!user.otp_code || new Date() > user.otp_expires_at) {
//       await user.update({ otp_code: null, otp_expires_at: null });
//       logger.error({
//         type: 'VERIFY_OTP',
//         request: getRequestInfo(req),
//         response: { status: 401, message: 'OTP expired', data: [] },
//       }, ModuleName);
//       return res.json({ status: 401, message: 'OTP expired', data: [] });
//     }

//     if ("123456" !== otp) {
//       logger.error({
//         type: 'VERIFY_OTP',
//         request: getRequestInfo(req),
//         response: { status: 401, message: 'Invalid OTP', data: [] },
//       }, ModuleName);
//       return res.json({ status: 401, message: 'Invalid OTP 123456', data: [] });
//     }

//     // if (user.otp_code !== otp) {
//     //   logger.error({
//     //     type: 'VERIFY_OTP',
//     //     request: getRequestInfo(req),
//     //     response: { status: 401, message: 'Invalid OTP', data: [] },
//     //   });
//     //   return res.json({ status: 401, message: 'Invalid OTP', data: [] });
//     // }

//     await user.update({ otp_code: null, otp_expires_at: null });


//     let deviceRecord = null;

//     // Device information is mandatory. Require all four fields.
//     // if (!device_type || !os_type || !device_name || !fcmToken) {
//     if (!device_type || !os_type || !device_name) {
//       logger.error({
//         type: 'VERIFY_OTP',
//         request: getRequestInfo(req),
//         response: { status: 422, message: 'Device information required (device_type, os_type, device_name, fcmToken)', data: [] },
//       }, ModuleName);
//       return res.json({ status: 422, message: 'Device information required (device_type, os_type, device_name, fcmToken)', data: [] });
//     }

//     if (device_type && os_type) {
//       const existingDevice = await user_devices.findOne({
//         where: {
//           user_id: user.id,
//           device_type,
//           os_type,
//           device_name: device_name,
//           deleted_at: null
//         },
//       });

//       if (existingDevice) {
//         // Just update login timestamp (no duplicate entry)
//         deviceRecord = await existingDevice.update({ fcm_token: fcmToken || null, last_login_at: new Date(), status: "1" });
//       } else {
//         // Insert new record
//         deviceRecord = await user_devices.create({
//           user_id: user.id,
//           device_type,
//           device_name: device_name || null,
//           os_type,
//           fcm_token: fcmToken || null,
//           last_login_at: new Date(),
//         });
//       }
//     };



//     // Send Notification to user
//     if (fcmToken) {
//       await sendToSingleToken(
//         fcmToken,
//         'Login Successful',
//         'Welcome back! You have successfully logged in.',
//         { userId: user.id.toString(), name: user.name, email: user.email }
//       );
//     }


//     // 🧩 Fetch user permissions
//     const permissions = await getUserPermissions(user.id);

//     const accessToken = await generateAccessToken(user, deviceRecord.id);
//     const refreshToken = await generateRefreshToken(user, deviceRecord.id);

//     const hashedRefreshToken = await bcryptHash(refreshToken);

//     const decodedAccess = jwt.decode(accessToken);
//     const role = decodedAccess?.role || null; // { id, name }

//     const { exp } = jwt.decode(refreshToken);

//     const refreshTokenExpiresAt = new Date(exp * 1000);

//     // Store hashed refresh token and expiry only on device record.
//     if (deviceRecord) {
//       await deviceRecord.update({ token: hashedRefreshToken, token_expires_at: refreshTokenExpiresAt });
//     } else {
//       // This should not happen because device info is mandatory. Log and return error.
//       logger.error({
//         type: 'VERIFY_OTP',
//         request: getRequestInfo(req),
//         response: { status: 500, message: 'Failed to persist device token: device record missing', data: [] },
//       }, ModuleName);
//       return res.json({ status: 500, message: 'Failed to persist device token', data: [] });
//     }

//     // res.cookie('accessToken', accessToken, {
//     //   httpOnly: true,
//     //   secure: process.env.NODE_ENV === "production",
//     //   sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
//     //   maxAge: COOKIE_ACCESS_TOKEN_MAX_AGE
//     // });

//     // res.cookie('authToken', refreshToken, {
//     //   httpOnly: true,
//     //   secure: process.env.NODE_ENV === 'production',
//     //   sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
//     //   maxAge: COOKIE_REFRESH_TOKEN_MAX_AGE,
//     //   path: '/',
//     // });


//     const isProd = process.env.NODE_ENV === "production";

//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: isProd,              // MUST be true in prod
//       sameSite: isProd ? "None" : "Lax",
//       domain: isProd ? ".zesty-go.com" : undefined,
//       path: "/",
//       maxAge: COOKIE_ACCESS_TOKEN_MAX_AGE
//     });

//     res.cookie("authToken", refreshToken, {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: isProd ? "None" : "Lax",
//       domain: isProd ? ".zesty-go.com" : undefined,
//       path: "/",
//       maxAge: COOKIE_REFRESH_TOKEN_MAX_AGE
//     });



//     // ✅ NEW: Fetch parent restaurant(s) for this owner
//     let restaurant = null;
//     if (role?.name === "restaurant_owner") {
//       // restaurant = await users.getOwnedParentRestaurants(user.id, require("../../../models"));
//       restaurant = await users.getOwnedParentRestaurants(user.id, {
//         users,
//         roles,
//         user_roles,
//         restaurant_staff,
//         restaurants,
//         Sequelize
//       });
//     }

//     if (role?.name === "store_admin") {
//       // restaurant = await users.getOwnedParentRestaurants(user.id, require("../../../models"));
//       restaurant = await users.getStoreAdminRestaurantHierarchy(user.id, {
//         users,
//         roles,
//         user_roles,
//         restaurant_staff,
//         restaurants,
//         Sequelize
//       });
//     }

//     const data = {
//       id: user.id,
//       email: user.email,
//       name: user.name,
//       accessToken,
//       role,
//       permissions, // 🧩 Added here
//       ...(restaurant ? { restaurant } : { restaurant: {} })
//     }


//     logger.success({
//       type: 'VERIFY_OTP',
//       request: getRequestInfo(req),
//       response: { status: 200, message: 'Login successful', data },
//     }, ModuleName);

//     return res.json({
//       status: 200,
//       message: 'Login successful',
//       data
//     });

//   } catch (error) {
//     logger.error({
//       type: 'VERIFY_OTP',
//       request: getRequestInfo(req),
//       response: { status: 500, message: error.message, data: [] },
//     }, ModuleName);
//     return res.json({ status: 500, message: error.message, data: [] });
//   }
// };

// // REFRESH TOKEN Controller — Issues a new access token - /api/admin/refresh-token
// const refreshToken = async (req, res) => {
//   try {
//     const token = req.cookies?.authToken;
//     if (!token) {
//       logger.error({
//         type: "REFRESH_TOKEN",
//         request: getRequestInfo(req),
//         response: { status: 401, message: "Refresh token missing", data: [] },
//       }, ModuleName);
//       return res.json({ status: 401, message: "Refresh token missing", data: [] });
//     }

//     const decoded = verifyRefreshToken(token);
//     if (!decoded) {
//       return res.json({ status: 401, message: "Invalid refresh token", data: [] });
//     }

//     const user = await users.findOne({ where: { id: decoded.id, deleted_at: null } });
//     if (!user || user.is_active !== '1') {
//       logger.error({
//         type: "REFRESH_TOKEN",
//         request: getRequestInfo(req),
//         response: { status: 401, message: "User not found or inactive", data: [] },
//       }, ModuleName);
//       return res.json({ status: 401, message: "Invalid refresh token", data: [] });
//     }

//     // ✔ Verify hashed refresh token against user's devices only
//     let matchedDevice = null;
//     const deviceCandidates = await user_devices.findAll({
//       where: {
//         user_id: user.id,
//         token: { [Sequelize.Op.ne]: null },
//         token_expires_at: { [Sequelize.Op.gt]: new Date() },
//         deleted_at: null
//       }
//     });

//     for (const d of deviceCandidates) {
//       if (await bcryptCompare(token, d.token)) {
//         matchedDevice = d;
//         break;
//       }
//     }

//     if (!matchedDevice) {
//       return res.json({ status: 401, message: "Refresh token mismatch", data: [] });
//     }

//     // ✔ Fetch updated permissions
//     const permissions = await getUserPermissions(user.id);

//     // ✔ Generate new Access Token with user role & permissions
//     const accessToken = await generateAccessToken({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       permissions
//     }, matchedDevice?.id || null);

//     const decodedAccess = jwt.decode(accessToken);
//     const role = decodedAccess?.role || null;

//     // ✔ Get restaurant (if owner)
//     let restaurant = null;
//     if (role?.name === "restaurant_owner") {
//       restaurant = await users.getOwnedParentRestaurants(user.id, {
//         users,
//         roles,
//         user_roles,
//         restaurant_staff,
//         restaurants,
//         Sequelize
//       });
//     }

//     // // ✔ Set new cookie
//     // res.cookie("accessToken", accessToken, {
//     //   httpOnly: true,
//     //   secure: process.env.NODE_ENV === "production",
//     //   sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
//     //   maxAge: COOKIE_ACCESS_TOKEN_MAX_AGE,
//     // });

//     const isProd = process.env.NODE_ENV === "production";

//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: isProd,              // MUST be true in prod
//       sameSite: isProd ? "None" : "Lax",
//       domain: isProd ? ".zesty-go.com" : undefined,
//       path: "/",
//       maxAge: COOKIE_ACCESS_TOKEN_MAX_AGE
//     });


//     const data = {
//       id: user.id,
//       email: user.email,
//       name: user.name,
//       accessToken,
//       role,
//       permissions,
//       ...(restaurant ? { restaurant } : { restaurant: {} })
//     };

//     logger.success({
//       type: "REFRESH_TOKEN",
//       request: getRequestInfo(req),
//       response: { status: 200, message: "New access token", data },
//     }, ModuleName);

//     return res.json({ status: 200, message: "New access token", data });

//   } catch (error) {
//     logger.error({
//       type: "REFRESH_TOKEN",
//       request: getRequestInfo(req),
//       response: { status: 401, message: "Invalid or expired refresh token", data: [] },
//     }, ModuleName);

//     return res.json({ status: 401, message: "Invalid or expired refresh token", data: [] });
//   }
// };



// // FORGOT PASSWORD Controller — Sends password reset link - /api/admin/forgot-password

// const forgotPassword = async (req, res) => {

//   const requestInfo = getRequestInfo(req);

//   try {
//     const {
//       email,
//       redirect_url
//     } = req.body;


//     if (!email) {
//       logger.error({
//         type: "FORGOT_PASSWORD",
//         request: requestInfo,
//         response: { status: 422, message: "Email is required", data: [] }
//       }, ModuleName);

//       return res.json({ status: 422, message: "Email is required", data: [] });
//     }

//     const user = await users.findOne({ where: { email, deleted_at: null } });
//     if (!user || user.is_active !== '1') {
//       logger.error({
//         type: "FORGOT_PASSWORD",
//         request: requestInfo,
//         response: { status: 404, message: "User not found or inactive", data: [] }
//       }, ModuleName);

//       return res.json({ status: 404, message: "User not found or inactive", data: [] });
//     }

//     // Remove /login if included
//     const cleanRedirectURL = redirect_url.replace(/\/login\/?|\/$/, "");


//     // STEP 1: HASH EMAIL (bcrypt)
//     const token = await bcryptHash(email);

//     // STEP 2: ENCODE EMAIL (base64)
//     const encodedEmail = Buffer.from(email).toString("base64");

//     // STEP 3: Final reset link (NO backend URL in it, only frontend)
//     const resetLink = `${cleanRedirectURL}/reset-password/${encodedEmail}/${encodeURIComponent(token)}`;

//     const html = getResetPasswordEmail({
//       name: user.name,
//       resetLink,
//       appName: process.env.APP_NAME || 'Zestigo App'
//     });

//     sendEmail(email, "Reset Your Password", html);

//     logger.success({
//       type: "FORGOT_PASSWORD",
//       request: requestInfo,
//       response: { status: 200, message: "Password reset link sent to your email", data: { email, redirect_url: cleanRedirectURL } }
//     }, ModuleName);

//     return res.json({
//       status: 200,
//       message: "Password reset link sent to your email",
//       data: {
//         email,
//         redirect_url: cleanRedirectURL
//       }
//     });

//   } catch (error) {
//     logger.error({
//       type: "FORGOT_PASSWORD",
//       request: requestInfo,
//       response: { status: 500, message: error.message, data: [] }
//     }, ModuleName);
//     return res.json({ status: 500, message: error.message, data: [] });
//   }
// };



// // RESET PASSWORD Controller — Resets user password after verification - /api/admin/reset-password

// const resetPassword = async (req, res) => {

//   const requestInfo = getRequestInfo(req);

//   try {
//     const { newPassword, confirmPassword, email, token } = req.body;


//     if (!newPassword || !confirmPassword) {
//       logger.error({
//         type: "RESET_PASSWORD",
//         request: requestInfo,
//         response: { status: 422, message: "Passwords are required", data: [] }
//       }, ModuleName);

//       return res.json({ status: 422, message: "Passwords are required", data: [] });
//     }

//     if (newPassword !== confirmPassword) {
//       logger.error({
//         type: "RESET_PASSWORD",
//         request: requestInfo,
//         response: { status: 422, message: "confirm password does not match new password", data: [] }
//       }, ModuleName);

//       return res.json({ status: 422, message: "confirm password does not match new password", data: [] });
//     }

//     // STEP 1: Decode email (base64 → real email)
//     const decodedEmail = Buffer.from(email, "base64").toString("utf8");

//     // STEP 2: Compare bcrypt hash
//     const isValid = await bcryptCompare(decodedEmail, token);

//     if (!isValid) {
//       logger.error({
//         type: "RESET_PASSWORD",
//         request: requestInfo,
//         response: { status: 401, message: "Invalid or tampered reset link", data: [] }
//       }, ModuleName);

//       return res.json({ status: 401, message: "Invalid or tampered reset link", data: [] });
//     }

//     // STEP 3: Find user
//     const user = await users.findOne({ where: { email: decodedEmail, deleted_at: null } });
//     if (!user || user.is_active !== '1') {
//       logger.error({
//         type: "RESET_PASSWORD",
//         request: requestInfo,
//         response: { status: 404, message: "User not found or inactive", data: [] }
//       }, ModuleName);

//       return res.json({ status: 404, message: "User not found or inactive", data: [] });
//     }

//     // STEP 4: Prevent same password reuse
//     const isSamePassword = await bcryptCompare(newPassword, user.password_hash);
//     if (isSamePassword) {

//       logger.error({
//         type: "RESET_PASSWORD",
//         request: requestInfo,
//         response: { status: 409, message: "New password cannot be same as old password", data: [] }
//       }, ModuleName);

//       return res.json({ status: 409, message: "New password cannot be same as old password", data: [] });
//     }

//     // STEP 5: Update password
//     const hash = await bcryptHash(newPassword);
//     await user.update({ password_hash: hash });


//     logger.success({
//       type: "RESET_PASSWORD",
//       request: requestInfo,
//       response: { status: 200, message: "Password updated successfully", data: { email: decodedEmail } }
//     }, ModuleName);


//     return res.json({
//       status: 200,
//       message: "Password updated successfully",
//       data: { email: decodedEmail }
//     });

//   } catch (error) {
//     logger.error({
//       type: "RESET_PASSWORD",
//       request: requestInfo,
//       response: { status: 500, message: error.message, data: [] }
//     }, ModuleName);
//     return res.json({ status: 500, message: error.message, data: [] });
//   }
// };


// // RESET PASSWORD Controller — Resets user password after verification - /api/admin/reset-password

// const adminResetPassword = async (req, res) => {

//   const requestInfo = getRequestInfo(req);

//   try {
//     const { email, restaurant_id } = req.body;

//     // Validate input
//     if (!email || !restaurant_id) {
//       const response = { status: 422, message: "Email and restaurant_id are required", data: [] };

//       logger.error({ type: "ADMIN_RESET_PASSWORD", request: requestInfo, response }, ModuleName);
//       return res.json(response);
//     }

//     // 1️⃣ Find User
//     const user = await users.findOne({ where: { email, deleted_at: null } });

//     if (!user || user.is_active !== "1") {
//       const response = { status: 404, message: "User not found or inactive", data: [] };

//       logger.error({ type: "ADMIN_RESET_PASSWORD", request: requestInfo, response }, ModuleName);
//       return res.json(response);
//     }

//     // 2️⃣ Find Restaurant
//     const restaurant = await restaurants.findOne({ where: { id: restaurant_id } });

//     if (!restaurant) {
//       const response = { status: 404, message: "Restaurant not found", data: [] };

//       logger.error({ type: "ADMIN_RESET_PASSWORD", request: requestInfo, response }, ModuleName);
//       return res.json(response);
//     }

//     // 3️⃣ Check Restaurant Status
//     if (restaurant.status !== "approved") {
//       const response = { status: 403, message: "Restaurant is not approved", data: [] };

//       logger.error({ type: "ADMIN_RESET_PASSWORD", request: requestInfo, response }, ModuleName);
//       return res.json(response);
//     }

//     // 4️⃣ Reset Password to 123456
//     const newPassword = generateRandomPassword(12);
//     const hash = await bcryptHash(newPassword);

//     await user.update({ password_hash: hash });

//     const html = getAdminResetPasswordEmail({
//       name: user.name,
//       email: user.email,
//       newPassword,
//       appName: process.env.APP_NAME,
//     });

//     sendEmail(user.email, "Your Password Has Been Reset", html);


//     // 5️⃣ Logging Success
//     const response = {
//       status: 200,
//       message: "Password reset successfully",
//       data: { email }
//     };

//     logger.success({ type: "ADMIN_RESET_PASSWORD", request: requestInfo, response }, ModuleName);

//     return res.json(response);

//   } catch (error) {

//     const response = { status: 500, message: error.message, data: [] };

//     logger.error({ type: "ADMIN_RESET_PASSWORD", request: requestInfo, response }, ModuleName);

//     return res.json(response);
//   }
// };



// // LOGOUT Controller — Clears refresh token cookie - /api/admin/logout


// const logout = async (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       logger.error({
//         type: "LOGOUT",
//         request: getRequestInfo(req),
//         response: { status: 400, message: "No active session", data: [] }
//       }, ModuleName);
//       return res.json({ status: 400, message: "No active session", data: [] });
//     }

//     // ⭐ Decode Access Token
//     let decoded;
//     try {
//       decoded = verifyAccessToken(token); // <-- using your helper
//     } catch (err) {
//       return res.json({ status: 401, message: "Invalid or expired token", data: [] });
//     }

//     const user = await users.findOne({ where: { id: decoded.id, deleted_at: null } });

//     if (!user) {
//       return res.json({ status: 404, message: "User not found", data: [] });
//     }

//     // ⭐ Delete the matched device record when logging out (require refresh token cookie or device info)
//     const refreshTokenFromCookie = req.cookies?.authToken;
//     if (refreshTokenFromCookie) {
//       const deviceCandidates = await user_devices.findAll({ where: { user_id: user.id, token: { [Sequelize.Op.ne]: null }, deleted_at: null } });
//       let matched = null;
//       for (const d of deviceCandidates) {
//         if (await bcryptCompare(refreshTokenFromCookie, d.token)) {
//           matched = d;
//           break;
//         }
//       }

//       if (matched) {
//         await user_devices.destroy({ where: { id: matched.id } });
//       } else {
//         return res.json({ status: 400, message: 'Device not found for this session', data: [] });
//       }
//     } else {
//       // If no cookie, allow deletion via device identifiers in body
//       const { device_type, os_type, device_name } = req.body;
//       if (!device_type || !os_type || !device_name) {
//         return res.json({ status: 422, message: 'Provide refresh token cookie or device identifiers to logout', data: [] });
//       }

//       await user_devices.destroy({ where: { user_id: user.id, device_type, os_type, device_name } });
//     }

//     // Clear cookies (optional)
//     res.clearCookie("accessToken", { path: "/" });
//     res.clearCookie("authToken", { path: "/" });

//     logger.success({
//       type: "LOGOUT",
//       request: getRequestInfo(req),
//       response: { status: 200, message: "Logged out successfully", data: [] }
//     }, ModuleName);

//     return res.json({ status: 200, message: "Logged out successfully", data: [] });

//   } catch (error) {
//     logger.error({
//       type: "LOGOUT",
//       request: getRequestInfo(req),
//       response: { status: 500, message: error.message, data: [] }
//     }, ModuleName);
//     return res.json({ status: 500, message: error.message, data: [] });
//   }
// };


// // Logout From Current Device 

// // const logout = async (req, res) => {
// //   const requestInfo = logger.getRequestInfo(req);
// //   const { device_type, os_type, device_name } = req.body;

// //   try {
// //     const authHeader = req.headers.authorization;
// //     const accessToken = authHeader?.split(" ")[1];

// //     if (!accessToken) {
// //       const response = { status: 400, message: "No active session", data: [] };
// //       logger.error({ type: "LOGOUT_DEVICE", request: requestInfo, response }, ModuleName);
// //       return res.json(response);
// //     }

// //     const decoded = verifyAccessToken(accessToken);
// //     const userId = decoded.id;

// //     await user_devices.update(
// //       {
// //         status: "0",
// //         fcm_token: null
// //       },
// //       {
// //         where: {
// //           user_id: userId,
// //           device_type,
// //           os_type,
// //           device_name: device_name || null
// //         }
// //       }
// //     );

// //     // Clear cookies (web)
// //     res.clearCookie("accessToken", { path: "/" });
// //     res.clearCookie("authToken", { path: "/" });

// //     const response = { status: 200, message: "Logged out from current device", data: [] };
// //     logger.success({ type: "LOGOUT_DEVICE", request: requestInfo, response }, ModuleName);
// //     return res.json(response);

// //   } catch (error) {
// //     const response = { status: 500, message: error.message, data: [] };
// //     logger.error({ type: "LOGOUT_DEVICE", request: requestInfo, response }, ModuleName);
// //     return res.json(response);
// //   }
// // };


// // Logout From All Devices 

// const logoutAllDevices = async (req, res) => {
//   const requestInfo = logger.getRequestInfo(req);

//   try {
//     const authHeader = req.headers.authorization;
//     const accessToken = authHeader?.split(" ")[1];

//     if (!accessToken) {
//       const response = { status: 400, message: "No active session", data: [] };
//       logger.error({ type: "LOGOUT_ALL", request: requestInfo, response }, ModuleName);
//       return res.json(response);
//     }

//     const decoded = verifyAccessToken(accessToken);
//     const userId = decoded.id;

//     // 🔥 Delete all device records for this user (logout from all devices)
//     await user_devices.destroy({ where: { user_id: userId } });

//     // Clear cookies
//     res.clearCookie("accessToken", { path: "/" });
//     res.clearCookie("authToken", { path: "/" });

//     const response = { status: 200, message: "Logged out from all devices", data: [] };
//     logger.success({ type: "LOGOUT_ALL", request: requestInfo, response }, ModuleName);
//     return res.json(response);

//   } catch (error) {
//     const response = { status: 500, message: error.message, data: [] };
//     logger.error({ type: "LOGOUT_ALL", request: requestInfo, response }, ModuleName);
//     return res.json(response);
//   }
// };



// // Social Login (Google / Apple) for web

// const oauthAdminLogin = async (req, res) => {
//   const requestInfo = logger.getRequestInfo(req);
//   const t = await sequelize.transaction();

//   try {
//     const {
//       device_type,
//       device_name,
//       os_type,
//       fcm_token
//     } = req.body;

//     /* ---------------- DEVICE VALIDATION ---------------- */

//     if (
//       !isNonEmptyString(device_type) ||
//       !isNonEmptyString(os_type) ||
//       !isNonEmptyString(device_name) ||
//       !isNonEmptyString(fcm_token)
//     ) {
//       const response = {
//         status: 400,
//         message: "Device details are required (device_type, os_type, device_name, fcm_token)",
//         data: []
//       };
//       logger.error({ type: "SOCIAL_LOGIN_CUSTOMER", request: requestInfo, response }, MODULE_NAME);
//       return res.json(response);
//     }

//     /* ---------------- USER FROM PASSPORT ---------------- */

//     const user = req.user; // 🔑 set by passport strategy

//     if (!user || user.is_active !== '1') {
//       const response = { status: 401, message: "User is inactive", data: [] };
//       logger.error({ type: "SOCIAL_LOGIN_CUSTOMER", request: requestInfo, response }, MODULE_NAME);
//       return res.json(response);
//     }

//     /* ---------------- ENSURE CUSTOMER EXISTS ---------------- */

//     let customer = await Customers.findOne({
//       where: { user_id: user.id, deleted_at: null }
//     });

//     if (!customer) {
//       customer = await Customers.create({
//         user_id: user.id,
//         full_name: user.name,
//         status: 'active'
//       }, { transaction: t });
//     }

//     /* ---------------- DEVICE UPSERT ---------------- */

//     let deviceRecord = await UserDevices.findOne({
//       where: {
//         user_id: user.id,
//         device_type,
//         os_type,
//         device_name,
//         deleted_at: null
//       }
//     });

//     if (deviceRecord) {
//       await deviceRecord.update(
//         { fcm_token, last_login_at: new Date(), status: '1' },
//         { transaction: t }
//       );
//     } else {
//       deviceRecord = await UserDevices.create({
//         user_id: user.id,
//         device_type,
//         device_name,
//         os_type,
//         fcm_token,
//         last_login_at: new Date(),
//         status: '1'
//       }, { transaction: t });
//     }

//     /* ---------------- GENERATE TOKEN ---------------- */

//     const token = await generateToken(user, deviceRecord.id);

//     const isProd = process.env.NODE_ENV === 'production';

//     res.cookie('customer_token', token, {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: isProd ? 'None' : 'Lax',
//       domain: isProd ? '.zesty-go.com' : undefined,
//       path: '/',
//       maxAge: TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
//     });

//     const hashedToken = await bcryptHash(token);

//     const tokenExpiresAt = new Date();
//     tokenExpiresAt.setDate(tokenExpiresAt.getDate() + TOKEN_EXPIRY_DAYS);

//     await UserDevices.update(
//       {
//         token: hashedToken,
//         token_expires_at: tokenExpiresAt
//       },
//       {
//         where: { id: deviceRecord.id },
//         transaction: t
//       }
//     );

//     await t.commit();

//     const response = {
//       status: 200,
//       message: "Social login successful",
//       data: {
//         user_id: user.id,
//         customer_id: customer.id,
//         token
//       }
//     };

//     logger.success({ type: "SOCIAL_LOGIN_CUSTOMER", request: requestInfo, response }, MODULE_NAME);
//     return res.json(response);

//   } catch (error) {
//     await t.rollback();
//     const response = { status: 500, message: error.message, data: [] };
//     logger.error({ type: "SOCIAL_LOGIN_CUSTOMER", request: requestInfo, response }, MODULE_NAME);
//     return res.json(response);
//   }
// };


// module.exports = {
//   login,
//   resendOTP,
//   verifyOTP,
//   refreshToken,
//   forgotPassword,
//   resetPassword,
//   adminResetPassword,
//   logout,
//   logoutAllDevices,
//   oauthAdminLogin
// }    


// const jwt = require('jsonwebtoken');
// const { users } = require('../../../models'); // your User model
// const bcrypt = require('bcrypt'); // if passwords are hashed

// const login = async (req, res) => {
//   const { email, password } = req.body;
//   if(!email || !passwprd){
//     return res.status(400).json({ status: 400, message:"Email and password are required", data: [] });
//   }

//   try {
//     const user = await users.findOne({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ status: 401, message: "User not found", data: [] });
//     }

//     // If password is hashed in DB
//     // const isMatch = await bcrypt.compare(password, user.password);
//     const isMatch = await bcrypt.compare(password, user.password_hash);

//     if (!isMatch) {
//       return res.status(401).json({ status: 401, message: "Invalid password", data: [] });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' } // 1 hour expiry
//     );

//     return res.json({
//       status: 200,
//       message: "Login successful",
//       data: { token }
//     });

//   } catch (error) {
//     return res.status(500).json({ status: 500, message: error.message, data: [] });
//   }
// };

// module.exports = { login };

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { users } = require('../../../models');

const login = async (req, res) => {
  console.log("BODY:",req.body);
  const { email, password } = req.body;
console.log(email);
  if (!email || !password) {
    return res.status(400).json({
      status: 400,
      message: "Email and password are required",
      data: []
    });
  } 

  try {
    const user = await users.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "User not found",
        data: []
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: "Invalid password", 
        data: []
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }  
    );

    return res.json({
      status: 200,
      message: "Login successful",
      data: { token }
    });

  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message,
      data: []
    });
  }
};

module.exports = { login };

