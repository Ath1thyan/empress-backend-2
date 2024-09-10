import mongoose from "mongoose";

export const CabDriverSchema = mongoose.Schema({
    salutation: {
        type: String,
        enum: ['Mr', 'Ms', 'Dr', 'Prof', 'Mrs', ''],
        default: 'Mr'
    },
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: [true, "Email already registered"],
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    mobile: {
        type: String,
        required: false,
        minlength: 5,
        maxlength: 20,
        sparse: true
    },
    address: {
        type: String,
        minlength: 10,
        maxlength: 200
    },
    zipcode: {
        type: String,
        minlength: 5,
        maxlength: 10
    },
    profile: {
        type: String,
        default: "https://avatar.iran.liara.run/public/boy"
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cab",
        required: true
    },
    dutyStatus: {
        type: String,
        enum: ['Available', 'On Duty', 'Off Duty'],
        default: 'Available',
    },
    dutyTimings: {
        type: Array,
        required: true,
    },
    ratings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CabRating",
        }
    ]
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("CabDriver", CabDriverSchema);