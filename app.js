var app = require("express")();
require("dotenv").config();
// mongo db connection
require("./config/mongodb.config").sync;
var http = require("http").createServer(app);
var io = require("socket.io")(http);
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
require("./models/user.schema");
require("./models/room.schema");
require("./models/message.schema");
require("./models/card.schema");

const RoomController = require("./controllers/room.controller");
const GameController = require("./controllers/game.controller");

io.on("connection", function (socket) {
    socket.on("createRoom", function (name, nickname, numberPlayers) {
        RoomController.createRoom(name, nickname, numberPlayers, socket);
    });
    socket.on("joinRoom", function (name, key, username) {
        RoomController.joinRoom(name, key, username, socket);
    });
    socket.on("setNickname", function (name, key, nickname) {
        RoomController.setNickname(name, key, nickname, socket);
    });
    socket.on("startGame", function (name, key) {
        console.log("startGame");
        GameController.startGame(name, key, socket);
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
