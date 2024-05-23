const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    users: [
        {
            nickname: {
                type: String,
                required: true
            }
        }
    ],
    max_players: {
        type: Number,
        required: true
    },
    host: {
        type: String,
        required: true
    },
    gameIsStarted: {
        type: Boolean,
        required: true,
        default: false
    },
    numRounds: {
        type: Number,
        required: true,
        default: 5
    }
})

const Room = mongoose.model('Room', RoomSchema)

module.exports = Room
