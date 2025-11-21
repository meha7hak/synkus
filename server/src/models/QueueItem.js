import mongoose from "mongoose";
const queueItemSchema  = new mongoose.Schema({
    roomId: {type: mongoose.Schema.Types.ObjectId, ref:"Room", required: true},
    trackId:{type: String, required: true},
    title:{type: String, required: true},
    artists:{type:[String], required: true},
    images:{type: String},

    addedBy:{type: String }
}, {timestamps: true});
export default mongoose.model("QueueItem", queueItemSchema);