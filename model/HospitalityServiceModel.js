import mongoose from "mongoose";

export const HospitalityServiceSchema = new mongoose.Schema({
    serviceType: {
        type: String,
        required: true,
        enum: ["event planning", "sanitization", "accommodation", "travel and tourism", "catering", "housekeeping", "gardening", "landscaping", "pest control", "conference management", "laundry services", "security services", "rental stays", "maintenance services", "repair services"],
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider"
    },
    description: {
        type: String,
        maxlength: 1000
    },
    images: [String],
    videos: [String],
    premiumCategory: {
        type: String,
        required: true,
        enum: ["standard", "premium", "luxury"]
    },
    peopleCapacityRange: [{
        type: Number,
        min: 1,
        max: 1000000
    }],
    staffsCapacityRange: {
        type: Number,
        min: 1,
        max: 10000
    },
    serviceAvailableCities: [{
        type: String,
        required: true
    }],
    cancellationPolicy: {
        type: String,
    },
    price: {
        type: Number,
        min: 0
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
    }],
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "HospitalityBooking",
    }],
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("HospitalityService", HospitalityServiceSchema);