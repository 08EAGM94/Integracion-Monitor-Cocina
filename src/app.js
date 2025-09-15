import express from "express";
import path from "path";


const app = express();

//middleware
app.use(express.static(path.join(__dirname, "public")));
//

export default app;