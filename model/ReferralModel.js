import mongoose from "mongoose";

export const ReferralSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    referred: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true // to ensure no leading/trailing spaces
    },
    referralCount: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0,
        min: 0 // to ensure that points never go below 0
    }
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Referral", ReferralSchema);