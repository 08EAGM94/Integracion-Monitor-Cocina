//import our express server instance
import app from "./app";
//import our testConnection function from db file
import { testConnection } from "./db";
//import env variable of the listening port from config file
import { PORT } from "./config";
//import the Server class from socket.io module renamed by "WebSocketServer"
import {Server as WebSocketServer} from "socket.io";
//import http instance from http module
import http from "http";
//import sockets function from sockets file
import sockets from "./sockets";
//call the asynchronous function testConnection to establish a connection to our sql server instance
testConnection();
//our Express instance (app) will be a function handler that we can supply to an HTTP server, that HTTP server is necessary to create our socket server instance  
const server = http.createServer(app);
const httpServer = server.listen(PORT, () =>{
    console.log(`_____________Server running on port ${PORT}________________`);
});
const io = new WebSocketServer(httpServer);
//our socket server instance will be use on our sockets file function.
sockets(io);
