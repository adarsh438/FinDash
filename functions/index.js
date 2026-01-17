/**
 * Cloud Functions for Finance App
 * 
 * Deployment: firebase deploy --only functions
 * Running Locally: firebase emulators:start
 */

// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// const Razorpay = require("razorpay");

// admin.initializeApp();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

/**
 * Creates a Razorpay Order
 * Call this from the client to get an order ID.
 */
// exports.createPaymentOrder = functions.https.onCall(async (data, context) => {
//   if (!context.auth) {
//     throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
//   }

//   const amountInPaise = 49900; // ₹499.00

//   try {
//     const options = {
//       amount: amountInPaise,
//       currency: "INR",
//       receipt: `receipt_${context.auth.uid}_${Date.now()}`,
//       payment_capture: 1
//     };

//     const order = await razorpay.orders.create(options);

//     return {
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       keyId: process.env.RAZORPAY_KEY_ID 
//     };
//   } catch (error) {
//     console.error("Razorpay Order Error:", error);
//     throw new functions.https.HttpsError('internal', 'Failed to create order');
//   }
// });

/**
 * Handle Razorpay Webhooks
 * Verifies the signature and upgrades the user.
 */
// exports.verifyPaymentWebhook = functions.https.onRequest(async (req, res) => {
//   const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

//   // Verify signature logic here...

//   if (req.body.event === 'payment.captured') {
//     // Upgrade user logic
//     // const userId = req.body.payload.payment.entity.notes.userId;
//     // await admin.firestore().collection('users').doc(userId).update({ 
//     //   role: 'premium',
//     //   premiumActivatedAt: new Date().toISOString(),
//     //   premiumSource: 'razorpay'
//     // });
//   }

//   res.json({ status: 'ok' });
// });

// Placeholder until we install firebase-functions dependency
console.log("Cloud functions skeleton created.");
