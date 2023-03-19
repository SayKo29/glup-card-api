var app = require("express")();
require("dotenv").config();
// mongo db connection
require("./config/mongodb.config").sync;
var http = require("http").createServer(app);
var io = require("socket.io")(http);
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
const mongoose = require("mongoose");
require("./models/user.schema");
require("./models/room.schema");
require("./models/message.schema");

const Room = mongoose.model("Room");
const RoomController = require("./controllers/room.controller");

io.on("connection", function (socket) {
    console.log("a user connected");
    socket.on("createRoom", function (name, numberPlayers) {
        RoomController.createRoom(name, numberPlayers, socket);
    });
    socket.on("joinRoom", function (name, key) {
        RoomController.joinRoom(name, key, socket);
    });
    socket.on("leaveRoom", function (name, key) {
        RoomController.leaveRoom(name, key, socket);
    });
    socket.on("deleteRoom", function (name, key) {
        RoomController.deleteRoom(name, key, socket);
    });
    socket.on("disconnect", function () {
        console.log("user disconnected");
    });
});

http.listen(5001, function () {
    console.log("listening on *:5001 ");
});

module.exports = app;
