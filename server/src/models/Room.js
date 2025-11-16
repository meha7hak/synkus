import mongoose from "mongoose";
const roomSchema = new mongoose.Schema({
    code: {type: String, required: true, unique: true},
    host:{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    mood:{type: String, default: "neutral"},
    autoDj: {type:Boolean, default:false},
    currentDevice:{type:String, default:null},
    isLive:{type:Boolean, default:true},
    guests: [{type:mongoose.Schema.Types.ObjectId, ref:"Guest"}],

},{timestamps:true})

export default mongoose.model("Room", roomSchema);