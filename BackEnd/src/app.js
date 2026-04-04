import express from "express"

import authRouter from "./routes/auth.routes.js";

const app = express() ;

app.use(express.json())

app.get('/', async(req,res)=>{
    res.send("API IS RUNNING...")
})

app.use("/api/auth", authRouter);


export default app ;
