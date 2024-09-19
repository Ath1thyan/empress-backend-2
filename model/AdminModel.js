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
        }
    }]
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Admin", AdminSchema);