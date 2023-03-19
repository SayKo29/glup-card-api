const Room = require("../models/room.schema");
let nanoid;
import("nanoid").then((module) => {
    nanoid = module.nanoid;
});
exports.createRoom = function (name, numberPlayers, socket) {
    let nanoKey = nanoid(5);
    const room = new Room({
        name: name,
        numberPlayers: numberPlayers,
        key: nanoKey,
    });
    room.save(function (err) {
        if (err) {
            console.log("Error al crear la sala: " + err);
        } else {
            console.log(
                "La sala con el nombre" +
                    room.name +
                    " con la clave" +
                    room.key +
                    " ha sido creada con éxito"
            );

            // Unirse a la sala
            socket.join(room.key);
            socket.room = room.key;
            socket.username = name;

            // Emitir un mensaje de confirmación al cliente
            socket.emit("roomCreated", {
                name: room.name,
                key: room.key,
                numberPlayers: room.numberPlayers,
            });
        }
    });
};

exports.joinRoom = function (name, key, socket) {
    Room.findOne({ name: name, key: key }, function (err, room) {
        if (err) {
            console.log("Error al buscar la sala: " + err);
        } else if (!room) {
            console.log(
                "La sala " + name + " con la clave " + key + " no existe"
            );
        } else {
            console.log(
                "El usuario " +
                    name +
                    " se ha unido a la sala " +
                    room.name +
                    " con la clave " +
                    room.key
            );

            // Unirse a la sala
            socket.join(room.key);
            socket.room = room.key;
            socket.username = name;

            // Emitir un mensaje de confirmación al cliente
            socket.emit("roomJoined", { room: room.name, key: room.key });
        }
    });
};

exports.leaveRoom = function (name, key, socket) {
    Room.findOne({ name: name, key: key }, function (err, room) {
        if (err) {
            console.log("Error al buscar la sala: " + err);
        } else if (!room) {
            console.log(
                "La sala " + name + " con la clave " + key + " no existe"
            );
        } else {
            console.log(
                "El usuario " +
                    name +
                    " ha abandonado la sala " +
                    room.name +
                    " con la clave " +
                    room.key
            );

            // Dejar la sala
            socket.leave(room.key);
            socket.room = null;
            socket.username = null;

            // Emitir un mensaje de confirmación al cliente
            socket.emit("roomLeft", { room: room.name, key: room.key });
        }
    });
};

exports.deleteRoom = function (name, key, socket) {
    Room.deleteOne({ name: name, key: key }, function (err) {
        if (err) {
            console.log("Error al eliminar la sala: " + err);
        } else {
            console.log(
                "La sala " +
                    name +
                    " con la clave " +
                    key +
                    " ha sido eliminada"
            );

            // Dejar la sala
            socket.leave(room.key);
            socket.room = null;
            socket.username = null;

            // Emitir un mensaje de confirmación al cliente
            socket.emit("roomDeleted", { room: room.name, key: room.key });
        }
    });
};
