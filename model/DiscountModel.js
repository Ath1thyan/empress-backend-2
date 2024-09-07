import mongoose from "mongoose";

export const DiscountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 200
    },
    percentage: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    validFrom: {
        type: String,
        required: true
    },
    validTo: {
        type: String,
        required: true
    },
    appliedTo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    bookingType: {
        type: String,
        enum: ['LimosBooking', 'HospitalityBooking'], // Specify the type of booking
        required: true
    },
    serviceProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
    },
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Discount", DiscountSchema);