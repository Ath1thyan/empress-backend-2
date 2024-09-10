import mongoose from "mongoose";

export const CabSchema = mongoose.Schema({
    make: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true,
    },
    licensePlate: {
        type: String,
        required: true,
        unique: true,
    },
    fuelType: {
        type: String,
        required: true,
        enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Other'],
    },
    seatingCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    isWheelchairAccessible: {
        type: Boolean,
        default: false,
    },
    isPetsAllowed: {
        type: Boolean,
        default: false,
    },
    vehicleDocuments: [
        {
            type: String,
        }
    ],
    vehicleImages: [
        {
            type: String,
        }
    ],
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CabDriver",
        required: true,
    },
    tripStatus: {
        type: String,
        enum: ['Available', 'Booking Received', 'Booking Canceled', 'Trip Completed', 'Booking Accepted', 'On Trip'],
        default: 'Available',
    },
    bookings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CabBooking",
        }
    ]
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Cab", CabSchema);