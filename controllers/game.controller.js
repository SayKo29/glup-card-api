const Room = require("../models/room.schema");
const QuestionsDeck = require("../models/QuestionsDeck");
const AnswersDeck = require("../models/AnswersDeck");

let games = {};

async function startGame(roomName, roomKey, host, socket, io) {
    // create new game object
    const gameKey = `${roomName}-${roomKey}`;
    if (games[gameKey]) {
        socket.emit("errorMessage", "Game already started");
        return;
    }

    const game = {
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
    };

    //create new deck of questions and answers
    const questionsDeck = new QuestionsDeck();
    const answersDeck = new AnswersDeck();

    // get cards from the database and add them to the decks

    const [questions, answers] = await Promise.all([
        questionsDeck.getCards(1),
        answersDeck.getCards(2),
    ]);

    // assign the host to the game
    game.host = host;

    // assign the decks to the game
    game.questionsDeck = questions;
    game.answersDeck = answers;
    console.log(answers, "answers");

    let allAnswers = [];
    answers.forEach((answer) => {
        allAnswers.push(answer);
    });

    // get the first question taking it from the deck
    const randomQuestion = game.questionsDeck[0];
    game.currentQuestion = randomQuestion;

    // get different players from the room to set his answers

    const users = await Room.find({ name: roomName, key: roomKey }).select(
        "users"
    );
    for (let i = 0; i < users.length; i++) {
        const players = users[i];
        for (let k = 0; k < players.users.length; k++) {
            const player = players.users[k];
            const answerCards = [];
            for (let j = 0; j < 5; j++) {
                let pickCard = Math.floor(Math.random() * allAnswers.length);
                const answerCard = allAnswers[pickCard];
                answerCards.push(answerCard);
                allAnswers.splice(pickCard, 1); // remove selected card from deck
                if (allAnswers.length === 0) {
                    // if deck is empty, add cards back
                    allAnswers = [];
                    allAnswers = game.allAnswers;
                }
            }
            const playerObject = {
                username: player.nickname,
                answerCards: answerCards,
                selectedAnswer: null,
                points: 0,
            };

            game.players.push(playerObject);
        }
    }

    // send a message to all clients with the updated game object
    //add game to games object
    games[gameKey] = game;
    io.to(roomName).emit("gameStarted");
    io.to(roomName).emit("gameData", game);
}

async function updateAnswersToHost(answer, roomObject, username, socket, io) {
    const gameKey = `${roomObject.name}-${roomObject.key}`;
    const game = games[gameKey];
    if (!game) {
        io.to(roomObject.name).emit("errorMessage", "Game not found");
        return;
    }

    // get answer by answerId
    game.answersDeck.forEach((answerCard) => {
        console.log(answerCard, "answerCardforeach");
        if (answerCard.id === answer) {
            answer = answerCard;
        }
    });
    console.log(answer, "answer");

    game.playersAnswers.push(answer);

    // send a message to all clients with the updated game object
    io.to(roomObject.name).emit("updateAnswers", game);
}

module.exports = { startGame, updateAnswersToHost };
