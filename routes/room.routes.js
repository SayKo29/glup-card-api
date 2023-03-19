const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");

router.post("/createRoom", function (req, res) {
    const name = req.body.name;
    const numberPlayers = req.body.numberPlayers;
    roomController.createRoom(name, numberPlayers, req.app.io.sockets);
    res.send("Sala creada");
});

router.post("/joinRoom", function (req, res) {
    const name = req.body.name;
    const key = req.body.key;
    roomController.joinRoom(name, key, req.app.io.sockets);
    res.send("Sala unida");
});

module.exports = router;
