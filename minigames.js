// Word Jump遊戲
class WordJump {
    constructor(container, word) {
        this.container = container;
        this.word = word;
        this.letters = word.split('');
        this.score = 0;
        this.gameOver = false;
        this.letterElements = [];
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="word-jump">
                <div class="score">得分: <span>0</span></div>
                <div class="target-word">${this.word}</div>
                <div class="game-area"></div>
                <button class="start-btn">開始遊戲</button>
            </div>
        `;

        this.gameArea = this.container.querySelector('.game-area');
        this.scoreElement = this.container.querySelector('.score span');
        this.startBtn = this.container.querySelector('.start-btn');
        
        this.startBtn.addEventListener('click', () => this.startGame());
    }

    startGame() {
        this.score = 0;
        this.gameOver = false;
        this.letterElements = [];
        this.gameArea.innerHTML = '';
        this.startBtn.disabled = true;
        this.updateScore();
        this.createLetter();
    }

    createLetter() {
        if (this.gameOver) return;

        const letter = document.createElement('div');
        letter.className = 'falling-letter';
        letter.textContent = this.letters[Math.floor(Math.random() * this.letters.length)];
        letter.style.left = `${Math.random() * 80 + 10}%`;
        
        this.gameArea.appendChild(letter);
        this.letterElements.push(letter);

        const fallInterval = setInterval(() => {
            const top = parseFloat(letter.style.top || 0);
            letter.style.top = `${top + 2}px`;

            if (top > this.gameArea.clientHeight - 50) {
                clearInterval(fallInterval);
                this.gameOver = true;
                this.endGame();
            }
        }, 50);

        letter.addEventListener('click', () => {
            if (letter.textContent === this.word[this.score]) {
                this.score++;
                this.updateScore();
                letter.remove();
                this.letterElements = this.letterElements.filter(el => el !== letter);

                if (this.score === this.word.length) {
                    this.gameOver = true;
                    this.endGame(true);
                }
            }
        });
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    endGame(won = false) {
        this.startBtn.disabled = false;
        if (won) {
            alert('恭喜你完成了單字！');
            gameState.badges.add('word-master');
            updateBadges();
        } else {
            alert('遊戲結束！');
        }
    }
}

// Memory Match遊戲
class MemoryMatch {
    constructor(container, words) {
        this.container = container;
        this.words = words;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="memory-match">
                <div class="score">配對: <span>0</span>/<span>${this.words.length}</span></div>
                <div class="game-board"></div>
                <button class="start-btn">開始遊戲</button>
            </div>
        `;

        this.gameBoard = this.container.querySelector('.game-board');
        this.scoreElement = this.container.querySelector('.score span:first-child');
        this.startBtn = this.container.querySelector('.start-btn');
        
        this.startBtn.addEventListener('click', () => this.startGame());
    }

    startGame() {
        this.matchedPairs = 0;
        this.flippedCards = [];
        this.gameBoard.innerHTML = '';
        this.startBtn.disabled = true;
        this.createCards();
        this.updateScore();
    }

    createCards() {
        const allCards = [];
        
        // 创建中英文卡片对
        this.words.forEach(word => {
            allCards.push(
                { text: word.english, type: 'english' },
                { text: word.chinese, type: 'chinese' }
            );
        });

        // 随机打乱卡片
        for (let i = allCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
        }

        // 创建卡片元素
        allCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            cardElement.dataset.type = card.type;
            cardElement.dataset.text = card.text;
            
            cardElement.addEventListener('click', () => this.flipCard(cardElement));
            this.gameBoard.appendChild(cardElement);
        });
    }

    flipCard(card) {
        if (this.flippedCards.length >= 2 || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 1000);
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.text === this.words.find(w => 
            w.english === card1.dataset.text || w.chinese === card1.dataset.text
        )[card1.dataset.type === 'english' ? 'chinese' : 'english'];

        if (match === card2.dataset.text) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            this.updateScore();

            if (this.matchedPairs === this.words.length) {
                this.endGame(true);
            }
        } else {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
        }

        this.flippedCards = [];
    }

    updateScore() {
        this.scoreElement.textContent = this.matchedPairs;
    }

    endGame(won = false) {
        this.startBtn.disabled = false;
        if (won) {
            alert('恭喜你完成了所有配对！');
            gameState.badges.add('memory-king');
            updateBadges();
        }
    }
}

// 初始化小游戏
function initMiniGame(type, container, data) {
    switch (type) {
        case 'word-jump':
            return new WordJump(container, data);
        case 'memory-match':
            return new MemoryMatch(container, data);
        default:
            console.error('未知的游戏类型');
    }
} 