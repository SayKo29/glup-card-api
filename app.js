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
require("./models/Cards");

// Controllers
const RoomController = require("./controllers/room.controller");
const GameController = require("./controllers/game.controller");

// Socket.io
io.on("connection", (socket) => {
    console.log("User connected");
    socket.on("createRoom", (name, nickname, numberPlayers) => {
        RoomController.createRoom(name, nickname, numberPlayers, socket, io);
    });
    socket.on("joinRoom", (name, key, username) => {
        RoomController.joinRoom(name, key, username, socket, io);
    });
    socket.on("startGame", (roomName, roomKey, host) => {
        GameController.startGame(roomName, roomKey, host, socket, io);
    });
    socket.on("selectedAnswer", (answer, roomObject, username) => {
        GameController.updateAnswersToHost(
            answer,
            roomObject,
            username,
            socket,
            io
        );
    });
    socket.on("votedAnswerHost", (answer, roomObject, username) => {
        GameController.voteHost(answer, roomObject, username, socket, io);
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
        // remove the user from the room and db
        RoomController.removeUserFromRoom(socket, io);
    });
});

http.listen(5001, function () {
    console.log("listening on *:5001 ");
});

module.exports = app;
