import mongoose from "mongoose";

export const HospitalityBookingSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HospitalityService"
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider"
    },
    bookingFromDate: {
        type: String,
        required: true
    },
    bookingToDate: {
        type: String,
        required: true
    },
    bookingTime: {
        type: String,
        required: true
    },
    eventLocation: {
        type: String,
        required: true
    },
    eventDescription:{
        type: String,
        required: true
    },
    eventDuration: {
        type: String,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    accommodationType: {
        type: String,
        required: true,
        enum: ["single room", "double room", "family suite", "deluxe room", "penthouse suite", "villa", "apartment", "condo"]
    },
    accommodationDetails:{
        type: String,
        required: true
    },
    propertyDetails:{
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

export default mongoose.model("HospitalityBooking", HospitalityBookingSchema);