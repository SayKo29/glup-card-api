const Room = require("../models/room.schema");
const QuestionsDeck = require("../models/QuestionsDeck");
const AnswersDeck = require("../models/AnswersDeck");

let games = {};

//create new deck of questions and answers
const questionsDeck = new QuestionsDeck();
const answersDeck = new AnswersDeck();

async function startGame(roomObject, host, socket, io) {
    const gameKey = `${roomObject.name}-${roomObject.key}`;
    if (games[gameKey]) {
        socket.emit("errorMessage", "Game already started");
        return;
    }

    const game = createGame();

    games[gameKey] = game;

    await getCardsFromDatabase(game);

    shuffleDecks(game);

    assignHost(game, host);

    setCurrentQuestion(game);

    await setPlayerAnswers(game, roomObject);

    sendGameStartedMessage(io, roomObject);

    updateGameInDatabase(roomObject);
}

async function updateAnswersToHost(answer, roomObject, username, socket, io) {
    const gameKey = `${roomObject.name}-${roomObject.key}`;
    const game = games[gameKey];
    if (!game) {
        io.to(roomObject.name).emit("errorMessage", "Game not found");
        return;
    }
    game.playersAnswers.push(answer);

    // send a message to all clients with the updated game object
    io.to(roomObject.name).emit("updateAnswers", game);
}

async function voteHost(answer, roomObject, socket, io) {
    const gameKey = `${roomObject.name}-${roomObject.key}`;
    const game = games[gameKey];
    if (!game) {
        io.to(roomObject.name).emit("errorMessage", "Game not found");
        return;
    }
    let winnerNickname = answer.nickname;

    game.players.forEach((player) => {
        if (player.nickname == winnerNickname) {
            player.points += 1;
        }
    });

    // send a message to all clients with the updated game object
    io.to(roomObject.name).emit("showWinner", winnerNickname);

    //async timeout to send next question and answers

    //check if game is over
    if (game.currentRound === game.maxRounds) {
        game.isGameOver = true;
        io.to(roomObject.name).emit("gameOver", game);
        return;
    }

    setTimeout(async () => {
        // get the next question taking it from the deck
        setCurrentQuestion(game);

        // get the next answers taking it from the deck
        await setPlayerAnswers(game, roomObject);

        game.playersAnswers = [];

        game.currentRound += 1;

        // send a message to all clients with the updated game object
        io.to(roomObject.name).emit("updateRound", game);
    }, 5000);
}

function createGame() {
    return {
        players: [],
        host: "",
        currentQuestion: {},
        currentAnswers: [],
        questionsDeck: [],
        answersDeck: [],
        playersAnswers: [],
        currentRound: 0,
        maxRounds: 10,
        isGameOver: false,
        gameIsStarted: false,
    };
}

async function getCardsFromDatabase(game) {
    const [questions, answers] = await Promise.all([
        questionsDeck.getCards(1),
        answersDeck.getCards(2),
    ]);

    game.questionsDeck = questions;
    game.answersDeck = answers;
}

function shuffleDecks(game) {
    game.questionsDeck = game.questionsDeck.sort(() => Math.random() - 0.5);
    game.answersDeck = game.answersDeck.sort(() => Math.random() - 0.5);
}

function assignHost(game, host) {
    game.host = host;
}

function setCurrentQuestion(game) {
    const randomQuestion = game.questionsDeck[0];
    game.currentQuestion = randomQuestion;
}

async function setPlayerAnswers(game, roomObject) {
    // remove every answer from the players
    const users = await Room.find({
        name: roomObject.name,
        key: roomObject.key,
    }).select("users");
    for (let i = 0; i < users.length; i++) {
        const players = users[i];
        for (let k = 0; k < players.users.length; k++) {
            const player = players.users[k];
            const answerCards = [];
            if (player.nickname !== game.host) {
                player.answerCards = [];
                for (let j = 0; j < 4; j++) {
                    let pickCard = Math.floor(
                        Math.random() * game.answersDeck.length
                    );
                    const answerCard = game.answersDeck[pickCard];
                    answerCards.push(answerCard);
                    game.answersDeck.splice(pickCard, 1);
                    if (game.answersDeck.length === 0) {
                        game.answersDeck = [];
                        game.answersDeck = await answersDeck.getCards(2);
                    }
                }
                const playerObject = {
                    nickname: player.nickname,
                    answerCards: answerCards,
                    selectedAnswer: null,
                    points: 0,
                };
                game.players.push(playerObject);
            }
        }
    }

    // Actualizar el mazo de respuestas para reflejar las cartas asignadas a los jugadores
    shuffleDecks(game);
}

function sendGameStartedMessage(io, roomObject) {
    const gameKey = `${roomObject.name}-${roomObject.key}`;
    const game = games[gameKey];
    game.gameIsStarted = true;
    games[gameKey] = game;
    io.to(roomObject.name).emit("gameStarted");
    io.to(roomObject.name).emit("gameData", game);
}

async function updateGameInDatabase(roomObject) {
    await Room.findOneAndUpdate(
        { name: roomObject.name, key: roomObject.key },
        { game_started: true }
    );
}

module.exports = { startGame, updateAnswersToHost, voteHost };
