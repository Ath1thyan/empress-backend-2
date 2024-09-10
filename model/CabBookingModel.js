import mongoose from "mongoose";

export const CabBookingSchema = mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CabDriver",
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cab",
        required: true,
    },
    passangersCount: {
        type: Number,
        required: true,
    },
    tripInstructionsByCustomer: {
        type: String,
    },
    pickupLocation: {
        type: String,
        required: true,
    },
    dropoffLocation: {
        type: String,
        required: true,
    },
    pickupDate: {
        type: Date,
        required: true,
    },
    pickupTime: {
        type: String,
        required: true,
    },
    dropoffDate: {
        type: Date,
        required: true,
    },
    dropoffTime: {
        type: String,
        required: true,
    },
    bookingStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Canceled', 'Completed'],
        default: 'Pending',
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    payments: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CabPayment",
        required: true,
    },
    ratings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CabRating",
        }
    ],
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("CabBooking", CabBookingSchema);