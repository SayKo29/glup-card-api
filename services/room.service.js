const mongoose = require("mongoose");
const Room = mongoose.model("Room");

exports.createRoom = function (name, numberPlayers) {
    const room = new Room({
        name: name,
        numberPlayers: numberPlayers,
    });
    return room.save();
};

exports.joinRoom;
