// models/Deck.js

class Deck {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    drawCard() {
        return this.cards.pop();
    }

    shuffle() {
        // implement shuffle algorithm here
        // ...
    }
}

module.exports = Deck;
