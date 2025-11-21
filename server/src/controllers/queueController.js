import axios from "axios";
import Room from "../models/Room.js";
import User from "../models/User.js";
import refreshSpotifyToken from "../utils/refreshSpotifyToken.js";
import QueueItem from "../models/QueueItem.js";

export const searchSongs = async(req,res) => {
    const {query, roomCode} = req.query;
    if(!query) return res.status(400).json({error:"Search Query is required"});

    try{

        const room = await Room.findOne({code: roomCode});
        if(!room) return res.status(400).json({error: "Room not found by Code"});

        let host = await User.findById(room.host);
        if(!host) return res.status(400).json({error:"Host not found by Id"});

        let accessToken = host.accessToken;

        let result;
        try{
            const result = await axios.get(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`
                  }
                }
              );    
        }catch(err){
            if (err.response?.status===401){
                console.log("AccessToken Required. Refreshing token ...........");

                const refreshed = await refreshSpotifyToken(host.refreshToken);

                host.refreshToken= refreshed.access_token;
                await host.save();

                accessToken = refreshed.access_token;

                result = await axios.get(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
            }else{
                throw err;
        }
        }   
        const tracks = result.data.tracks.items.map(item=>({
            trackId : item._id,
            title: item.name,
            artists: item.artists.map(a => a.name),
            images :item.album.images[0]?.url|| null
        }));

        return res.json({results: tracks});

    }catch(err){
        console.error("searchSongs error :  ", err.response?.data|| err.message);
        return res.status(500).json({error: "Search Failed"});
    }};

    export const addToQueue =  async (req,res )=>{
        const {roomCode, trackId, title, artists, image, addedBy} = req.body;

        if(!roomCode || !trackId || !title) return res.status(500).json({error: "Missing Fields"});

        try{
            const room= await Room.findOne({code:roomCode});

            if(!room) return res.status(500).json({error: "room not found in addToQueue"});

            const item = await QueueItem.create(
                {
                    roomId: room._id,
                    title,
                    trackId,
                    artists,
                    image,
                    addedBy
                }
            );
            return res.status(400).json({success: true, queueItem :  item})
        }catch(err){
            console.error("addToQueue error: ", err.message);
            return res.status(500).json({error: "Error in adding to queue"});
        }
    };