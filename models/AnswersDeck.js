// models/AnswersDeck.js

class AnswersDeck {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    drawCards(num) {
        const drawnCards = [];

        for (let i = 0; i < num; i++) {
            drawnCards.push(this.cards.pop());
        }

        return drawnCards;
    }

    shuffle() {}
}

module.exports = AnswersDeck;
