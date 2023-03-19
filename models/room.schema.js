const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Room",
    new mongoose.Schema(
        {
            name: {
                type: String,
                default: null,
                required: true,
            },
            key: {
                type: String,
                required: true,
            },
            numberPlayers: {
                type: Number,
            },
        },
        {
            timestamps: true,
        }
    ),
    // collection
    "Room"
);
