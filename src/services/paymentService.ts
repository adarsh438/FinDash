import { userService } from './userService';

export const paymentService = {
    // Mock checkout initiation
    initiateCheckout: async (userId: string) => {
        // In real Razorpay, this would call backend to create an order
        console.log(`[Mock Payment] Initiating checkout for ${userId}`);
        return {
            orderId: 'order_mock_' + Date.now(),
            amount: 49900, // ₹499.00
            currency: "INR"
        };
    },

    // Mock confirm payment (Simulates successful transaction)
    confirmPayment: async (userId: string, orderId: string) => {
        console.log(`[Mock Payment] Processing payment for order ${orderId}...`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate 90% success rate, 10% failure
        if (Math.random() > 0.9) {
            throw new Error("Payment failed (Simulated bank error)");
        }

        // Upgrade user
        console.log(`[Mock Payment] Payment successful. Upgrading user ${userId}...`);
        await userService.upgradeToPremium(userId, 'dev');

        return {
            success: true,
            transactionId: 'pay_mock_' + Date.now()
        };
    }
};
