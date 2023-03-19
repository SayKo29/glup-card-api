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
require("./models/chatroom.schema");
require("./models/message.schema");

const Message = mongoose.model("message");
const User = mongoose.model("User");

io.use(async (socket, next) => {
    try {
        const { userId } = socket.handshake.query;
        const user = await User.findById(userId);
        if (!user) {
            return next(new Error("User not found"));
        }
        socket.userId = user;
        next();
    } catch (err) {}
});

io.on("connection", (socket) => {
    console.log("Connected: " + socket.userId);

    socket.on("disconnect", () => {
        console.log("Disconnected: " + socket.userId);
    });

    // join a room and send all messages in that room and populate user info message.user
    socket.on("joinRoom", async ({ chatroomId }) => {
        socket.join(chatroomId);
        try {
            const messages = await Message.find({ chatroom: chatroomId })
                .populate("user", "name")
                .sort({ createdAt: "asc" })
                .limit(100);
            socket.emit("allMessages", messages.reverse());
        } catch (err) {
            console.log(err);
        }
    });

    socket.on("leaveRoom", ({ chatroomId }) => {
        socket.leave(chatroomId);
        console.log("A user left chatroom: " + chatroomId);
    });

    //   recieve message from client and send to all users in chatroom
    socket.on("chatroomMessage", async ({ msg, chatroomId }) => {
        try {
            const user = await User.findById(socket.userId);
            const newMessage = new Message({
                user: user,
                message: msg,
                chatroom: chatroomId,
            });
            io.to(chatroomId).emit("newMessage", {
                message: msg,
                _id: newMessage._id,
                user: user,
                createdAt: newMessage.createdAt,
            });
            await newMessage.save();
        } catch (err) {
            console.log(err);
        }
    });
});

http.listen(5001, function () {
    console.log("listening on *:5001 ");
});

module.exports = app;
