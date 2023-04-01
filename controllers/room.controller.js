const Room = require("../models/room.schema");

function makeid(length) {
    var result = "";
    var characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

function createRoom(name, nickname, numberPlayers, socket, io) {
    // const key = makeid(6);
    const key = 1;
    // const host = nickname;
    console.log(numberPlayers);
    const host = nickname;
    const users = [{ nickname: nickname }];
    const max_players = numberPlayers;
    const newRoom = new Room({
        name: 1,
        key: key,
        users: users,
        max_players: max_players,
        host: host,
    });
    newRoom.save().then(() => {
        socket.emit("roomCreated", newRoom);
        socket.emit("numPlayers", newRoom.users.length);
        socket.join(newRoom.key);
    });
}

function joinRoom(name, key, username, socket, io) {
    Room.findOne({ name: name, key: key }).then((room) => {
        if (!room) {
            socket.emit("joinError", "Room not found");
        } else {
            // Check if user is already in the room
            const existingUser = room.users.find(
                (user) => user.nickname === username
            );
            if (existingUser) {
                socket.emit("joinError", "Username already taken");
            } else {
                room.users.push({ nickname: username });
                //update room
                room.save().then(() => {
                    socket.join(room.key);
                    socket.emit("roomJoined", room);
                    io.to(room.key).emit("roomFound", room);
                    // emit numPlayers
                    io.to(room.key).emit("numPlayers", room.users.length);
                });
            }
        }
    });
}

function removeRoom(name, key, socket, io) {
    Room.deleteOne({ name: name, key: key }).then((room) => {
        if (!room) {
            socket.emit("joinError", "Room not found");
        } else {
            socket.emit("roomRemoved", room);
        }
    });
}

function removeUserFromRoom(name, key, username, socket, io) {
    Room.findOne({ name: name, key: key }).then((room) => {
        if (!room) {
            socket.emit("joinError", "Room not found");
        } else {
            const userIndex = room.users.findIndex(
                (user) => user.nickname === username
            );
            if (userIndex === -1) {
                socket.emit("joinError", "User not found");
            } else {
                room.users.splice(userIndex, 1);

                if (room.host === username) {
                    // If the removed user is the host, then assign host role to the next user in the list
                    if (room.users.length > 0) {
                        room.host = room.users[0].nickname;
                    }
                }

                room.save().then(() => {
                    socket.leave(room.key);
                    socket.emit("userRemoved", room);
                    io.to(room.key).emit("roomFound", room);
                    io.to(room.key).emit("numPlayers", room.users.length);
                });
            }
        }
    });
}

module.exports = {
    createRoom,
    joinRoom,
    removeRoom,
    removeUserFromRoom,
};
