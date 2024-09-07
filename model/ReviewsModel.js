import mongoose from "mongoose";

export const ReviewsSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    title: {
        type: String,
        maxlength: 100
    },
    content: {
        type: String,
        maxlength: 1000
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    bookingType: {
        type: String,
        enum: ['LimosBooking', 'HospitalityBooking'], // Specify the type of booking
        required: true
    },
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Review", ReviewsSchema);