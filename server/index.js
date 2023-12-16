require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const socketIO = require("socket.io");
const io = socketIO(server);
const path = require("path");

let users = [];

app.use(express.static(path.resolve(__dirname, "../build")));
app.use(cors());

io.on("connection", (client) => {
    console.log("current users = ", users.length);
    
    client.on("new-user-joined", (data) => {
        if (data.name===null) return;

        users.push(data);
        client.broadcast.emit("user-joined", {users: users.map(u=>u.name),  name:data.name});

        console.log("current users = ", users.length);
    })

    client.on("send", data => {
        const user = users.find(user=> user.id===client.id);
        client.broadcast.emit("receive", { message: data.message, id:client.id, name:user.name});
    })

    client.on("disconnect", () => {

        const leftUser = users.find(user=> user.id===client.id);
        client.broadcast.emit("user-left", {name:leftUser?.name, users: users.map(u=>u.name)})
        users = users.filter(user=> user.id!==client.id);

        console.log("current users = ", users.length);
    })

});

server.listen(process.env.PORT, (req, res) => {
    console.log(`Server Started on ${process.env.REACT_APP_END_POINT}`);
})
