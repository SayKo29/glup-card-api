const Room = require("../models/room.schema");
const QuestionsDeck = require("../models/QuestionsDeck");
const AnswersDeck = require("../models/AnswersDeck");
const Game = require("../models/game.schema");

let games = {};

//create new deck of questions and answers
const questionsDeck = new QuestionsDeck();
const answersDeck = new AnswersDeck();

async function startGame (roomObject, host, socket, io) {
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

    await sendGameStartedMessage(io, roomObject);

    console.log(games[gameKey], "gamesss");

    updateGameInDatabase(roomObject);
}

async function updateAnswersToHost (answer, roomObject, username, socket, io) {
    console.log('updateanswers');
    const gameKey = `${roomObject.name}-${roomObject.key}`;
    let game = games[gameKey];
    if (!game) {
        game = await getGameFromDatabase(roomObject);
        console.log(game, 'game from database');
    }

    if (game) {
        game.playersAnswers.push(answer[0]);
        console.log(game, 'after push');
        await updateStateGame(game, roomObject);

        // send a message to all clients with the updated game object
        io.to(roomObject.name).emit("updateAnswers", game);
    } else {
        console.error('Failed to retrieve game from database');
        io.to(roomObject.name).emit("errorMessage", "Failed to retrieve game from database");
    }
}

async function voteHost (answer, roomObject, socket, io) {
    const gameKey = `${roomObject.name}-${roomObject.key}`;
    const game = games[gameKey];
    if (!game) {
        io.to(roomObject.name).emit("errorMessage", "Game not found");
        return;
    }
    console.log(answer, 'answer')
    console.log(answer[0], 'answer00')
    let winnerNickname = answer[0].nickname;

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

        //set host to next player
        setNextHost(game);

        // get the next answers taking it from the deck
        await setPlayerAnswers(game, roomObject);

        game.playersAnswers = [];

        game.currentRound += 1;

        await updateStateGame(game, roomObject);

        // send a message to all clients with the updated game object
        io.to(roomObject.name).emit("updateRound", game);
    }, 5000);
}

function createGame () {
    return {
        players: [],
        host: "",
        currentQuestion: {},
        currentAnswers: [],
        questionsDeck: [],
        answersDeck: [],
        playersAnswers: [],
        currentRound: 0,
        isGameOver: false,
        gameIsStarted: false,
    };
}

async function getCardsFromDatabase (game) {
    const [questions, answers] = await Promise.all([
        questionsDeck.getCards(1),
        answersDeck.getCards(2),
    ]);

    game.questionsDeck = questions;
    game.answersDeck = answers;
}

function shuffleDecks (game) {
    game.questionsDeck = game.questionsDeck.sort(() => Math.random() - 0.5);
    game.answersDeck = game.answersDeck.sort(() => Math.random() - 0.5);
}

function assignHost (game, host) {
    game.host = host;
}

function setCurrentQuestion (game) {
    const randomQuestion = game.questionsDeck[0];
    game.currentQuestion = randomQuestion;
}

function setNextHost (game) {
    const players = game.players;
    const hostIndex = players.findIndex((p) => p.nickname === game.host);
    if (hostIndex === players.length - 1) {
        game.host = players[0].nickname;
    } else {
        game.host = players[hostIndex + 1].nickname;
    }
}

async function setPlayerAnswers (game, roomObject) {
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
                // if there is the player in the game, update the answers
                const playerIndex = game.players.findIndex(
                    (p) => p.nickname === player.nickname
                );
                if (playerIndex !== -1) {
                    game.players[playerIndex].answerCards =
                        playerObject.answerCards;
                } else {
                    game.players.push(playerObject);
                }
            }
        }
    }

    // Actualizar el mazo de respuestas para reflejar las cartas asignadas a los jugadores
    shuffleDecks(game);
}

async function sendGameStartedMessage (io, roomObject) {
    let room = await Room.findOneAndUpdate(
        { name: roomObject.name, key: roomObject.key },
        { game_started: true }
    );

    const gameKey = `${roomObject.name}-${roomObject.key}`;
    let game = games[gameKey];
    game.maxRounds = room.numRounds;
    game.gameIsStarted = true;
    games[gameKey] = game;
    console.log("Game started");
    io.to(roomObject.name).emit("gameStarted");
    io.to(roomObject.name).emit("gameData", game);
}

async function updateGameInDatabase (roomObject) {
    let room = await Room.findOneAndUpdate(
        { name: roomObject.name, key: roomObject.key },
        { game_started: true }
    );

    // push the game object to the database
    let currentGame = games[`${roomObject.name}-${roomObject.key}`];
    // assign _id of the room to the game object
    currentGame.room = room._id;

    await Game.create(games[`${roomObject.name}-${roomObject.key}`]);
}

async function updateStateGame (game, roomObject) {
    // update the game in the database
    let gameToFind = await getGameFromDatabase(roomObject);
    await Game.updateOne(
        { room: gameToFind.room },
        {
            players: game.players,
            host: game.host,
            questionsDeck: game.questionsDeck,
            answersDeck: game.answersDeck,
            currentQuestion: game.currentQuestion,
            currentAnswers: game.currentAnswers,
            playersAnswers: game.playersAnswers,
            currentRound: game.currentRound,
            maxRounds: game.maxRounds,
            isGameOver: game.isGameOver,
            gameIsStarted: game.gameIsStarted,
        }
    );
}

async function getGameFromDatabase (roomObject) {
    const gameKey = `${roomObject.name}-${roomObject.key}`;
    let game = games[gameKey];
    console.log(game, 'gamemethod')
    if (!game) {
        let room = await Room.findOne({
            name: roomObject.name,
            key: roomObject.key,
        });
        console.log(room, 'room from database')
        let juego = await Game.findOne({ room: room._id }).then((juego) => {
            console.log(juego, 'game from database');
            return juego;
        });
        return juego
    }
    return game;
}

module.exports = { startGame, updateAnswersToHost, voteHost };
