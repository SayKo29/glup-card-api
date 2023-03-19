const mongoose = require("mongoose");

module.exports = mongoose.model(
    "Chatroom",
    new mongoose.Schema(
        {
            name: {
                type: String,
                required: 'Name is required',
            }
           
        },
        {
            timestamps: true,
        }
            
    ),
    // collection
    "Chatroom"
);
