import mongoose from "mongoose";
const guestSchema = new mongoose.Schema({
    nickname: String,
    roomId: {type:mongoose.Schema.Types.ObjectId, ref:"Room"},

},{timestamps:true});
export default mongoose.model("Guest", guestSchema);