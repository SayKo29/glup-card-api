const Room = require("../models/room.schema");

let nanoid;
import("nanoid").then((module) => {
    nanoid = module.nanoid;
});

exports.createRoom = function (name, username, numberPlayers, socket) {
    let nanoKey = nanoid(5);
    console.log(name, username, numberPlayers);
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
            socket.username = username;

            // Obtener número de clientes conectados en la sala
            let numClients = socket.adapter.rooms.get(room.key).size;
            console.log("Number of players connected: " + numClients);
            // Emitir un mensaje de confirmación al cliente
            socket.emit("roomCreated", {
                name: room.name,
                key: room.key,
                numberPlayers: room.numberPlayers,
            });
            socket.emit("numPlayers", numClients);
            socket.emit("isCreator", "true");
        }
    });
};

exports.joinRoom = function (name, key, username, socket) {
    Room.findOne({ name: name, key: key }, function (err, foundRoom) {
        if (err) {
            console.log("Error al buscar la sala: " + err);
        } else if (!foundRoom) {
            console.log(
                "La sala " + name + " con la clave " + key + " no existe"
            );
            socket.emit("roomNotFound");
        } else {
            console.log(
                "El usuario " +
                    username +
                    " se ha unido a la sala " +
                    foundRoom.name +
                    " con la clave " +
                    foundRoom.key
            );

            // Unirse a la sala
            socket.emit("roomFound", {
                name: foundRoom.name,
                key: foundRoom.key,
                numberPlayers: foundRoom.numberPlayers,
            });
            socket.join(foundRoom.key);
            socket.room = foundRoom.key;
            socket.username = username;

            const room = socket.adapter.rooms.get(foundRoom.key);
            if (room) {
                const numPlayers = room.size;
                socket.to(foundRoom.key).emit("numPlayers", numPlayers);
                socket.emit("numPlayers", numPlayers);
                socket.emit("isCreator", "false");
            }
        }
    });
};

exports.setNickname = function (name, key, nickname, socket) {
    socket.setNickname = nickname;
    console.log("Nickname: " + socket.setNickname);
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
            socket.leave(key);
            socket.room = null;
            socket.username = null;

            // Emitir un mensaje de confirmación al cliente
            socket.emit("roomLeft", { room: room.name, key: room.key });

            // Obtener número de clientes conectados en la sala
            let numClients = socket.adapter.rooms.get(key).size;
            console.log("Number of players connected: " + numClients);
            socket.emit("numPlayers", numClients);
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
