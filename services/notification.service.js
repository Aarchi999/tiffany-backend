const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-service-account.json");

// Initialize only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}


// const tokenData = await sendToSingleToken(
//   "eVVmTYTJc0MGlEZ-El64UA:APA91bGeY9arWFh4IqCjOrRWspty9ys8gjaNc2w_SsAtAL43cwCO2HWezpRhrWK77reoGLtobfhvcLgMwWPM5S7CXPn4tmEVdaEsX0XkwpEBNjZIQUni3ak",
//   'Login Successful',
//   'Welcome back! You have successfully logged in.',
//   { userId: 56, name: "Ajay", email: "parikhajay35@gmail.com" }
// );
// console.log(tokenData);

/** Send to a single FCM token */
const sendToSingleToken = async (token, title, body, data = {}) => {
  if (!token) return;
  return sendMessage({ tokens: [token], title, body, data });
};

/** Send to multiple tokens (recommended for user with multiple devices) */
const sendToMultipleTokens = async (tokens, title, body, data = {}) => {
  if (!tokens?.length) return;
  return sendMessage({ tokens, title, body, data });
};



/** Shared message sender - uses sendMulticast */
const sendMessage = async ({ tokens, title, body, data }) => {
  try {
    const message = {
      tokens,
      notification: { title, body },
      webpush: { notification: { icon: "/favicon.ico", title, body } },
      android: { notification: { sound: "default" } },
      apns: { payload: { aps: { sound: "default" } } },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    };

    console.log("Sending message:", JSON.stringify(message, null, 2));

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log("FCM Response:", response);

    // Optional: Remove invalid tokens
    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((r, i) => (!r.success ? tokens[i] : null))
        .filter(t => t);

      console.log("Invalid tokens:", failedTokens);
    }

    return response;
  } catch (error) {
    console.error("FCM send error:", error);
    throw error;
  }
};

module.exports = {
  sendToSingleToken,
  sendToMultipleTokens
};
