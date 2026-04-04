
import app from "./src/app.js"

import mongoConnection from "./src/config/db.js"

import { PORT } from "./src/config/env.js";

const START_SERVER = async () => {
    try {
        await mongoConnection();
        app.listen(PORT, () => {
            console.log(`server has started on port:${PORT}`);
        })
    }
    catch(e){
        console.error(`somethinf went wrong ${e.message}`)
    }
}
START_SERVER();