import mongoose from "mongoose";

export const PaymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    bookingType: {
        type: String,
        enum: ['LimosBooking', 'HospitalityBooking'], // Specify the type of booking
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["paypal", "stripe", "credit card"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    notes: {
        type: String,
        maxlength: 1000
    },
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Payment", PaymentSchema);