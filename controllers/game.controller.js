// Path: controllers\game.controller.js

const QuestionsDeck = require("../models/QuestionsDeck");
const AnswersDeck = require("../models/AnswersDeck");

let games = {};

exports.startGame = async function (name, key, socket, io) {
    const gameKey = `${name}-${key}`;

    if (games[gameKey]) {
        socket.emit("errorMessage", "Game already exists");
        return;
    }

    // Create a new game
    const game = {
        players: [],
        host: null,
        currentQuestion: null,
        currentAnswers: [],
        playerAnswers: {},
        scores: {},
        maxScore: 10,
        winningPlayers: [],
        isGameOver: false,
    };

    // Add game to games object
    games[gameKey] = game;

    // Create a new deck of questions and answers
    const questionDeck = new QuestionsDeck();
    const answersDeck = new AnswersDeck();

    // Get cards from the database and add them to the decks
    await questionDeck.getCards(1);
    await answersDeck.getCards(2);

    // Shuffle decks
    questionDeck.shuffle();
    answersDeck.shuffle();

    // Assign host
    game.host = socket.id;

    // push all players to game.players
    // console.log(socket.adapter.rooms.get(key), "socket.adapter.rooms.get(key)");
    // game.players = socket.adapter.rooms.get(key);

    // enviar a todos los jugadores del room el evento gameStarted
    socket.emit("gameStarted");
    socket.to(key).emit("gameStarted");

    // Send game data to host
    socket.emit("gameData", {
        players: game.players,
        host: game.host,
        currentQuestion: game.currentQuestion,
        currentAnswers: game.currentAnswers,
        playerAnswers: game.playerAnswers,
        scores: game.scores,
        maxScore: game.maxScore,
        winningPlayers: game.winningPlayers,
        isGameOver: game.isGameOver,
    });

    // Initialize current player index to 0
    let currentPlayerIndex = 0;

    // Emit question to host
    game.currentQuestion = questionDeck.drawCard();
    socket.emit("newQuestion", game.currentQuestion);

    // Emit different answers to host
    const usersSet = socket.adapter.rooms.get(key);
    const usersArray = Array.from(usersSet); // convierte el objeto Set a un array
    const usersObj = {}; // crea un objeto vacío para almacenar los usuarios

    usersArray.forEach((socketId) => {
        console.log(socketId, "socketId");
        console.log(io.of("/").sockets.get(socketId), "socket.sockets");
        let userSocket = io.of("/").sockets.get(socketId);
        // const userSocket = socket.sockets.get(socketId);
        usersObj[socketId] = userSocket.username; // agrega el socketId y el username del usuario al objeto
    });

    // console.log(usersObj); // logs el objeto con todos los usuarios en la sala
    // recorre el objeto y envia a cada usuario el evento newAnswers con sus respectivas  cartas
    for (const socketId in usersObj) {
        console.log(socketId, "socketId");
        io.to(socketId).emit("newAnswers", answersDeck.drawCards(4));
    }

    socket.on("sendAnswer", (answer) => {
        //get info all players of room
        const players = socket.adapter.rooms.get(key);
    });

    // Update current player index to point to next player
    currentPlayerIndex = (currentPlayerIndex + 1) % game.players.length;

    // host choose who win a point
    socket.on("chooseWinner", (winner) => {
        if (Object.keys(game.playerAnswers).length === game.players.length) {
            calculateScores(game);
            socket.emit("scores", game.scores);
            socket.broadcast.emit("scores", game.scores);

            // Check if game is over
            if (game.maxScore >= 10) {
                endGame(game, socket);
            } else {
                // Otherwise, continue to next round
                game.currentQuestion = questionDeck.drawCard();
                game.currentAnswers = answersDeck.drawCards(4);
                game.playerAnswers = {};
                socket.emit("newQuestion", game.currentQuestion);
                socket.emit("newAnswers", game.currentAnswers);
                socket.broadcast.emit("newAnswers", game.currentAnswers);

                // Send updated game data to all players
                socket.emit("gameData", {
                    players: game.players,
                    host: game.host,
                    currentQuestion: game.currentQuestion,
                    currentAnswers: game.currentAnswers,
                    playerAnswers: game.playerAnswers,
                    scores: game.scores,
                    maxScore: game.maxScore,
                    winningPlayers: game.winningPlayers,
                    isGameOver: game.isGameOver,
                });
                socket.broadcast.emit("gameData", {
                    players: game.players,
                    host: game.host,
                    currentQuestion: game.currentQuestion,
                    currentAnswers: game.currentAnswers,
                    playerAnswers: game.playerAnswers,
                    scores: game.scores,
                    maxScore: game.maxScore,
                    winningPlayers: game.winningPlayers,
                    isGameOver: game.isGameOver,
                });
            }
        }
    });

    const calculateScores = (game) => {
        // Calculate scores
        for (let playerId in game.playerAnswers) {
            const playerAnswers = game.playerAnswers[playerId];
            const playerScore = playerAnswers.reduce((acc, answer) => {
                return acc + answer.score;
            }, 0);
            game.scores[playerId] = playerScore;
            if (playerScore > game.maxScore) {
                game.maxScore = playerScore;
            }
        }
    };

    const endGame = (game, socket) => {
        // Set game to over
        game.isGameOver = true;

        // Find winning players
        for (let playerId in game.scores) {
            if (game.scores[playerId] === game.maxScore) {
                game.winningPlayers.push(playerId);
            }
        }

        // Send updated game data to all players
        socket.emit("gameData", {
            players: game.players,
            host: game.host,
            currentQuestion: game.currentQuestion,
            currentAnswers: game.currentAnswers,
            playerAnswers: game.playerAnswers,
            scores: game.scores,
            maxScore: game.maxScore,
            winningPlayers: game.winningPlayers,
            isGameOver: game.isGameOver,
        });
        socket.broadcast.emit("gameData", {
            players: game.players,
            host: game.host,
            currentQuestion: game.currentQuestion,
            currentAnswers: game.currentAnswers,
            playerAnswers: game.playerAnswers,
            scores: game.scores,
            maxScore: game.maxScore,
            winningPlayers: game.winningPlayers,
            isGameOver: game.isGameOver,
        });
    };

    // Listen for player disconnection
    socket.on("disconnect", () => {
        // Remove player from game
        const index = game.players.indexOf(socket.id);
        if (index > -1) {
            game.players.splice(index, 1);
            delete game.scores[socket.id];
            delete game.playerAnswers[socket.id];

            // Check if host left and reassign host if necessary
            if (socket.id === game.host) {
                game.host = game.players[0];
            }

            // Send updated game data to all players
            socket.emit("gameData", {
                players: game.players,
                host: game.host,
                currentQuestion: game.currentQuestion,
                currentAnswers: game.currentAnswers,
                playerAnswers: game.playerAnswers,
                scores: game.scores,
                maxScore: game.maxScore,
                winningPlayers: game.winningPlayers,
                isGameOver: game.isGameOver,
            });
            socket.broadcast.emit("gameData", {
                players: game.players,
                host: game.host,
                currentQuestion: game.currentQuestion,
                currentAnswers: game.currentAnswers,
                playerAnswers: game.playerAnswers,
                scores: game.scores,
                maxScore: game.maxScore,
                winningPlayers: game.winningPlayers,
                isGameOver: game.isGameOver,
            });

            // If no players left, delete game
            if (game.players.length === 0) {
                delete games[gameKey];
            }
        }
    });

    socket.on("reconnect", () => {
        // Add player back to game
        game.players.push(socket.id);

        // Send updated game data to all players
        socket.emit("gameData", {
            players: game.players,
            host: game.host,
            currentQuestion: game.currentQuestion,
            currentAnswers: game.currentAnswers,
            playerAnswers: game.playerAnswers,
            scores: game.scores,
            maxScore: game.maxScore,
            winningPlayers: game.winningPlayers,
            isGameOver: game.isGameOver,
        });
        socket.broadcast.emit("gameData", {
            players: game.players,
            host: game.host,
            currentQuestion: game.currentQuestion,
            currentAnswers: game.currentAnswers,
            playerAnswers: game.playerAnswers,
            scores: game.scores,
            maxScore: game.maxScore,
            winningPlayers: game.winningPlayers,
            isGameOver: game.isGameOver,
        });
    });
};
