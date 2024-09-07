import mongoose from "mongoose";

export const LimosBookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LimosService"
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider"
    },
    bookingDate: {
        type: String,
        required: true
    },
    bookingTime: {
        type: String,
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    dropoffLocation: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending"
    },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid", "partial paid", "refunded"],
        default: "unpaid"
    },
    totalAmount: {
        type: Number,
        required: true
    },
    additionalCharges: {
        type: Number,
        default: 0
    },
    discounts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Discount"
    },
    notes:{
        type: String,
        maxlength: 1000
    },
    cancellationPolicy: {
        type: String,
        required: true
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("LimosBooking", LimosBookingSchema);