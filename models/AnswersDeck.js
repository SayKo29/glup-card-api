// models/AnswersDeck.js
const { findByType } = require("./Cards");
class AnswersDeck {
    constructor() {
        this.cards = [];
        this.resetDeck();
    }

    async getCards(type) {
        const cards = await findByType(type);
        this.cards = cards;
        return cards;
    }

    addCard(card) {
        this.cards.push(card);
    }
    getCardById(id) {
        return this.cards.find((card) => card._id === id);
    }

    drawCard() {
        return this.cards.pop();
    }

    resetDeck() {
        this.cards = [];
        this.getCards(2);
    }

    drawCards(num) {
        // Draw cards from the deck trying to no repeat cards, if there are not enough cards repeat them
        let cards = [];
        let copy = [...this.cards];
        for (let i = 0; i < num; i++) {
            if (copy.length === 0) {
                copy = [...this.cards];
            }
            const index = Math.floor(Math.random() * copy.length);
            cards.push(copy[index]);
            copy.splice(index, 1);
        }

        return cards;
    }

    shuffle() {
        this.cards = this.cards.sort(() => Math.random() - 0.5);
    }
}

module.exports = AnswersDeck;
