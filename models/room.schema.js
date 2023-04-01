const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
    users: [
        {
            nickname: {
                type: String,
                required: true,
            },
        },
    ],
    max_players: {
        type: Number,
        required: true,
    },
    host: {
        type: String,
        required: true,
    },
    game_started: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
