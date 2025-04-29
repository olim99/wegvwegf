const style = document.createElement('style');
style.textContent = `
  body {
    font-family: sans-serif;
    text-align: center;
    background-color: #f0f0f0;
    margin: 0;
    padding: 0;
    transition: background-color 0.3s;
  }
  h1 {
    margin: 20px 10px 5px;
  }
  .stats {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
  .game-board {
    display: grid;
    grid-template-columns: repeat(4, 100px);
    grid-gap: 10px;
    justify-content: center;
    margin: 20px auto;
    max-width: 450px;
  }
  .card {
    width: 100px;
    height: 100px;
    background-color: #444;
    color: white;
    font-size: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 8px;
    user-select: none;
    transition: background-color 0.3s, color 0.3s;
  }
  .card.flipped {
    background-color: #fff;
    color: #000;
  }
  .shake {
    animation: shake 0.5s;
  }
  @keyframes shake {
    0% { transform: translate(0px, 0px); }
    20% { transform: translate(-10px, 0px); }
    40% { transform: translate(10px, 0px); }
    60% { transform: translate(-10px, 0px); }
    80% { transform: translate(10px, 0px); }
    100% { transform: translate(0px, 0px); }
  }
  #gameOver {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.85);
    color: red;
    font-size: 5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    font-weight: bold;
    visibility: hidden;
    flex-direction: column;
  }
  #gameOver.show {
    visibility: visible;
  }
  .message {
    margin-bottom: 30px;
  }
  #restartBtn {
    font-size: 1.5rem;
    padding: 10px 30px;
    background: red;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
  }
  #restartBtn:hover {
    background: darkred;
  }
`;
document.head.appendChild(style);

// Переменные
const emojis = ['🐶', '🐱', '🐻', '🐼', '🦁', '🐸', '🐵', '🐔'];
let cardsArray, board, gameOverScreen, firstCard, secondCard, lockBoard;
let errors = 0, maxErrors = 8, flippedCount = 0;
let timer = 0, timerInterval = null, bestTime = null;
let losses = parseInt(localStorage.getItem('lossCount')) || 0;

const timerEl = document.getElementById('timer');
const lossEl = document.getElementById('lossCount');
const bestTimeEl = document.getElementById('bestTime');

lossEl.textContent = losses;

function initGame() {
  cardsArray = [...emojis, ...emojis];
  cardsArray.sort(() => 0.5 - Math.random());
  board = document.getElementById('gameBoard');
  gameOverScreen = document.getElementById('gameOver');
  board.innerHTML = '';
  gameOverScreen.classList.remove('show');

  firstCard = null;
  secondCard = null;
  lockBoard = false;
  errors = 0;
  flippedCount = 0;

  clearInterval(timerInterval);
  timer = 0;
  timerEl.textContent = timer;
  timerInterval = setInterval(() => {
    timer++;
    timerEl.textContent = timer;
  }, 1000);

  cardsArray.forEach((emoji, index) => {
    const card = document.createElement('div');

card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = index;

    card.addEventListener('click', flipCard);
    board.appendChild(card);
  });

  bestTime = localStorage.getItem('bestTime');
  bestTimeEl.textContent = bestTime ? bestTime : '–';
}

function flipCard() {
  if (lockBoard || this === firstCard || this.classList.contains('flipped') || errors >= maxErrors) return;

  this.classList.add('flipped');
  this.textContent = this.dataset.emoji;

  if (!firstCard) {
    firstCard = this;
  } else {
    secondCard = this;
    checkForMatch();
  }
}

function checkForMatch() {
  if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
    flippedCount += 2;
    firstCard = null;
    secondCard = null;
    if (flippedCount === cardsArray.length) {
      endGameSuccess();
    }
  } else {
    lockBoard = true;
    errors++;

    document.body.style.backgroundColor = '#ff4d4d';
    document.body.classList.add('shake');

    setTimeout(() => {
      document.body.style.backgroundColor = '#f0f0f0';
      document.body.classList.remove('shake');

      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      firstCard.textContent = '';
      secondCard.textContent = '';
      firstCard = null;
      secondCard = null;
      lockBoard = false;

      if (errors >= maxErrors) {
        showGameOver();
      }
    }, 1000);
  }
}

function endGameSuccess() {
  clearInterval(timerInterval);
  if (!bestTime || timer < bestTime) {
    localStorage.setItem('bestTime', timer);
    bestTimeEl.textContent = timer;
  }
}

function showGameOver() {
  clearInterval(timerInterval);
  gameOverScreen.classList.add('show');
  losses++;
  localStorage.setItem('lossCount', losses);
  lossEl.textContent = losses;
}


document.addEventListener('click', (e) => {
  if (e.target.id === 'restartBtn') {
    initGame();
  }
});


initGame();