var app = require("express")();
require("dotenv").config();
// mongo db connection
require("./config/mongodb.config").sync;
const { createServer } = require("http");
const { Server } = require("socket.io");

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
require("./models/user.schema");
require("./models/room.schema");
require("./models/Cards");
const httpServer = createServer();
const io = new Server(httpServer, {
    connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 2 * 60 * 1000,
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
    },
});

// Controllers
const RoomController = require("./controllers/room.controller");
const GameController = require("./controllers/game.controller");

// Socket.io
io.on("connection", (socket) => {
    console.log("User connected");
    socket.on("createRoom", (roomObject, nickname, numPlayers) => {
        RoomController.createRoom(roomObject, nickname, numPlayers, socket, io);
    });
    socket.on("joinRoom", (roomObject) => {
        RoomController.joinRoom(roomObject, socket, io);
    });
    socket.on("reconnectRoom", (roomObject) => {
        RoomController.reconnectRoom(roomObject, socket, io);
    });
    socket.on("startGame", (roomObject, host) => {
        GameController.startGame(roomObject, host, socket, io);
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
    socket.on("votedAnswerHost", (answer, roomObject) => {
        GameController.voteHost(answer, roomObject, socket, io);
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
        // remove the user from the room and db
        // RoomController.removeUserFromRoom(socket, io);
    });
});

// env port
const port = process.env.PORT;

httpServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

module.exports = app;
