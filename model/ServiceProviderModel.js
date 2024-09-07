import mongoose from "mongoose";

export const ServiceProviderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        enum: ["limos", "repair", "hospitality"],
        required: true,
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    documents: [{type: String}],
    lastLogin: {
        type: String,
        default: null
    },
}, {
    timestamps: true,
    versionKey: false,
})

export default mongoose.model("ServiceProvider", ServiceProviderSchema);