import Room from "../models/Room.js";
import Guest from "../models/Guest.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";
//Creating the room to play songs
export const createRoom = async (req,res)=>{
    try{
        const host = req.user._id;
        const code = generateRoomCode();
        
        const room = await Room.create({
            code,
            host,
        });
        return res.json({success: true, room});
    }catch(err){
        console.error("CreateRoom error", err.message);
    }
};

//joining room
export const joinRoom = async(req,res)=>{
    const{code, nickname}= req.body;
    try{
        const room = await Room.findOne({code});

        if(!room) return res.status(404).json({error:"Room not found"});

        const guest = await Guest.create({nickname, roomId : room._id});
        room.guests.push(guest._id);
        await room.save();

        return res.json({success:true, room, guest});
    }catch(err){
        console.error("joinRoom error", err.message);
        return res.status(500).json({error:"Failed to join Room"});
    }
};
export const getRoomInfo = async(req,res)=>{
    const code =  req.params.code;
    try{
        const room= await Room.findOne({code})
        .populate("host", "displayName email")
        .populate("guests", "nickname")

        if(!room) return res.status(404).json({error:"Room Not Found"});
        return res.json(room);
    }catch(err)
    {
        console.error("getRoomInfo Error", err.message);

        return res.status(500).json({error: "Failed to Fetch Room"});
    }
};