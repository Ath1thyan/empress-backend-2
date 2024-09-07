import mongoose from "mongoose";

export const ConversationSchema = mongoose.Schema({
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Message"
    },
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Conversation", ConversationSchema);