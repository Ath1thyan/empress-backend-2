import mongoose from "mongoose";

export const CabSchema = mongoose.Schema({
    make: {
        type: String,
    },
    model: {
        type: String,
    },
    year: {
        type: Number,
    },
    color: {
        type: String,
    },
    licensePlate: {
        type: String,
        unique: true,
    },
    fuelType: {
        type: String,
        enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Other'],
    },
    cabCategory: {
        type: String,
        enum: ['Sedan', 'Micro', 'Compact', 'Large', 'Hatchback', 'SUV', 'Truck', 'Minivan', 'VAN', 'Other']
    },
    cabType: {
        type: String,
        enum: ['Luxury', 'Standard']
    },
    seatingCapacity: {
        type: Number,
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
    rentPerKm: {
        type: Number,
        required: true,
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
        type: String
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