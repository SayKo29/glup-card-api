// models/AnswersDeck.js
const { findByType } = require("./Cards");
class AnswersDeck {
    constructor() {
        this.cards = [];
    }

    async getCards(type) {
        const cards = await findByType(type);
        console.log(cards, "answercards");
        this.cards = cards;
        return cards;
    }

    addCard(card) {
        this.cards.push(card);
    }

    drawCard() {
        return this.cards.pop();
    }

    drawCards(num) {
        const cards = [];
        for (let i = 0; i < num; i++) {
            cards.push(this.drawCard());
        }
        return cards;
    }

    shuffle() {
        this.cards = this.cards.sort(() => Math.random() - 0.5);
    }
}

module.exports = AnswersDeck;
