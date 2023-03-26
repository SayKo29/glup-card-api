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
        let userSocket = io.of("/").sockets.get(socketId);
        // const userSocket = socket.sockets.get(socketId);
        usersObj[socketId] = userSocket.username; // agrega el socketId y el username del usuario al objeto
    });

    // console.log(usersObj); // logs el objeto con todos los usuarios en la sala
    // recorre el objeto y envia a cada usuario el evento newAnswers con sus respectivas  cartas
    for (const socketId in usersObj) {
        io.to(socketId).emit("newAnswers", answersDeck.drawCards(4));
    }
};

exports.selectedAnswerGame = async function (name, key, answer, socket) {
    const gameKey = `${name}-${key}`;
    const game = games[gameKey];

    // Add player answer to playerAnswers object
    game.playerAnswers[username] = answer;

    //send to host the player answer
    socket.emit("newAnswerHost", game.playerAnswers);

    // Check if all players have answered
    if (Object.keys(game.playerAnswers).length === game.players.length) {
        // Emit event to host
        socket.emit("allPlayersAnswered", game.playerAnswers);

        // Emit event to all players
        socket.to(key).emit("allPlayersAnswered", game.playerAnswers);

        // Reset player answers
        game.playerAnswers = {};

        // Check if game is over
        if (game.scores[username] >= game.maxScore) {
            game.isGameOver = true;
            game.winningPlayers.push(username);

            // Emit event to host
            socket.emit("gameOver", game.winningPlayers);

            // Emit event to all players
            socket.to(key).emit("gameOver", game.winningPlayers);

            // Delete game from games object
            delete games[gameKey];
        } else {
            // Emit event to host
            socket.emit("nextRound");

            // Emit event to all players
            socket.to(key).emit("nextRound");
        }
    }
};
