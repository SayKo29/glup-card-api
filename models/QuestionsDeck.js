// models/Deck.js
const { findByType } = require("./Cards");

class QuestionsDeck {
    constructor() {
        this.cards = [];
    }

    async getCards(type) {
        const cards = await findByType(type);
        this.cards = cards;
        return cards;
    }

    addCard(card) {
        this.cards.push(card);
    }

    drawCard() {
        return this.cards.pop();
    }

    shuffle() {
        this.cards = this.cards.sort(() => Math.random() - 0.5);
    }
}

module.exports = QuestionsDeck;
