import mongoose from "mongoose";

export const CabPaymentSchema = mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CabBooking",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash', 'Stripe', 'GooglePay'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Failed'],
        default: 'Pending',
    },
    paymentDate: {
        type: String,
        required: true,
    },
    paymentTime: {
        type: String,
        required: true,
    },
    transactionId: {
        type: String,
    },
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("CabPayment", CabPaymentSchema);