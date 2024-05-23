const Room = require('../models/room.schema')
const Game = require('../models/game.schema')

function makeid (length) {
    let result = ''
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        )
    }
    return result
}

function createRoom (gameOptions, socket, io) {
    const key = makeid(6)
    // const key = 1;
    // const host = nickname;
    if (!gameOptions.user) {
        socket.emit('joinError', 'Username not provided')
        return
    }
    const host = gameOptions.user
    const users = [{ nickname: host }]
    const max_players = gameOptions.numPlayers
    const newRoom = new Room({
        name: makeid(6),
        key,
        users,
        max_players,
        host,
        numRounds: gameOptions.numRounds ? gameOptions.numRounds : 5
    })

    newRoom.save().then(() => {
        socket.emit('roomCreated', newRoom)
        socket.emit('numPlayers', newRoom.users.length)
        socket.join(newRoom.name)
    })
}

function joinRoom (roomObject, socket, io) {
    Room.findOne({ name: roomObject.name, key: roomObject.key }).then(
        (room) => {
            if (!room) {
                socket.emit('joinError', 'Room not found join rooom line 46')
            } else {
                // Check if user is already in the room
                const existingUser = room.users.find(
                    (user) => user.nickname === roomObject.nickname
                )
                if (existingUser) {
                    socket.emit('joinError', 'Username already taken')
                } else {
                    room.users.push({ nickname: roomObject.nickname })
                    // update room
                    room.save().then(() => {
                        socket.join(room.name)
                        socket.emit('roomJoined', room)
                        io.to(room.name).emit('roomFound', room)
                        // emit numPlayers
                        io.to(room.name).emit('numPlayers', room.users.length)
                    })
                }
            }
        }
    )
}
function leaveRoom (roomObject, socket, io) {
    Room.findOne({ name: roomObject?.name, key: roomObject?.key }).then((room) => {
        if (!room) {
            socket.emit('leaveError', 'No se ha podido salir de la sala')
        } else {
            // Busca al usuario que se va a eliminar
            const userToRemoveIndex = room.users.findIndex(
                (user) => user.nickname === roomObject.nickname
            )

            if (userToRemoveIndex !== -1) {
                // Elimina al usuario del array de usuarios de la sala
                room.users.splice(userToRemoveIndex, 1)

                // Guarda los cambios en la base de datos si es necesario
                room.save().then((updatedRoom) => {
                    // Emite un evento para actualizar el numero de usuarios conectados en la sala
                    io.to(room.name).emit('numPlayers', updatedRoom.users.length)
                })
            } else {
                // El usuario no fue encontrado en la sala
                socket.emit('leaveError', 'Usuario no encontrado en la sala')
            }
        }
    })
}

async function reconnectRoom (roomObject, socket, io) {
    await Room.findOne({ name: roomObject.name, key: roomObject.key }).then(
        (room) => {
            if (!room) {
                socket.emit('joinError', 'Room not found reconnect line 75')
            } else {
                socket.join(room.name)

                // get game state
                Game.findOne({ room: room._id }).then((game) => {
                    if (!game) {
                        socket.emit('gameError', 'Game not found')
                    } else {
                        socket.emit('gameStarted', game)
                        socket.emit('gameData', game)
                    }
                })
            }
        }
    )
}

function reconnectGame (roomObject, socket, io) {
    // buscar el juego en la base de datos y emitirlo al usuario
    Room.findOne({ name: roomObject.name, key: roomObject.key }).then(
        (room) => {
            if (!room) {
                socket.emit('joinError', 'Room not found reconnect line 75')
            } else {
                Game.findOne({ room: room._id }).then((game) => {
                    if (!game) {
                        socket.emit('gameError', 'Game not found')
                    } else {
                        socket.emit('gameStarted', game)
                        socket.emit('gameData', game)
                    }
                })
            }
        }
    )
}

function removeRoom (roomObject, socket, io) {
    Room.deleteOne({ name: roomObject.name, key: roomObject.key }).then(
        (room) => {
            if (!room) {
                socket.emit('joinError', 'Room not found delete line 101')
            } else {
                socket.emit('roomRemoved', room)
            }
        }
    )
}

module.exports = {
    createRoom,
    joinRoom,
    removeRoom,
    reconnectRoom,
    leaveRoom,
    reconnectGame
}
