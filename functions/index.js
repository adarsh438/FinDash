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

// ------------------------------------------------------------------
// AI Backend Layer
// This is where we would securely call OpenAI/Gemini without exposing keys.
// ------------------------------------------------------------------

// exports.askAICoach = functions.https.onCall(async (data, context) => {
//     // 1. Authentication Check
//     if (!context.auth) {
//         throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
//     }
//
//     // 2. Rate Limiting (Simple In-Memory or Firestore Counter)
//     // const userId = context.auth.uid;
//     // const isPremium = await checkUserPremiumStatus(userId);
//     // if (!isPremium && await hasExceededFreeLimit(userId)) {
//     //     throw new functions.https.HttpsError('resource-exhausted', 'Free limit reached. Upgrade for more.');
//     // }
//
//     // 3. Data Aggregation (Privacy Safety)
//     // The client sends aggregated stats, or we fetch them here from Firestore.
//     // Ideally, fetch here so client can't lie.
//     // const expenses = await fetchUserExpenses(userId);
//     // const summary = aggregateExpenses(expenses);
//
//     // 4. Prompt Engineering
//     // const systemPrompt = `You are a helpful financial coach...`;
//     // const userPrompt = `Here is the spending summary: ${JSON.stringify(summary)}. User Question: "${data.message}"`;
//
//     // 5. Call LLM (OpenAI / Gemini)
//     // const response = await openai.chat.completions.create({ ... });
//
//     // return { text: response.choices[0].message.content };
//
//     return { text: "This is a placeholder response from the secure backend." };
// });

// Helper placeholders
// async function checkUserPremiumStatus(uid) { return false; }
// async function hasExceededFreeLimit(uid) { return false; }

console.log("Cloud functions skeleton created. Uncomment to deploy.");
