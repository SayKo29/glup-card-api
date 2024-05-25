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
const httpServer = createServer(app);
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
    socket.on("createRoom", (gameOptions) => {
        console.log("createRoom", gameOptions);
        RoomController.createRoom(gameOptions, socket, io);
    });
    socket.on("joinRoom", (roomObject) => {
        RoomController.joinRoom(roomObject, socket, io);
    });
    socket.on("leaveRoom", (roomObject) => {
        console.log("leave", roomObject)
        RoomController.leaveRoom(roomObject, socket, io);
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
    socket.on("getCurrentGameState", (roomObject, username) => {
        GameController.getCurrentGameState(roomObject, username, socket, io);
    });
    socket.on("votedAnswerHost", (answer, roomObject) => {
        console.log("votedAnswerHost", answer);
        GameController.voteHost(answer, roomObject, socket, io);
    });

    socket.on("reconnectGame", (roomObject) => {
        RoomController.reconnectGame(roomObject, socket, io);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// env port
const port = process.env.PORT || 5000;

httpServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
