const Room = require("../models/room.schema");
const Game = require("../models/game.schema");

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

function createRoom(roomObject, nickname, numPlayers, socket, io) {
    const key = makeid(6);
    // const key = 1;
    // const host = nickname;
    if (!nickname) {
        socket.emit("joinError", "Username not provided");
        return;
    }
    const host = nickname;
    const users = [{ nickname: host }];
    const max_players = numPlayers;
    const newRoom = new Room({
        name: makeid(6),
        key: key,
        users: users,
        max_players: max_players,
        host: host,
    });
    newRoom.save().then(() => {
        socket.emit("roomCreated", newRoom);
        socket.emit("numPlayers", newRoom.users.length);
        socket.join(newRoom.name);
    });
}

function joinRoom(roomObject, socket, io) {
    Room.findOne({ name: roomObject.name, key: roomObject.key }).then(
        (room) => {
            if (!room) {
                socket.emit("joinError", "Room not found join rooom line 46");
            } else {
                // Check if user is already in the room
                const existingUser = room.users.find(
                    (user) => user.nickname === roomObject.nickname
                );
                if (existingUser) {
                    socket.emit("joinError", "Username already taken");
                } else {
                    room.users.push({ nickname: roomObject.nickname });
                    //update room
                    room.save().then(() => {
                        socket.join(room.name);
                        socket.emit("roomJoined", room);
                        io.to(room.name).emit("roomFound", room);
                        // emit numPlayers
                        io.to(room.name).emit("numPlayers", room.users.length);
                    });
                }
            }
        }
    );
}

async function reconnectRoom(roomObject, socket, io) {
    console.log("reconnect");
    await Room.findOne({ name: roomObject.name, key: roomObject.key }).then(
        (room) => {
            if (!room) {
                socket.emit("joinError", "Room not found reconnect line 75");
            } else {
                console.log("else");
                socket.join(room.name);

                //get game state
                console.log(room, "room");
                Game.findOne({ room: room._id }).then((game) => {
                    if (!game) {
                        console.log("not found");
                        socket.emit("gameError", "Game not found");
                    } else {
                        console.log("found", game);
                        socket.emit("gameStarted", game);
                        socket.emit("gameData", game);
                    }
                });
            }
        }
    );
}

function removeRoom(roomObject, socket, io) {
    Room.deleteOne({ name: roomObject.name, key: roomObject.key }).then(
        (room) => {
            if (!room) {
                socket.emit("joinError", "Room not found delete line 101");
            } else {
                socket.emit("roomRemoved", room);
            }
        }
    );
}

function removeUserFromRoom(roomObject, socket, io) {
    Room.findOne({ name: roomObject.name, key: roomObject.key }).then(
        (room) => {
            if (!room) {
                socket.emit("joinError", "Room not found remove user line 113");
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
                        io.to(room.name).emit("roomFound", room);
                        io.to(room.name).emit("numPlayers", room.users.length);
                    });
                }
            }
        }
    );
}

module.exports = {
    createRoom,
    joinRoom,
    removeRoom,
    removeUserFromRoom,
    reconnectRoom,
};
