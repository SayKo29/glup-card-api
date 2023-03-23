// Path: controllers\game.controller.js

const QuestionsDeck = require("../models/QuestionsDeck");
const AnswersDeck = require("../models/AnswersDeck");

let games = {};

exports.startGame = async function (name, key, socket) {
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

    console.log(questionDeck);
    console.log(answersDeck);

    // Assign host
    game.host = socket.id;

    // Add player to game
    game.players.push(socket.id);

    // enviar al host
    socket.emit("gameStarted");
    // enviar a todos los jugadores
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

    // Update current player index to point to next player
    currentPlayerIndex = (currentPlayerIndex + 1) % game.players.length;

    // // Emit question to next player
    // const nextPlayer = game.players[currentPlayerIndex];
    // io.to(nextPlayer).emit("newQuestion", game.currentQuestion);

    // // Emit answers to all players
    game.currentAnswers = answersDeck.drawCards(4);
    socket.to(key).emit("newAnswers", game.currentAnswers);

    // host choose who win a point
    socket.on("chooseWinner", (winner) => {
        // Add player answer to playerAnswers object
        game.playerAnswers[socket.id] = winner;

        // If all players have answered, calculate scores and send them to players
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
            }
        }
    });

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
};
