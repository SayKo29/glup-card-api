const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    players: [
        {
            nickname: {
                type: String,
                required: true,
            },
            score: {
                type: Number,
                required: true,
                default: 0,
            },

            answerCards: {
                type: Array,
                required: true,
                default: [],
            },
        },
    ],
    host: {
        type: String,
        required: true,
    },
    questionsDeck: {
        type: Array,
        required: true,
    },
    answersDeck: {
        type: Array,
        required: true,
    },
    currentQuestion: {
        type: Object,
        required: true,
    },
    currentAnswers: {
        type: Array,
        required: true,
    },
    playersAnswers: {
        type: Array,
        required: true,
    },
    currentRound: {
        type: Number,
        required: true,
        default: 0,
    },
    maxRounds: {
        type: Number,
        required: true,
        default: 10,
    },
    isGameOver: {
        type: Boolean,
        required: true,
        default: false,
    },
    gameIsStarted: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const Game = mongoose.model("Game", GameSchema);

module.exports = Game;
