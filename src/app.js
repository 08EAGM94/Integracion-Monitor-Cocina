import express from "express";
//The node:path module provides utilities for working with file and directory paths
import path from "path";

//express() is a top-level function exported by the express module in Node.js used to create an Express application instance.
const app = express();

//middleware
//The app.use() function is used to mount middleware functions or routers to a specified path in the application's request-processing pipeline.
//The path.join() method joins all given path segments together using the platform-specific separator as a delimiter, then normalizes the resulting path.
//__dirname: It provides the absolute path to the directory of the current file
app.use(express.static(path.join(__dirname, "public")));
//

export default app;
