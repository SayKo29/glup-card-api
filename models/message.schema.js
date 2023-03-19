const mongoose = require("mongoose");

module.exports = mongoose.model(
    "message",
    new mongoose.Schema(
        {
            chatroom: {
                type: mongoose.Schema.Types.ObjectId,
                required: 'Chatroom is required',
                ref: 'Chatroom'
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                required: 'User is required',
                ref: 'User'
            },
            message: {
                type: String,
                required: 'message is required'
            },
        },
        {
            timestamps: true,
        }
            
    ),
    // collection
    "message"
);
