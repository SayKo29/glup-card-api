const express = require("express");
const router = express.Router();

// chatroom routes

// get chatroom by id
router.get(
    "/chatrooms/:id",
    require("../controllers/chatroom.controller.js").findById
);

// message routes

// create new message
router.post(
    "/messages",
    require("../controllers/message.controller.js").newMessage
);
// read all message data
router.get(
    "/messages",
    require("../controllers/message.controller.js").getMessages
);

module.exports = router;
