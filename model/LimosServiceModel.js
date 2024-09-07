import mongoose from "mongoose";

export const LimosServiceSchema = new mongoose.Schema({
    serviceType: {
        type: String,
        required: true,
        enum: ["car rental", "wedding cars", "ambulance service", "caravan", "dodge", "boat", "yacht", "catamaran", "jet", "sailing boat", "motor boat", "cruise", "trucks", "tankers", "pickups", "flights"]
    },
    premiumCategory: {
        type: String,
        required: true,
        enum: ["standard", "premium", "luxury"]
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider"
    },
    description: {
        type: String,
        maxlength: 1000
    },
    price: {
        type: Number,
        min: 0
    },
    serviceAvailableCities: [{
        type: String,
        required: true
    }],
    serviceAvailableDays: [{
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }],
    serviceAvailableHours: {
        type: String,
        enum: ["Morning", "Afternoon", "Evening", "Night"]
    },
    isAvail24x7: {
        type: Boolean,
        default: false
    },
    isAvailableNow: {
        type: Boolean,
        default: true
    },
    vehicleDetails: {
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
        fuelType: {
            type: String,
        },
        transmission: {
            type: String,
        },
        doors: {
            type: Number,
        },
        seats: {
            type: Number,
        },
        airConditioning: {
            type: Boolean,
            default: false
        },
        cruiseControl: {
            type: Boolean,
            default: false
        },
        navigationSystem: {
            type: Boolean,
            default: false
        },
        soundSystem:{
            type: Boolean,
            default: false
        },
        entertainmentSystem: {
            type: Boolean,
            default: false
        },
        heatingSystem: {
            type: Boolean,
            default: false
        },
        bluetoothConnectivity: {
            type: Boolean,
            default: false
        },
        isInternetAvailable: {
            type: Boolean,
            default: false
        }
    },
    peopleCapacity: {
        type: Number,
        min: 0,
        max: 1000
    },
    cargoCapacity: {
        type: Number,
        min: 0,
        max: 1000000
    },
    cargoType: {
        type: String,
    },
    images: [String],
    videos: [String],
    canCarryFragile: {
        type: Boolean,
        default: false
    },
    isPetsAllowed: {
        type: Boolean,
        default: false
    },
    isSmokingAllowed: {
        type: Boolean,
        default: false
    },
    isChildrenAllowed: {
        type: Boolean,
        default: false
    },
    isWheelchairAccessible: {
        type: Boolean,
        default: false
    },
    isInfantsAllowed: {
        type: Boolean,
        default: false
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
    }],
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "LimosBooking",
    }]
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("LimosService", LimosServiceSchema);