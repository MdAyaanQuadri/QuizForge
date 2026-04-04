import express from "express"

import authRouter from "./routes/auth.routes.js";
import participantRouter from "./routes/participant.routes.js";
import questionRouter from "./routes/question.routes.js";
import quizRouter from "./routes/quiz.routes.js";

const app = express() ;

app.use(express.json())

app.get('/', async(req,res)=>{
    res.send("API IS RUNNING...")
})

app.use("/api/auth", authRouter);
app.use("/api/participants", participantRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/questions", questionRouter);


export default app ;
