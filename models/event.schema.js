const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Event",
    new mongoose.Schema(
        {
            name: {
                type: String,
                default: null,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            category: {
                type: String,
                default: "Sport",
                required: false,
            },
            latitude: {
                type: String,
                required: true,
            },
            longitude: {
                type: String,
                required: true,
            },
            images: {
                type: Array,
                default: [],
                required: false,
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            participants: {
                type: Array,
                default: [],
                required: false,
            },
            chatroom: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Chatroom",
                required: false,
            },
            startDate: {
                type: Date,
                required: true,
            },
            endDate: {
                type: Date,
                required: true,
            }
        },
        {
            timestamps: true,
        }
    ),
    // collection
    "events"
);
