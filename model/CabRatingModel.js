import mongoose from "mongoose";

export const CabRatingSchema = mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CabBooking",
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CabDriver",
        required: true,
    },
    driverRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    tripRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
    },
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("CabRating", CabRatingSchema);