import mongoose from "mongoose";

export const TicketsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ["open", "in-progress", "resolved", "closed"],
        default: "open",
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    serviceProvider: {
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
    attachments: [{
        type: String
    }],
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Ticket", TicketsSchema);