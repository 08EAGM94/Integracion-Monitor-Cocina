import app from "./app";
import { testConnection } from "./db";
import { PORT } from "./config";
import {Server as websocketServer} from "socket.io";
import http from "http";
import sockets from "./sockets";

testConnection();
const server = http.createServer(app);
const httpServer = server.listen(PORT, () =>{
    console.log(`_____________Server running on port ${PORT}________________`);
});
const io = new websocketServer(httpServer);
sockets(io);
