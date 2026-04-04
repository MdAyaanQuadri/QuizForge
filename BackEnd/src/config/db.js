import mongoose  from "mongoose";
import { MONGO_URI } from "./env.js";

const mongoConnection = async ()=>{
    try {await mongoose.connect(MONGO_URI);
    console.log("MongoDb is connected");}
    catch(e){
        console.error("MONGODB not connected");
        console.error(e.message);
    }
}

export default  mongoConnection ;
