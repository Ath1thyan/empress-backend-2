import mongoose from "mongoose";

export const AdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['LimosAdmin', 'RepairAdmin', 'HospitalityAdmin', 'SuperAdmin'],
        required: true,
    },
    isSuperAdmin: {
        type: Boolean,
        default: false,
    },
    sessions: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
        lastUsedAt: {
            type: Date,
            default: Date.now,
        },
        ipAddress: String,
        userAgent: String,
        browser: String,
        os: String,
        device: String,
        location: {
            type: Object,
            coordinates: [Number],
            city: String,
            region: String,
            country: String,
            zipcode: String,
            timezone: String,
        },
        deviceType: String,
        deviceBrand: String,
        deviceModel: String,
        deviceScreenSize: String,
        deviceOperatingSystem: String,
    }]
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Admin", AdminSchema);