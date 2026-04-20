const INGREDIENTS = [
  { key: 'bottomBun', label: 'Bottom Bun', color: '#d89b48' },
  { key: 'patty', label: 'Patty', color: '#6a3a1d' },
  { key: 'cheese', label: 'Cheese', color: '#f4cb39' },
  { key: 'pickles', label: 'Pickles', color: '#7b9c3d' },
  { key: 'sauce', label: 'Sauce', color: '#e8b941' },
  { key: 'topBun', label: 'Top Bun', color: '#e0aa5a' }
];

const ORDER_TEMPLATES = [
  { name: 'Backyard Burger', stack: ['bottomBun', 'patty', 'cheese', 'pickles', 'topBun'] },
  { name: 'Pickle Monster', stack: ['bottomBun', 'patty', 'pickles', 'pickles', 'topBun'] },
  { name: 'Cheesy Rider', stack: ['bottomBun', 'patty', 'cheese', 'cheese', 'topBun'] },
  { name: 'Saucy Situation', stack: ['bottomBun', 'patty', 'sauce', 'pickles', 'topBun'] },
  { name: 'Works Burger', stack: ['bottomBun', 'patty', 'cheese', 'pickles', 'sauce', 'topBun'] },
  { name: 'Double Trouble-ish', stack: ['bottomBun', 'patty', 'cheese', 'patty', 'topBun'] }
];

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const serveBtn = document.getElementById('serve-btn');
const undoBtn = document.getElementById('undo-btn');
const clearBtn = document.getElementById('clear-btn');
const newOrderBtn = document.getElementById('new-order-btn');
const ingredientButtons = document.getElementById('ingredient-buttons');
const orderName = document.getElementById('order-name');
const orderList = document.getElementById('order-list');
const burgerPreview = document.getElementById('burger-preview');
const feedback = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const roundEl = document.getElementById('round');
const finalScoreEl = document.getElementById('final-score');
const finalMessageEl = document.getElementById('final-message');

let score = 0;
let timeLeft = 45;
let round = 1;
let currentOrder = null;
let playerStack = [];
let timerInterval = null;

function showScreen(screen) {
  [startScreen, gameScreen, gameOverScreen].forEach(el => el.classList.remove('active'));
  screen.classList.add('active');
}

function setupIngredientButtons() {
  ingredientButtons.innerHTML = '';
  INGREDIENTS.forEach(item => {
    const button = document.createElement('button');
    button.className = 'btn ingredient-btn';
    button.type = 'button';
    button.innerHTML = `<span class="icon" style="background:${item.color}"></span><span>${item.label}</span>`;
    button.addEventListener('click', () => addIngredient(item.key));
    ingredientButtons.appendChild(button);
  });
}

function addIngredient(key) {
  if (!timerInterval) return;
  playerStack.push(key);
  renderPlayerBurger();
  setFeedback('Looking good...', '');
}

function renderPlayerBurger() {
  burgerPreview.innerHTML = '';
  if (playerStack.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Tap ingredients to build the burger.';
    empty.style.opacity = '0.7';
    empty.style.textAlign = 'center';
    empty.style.margin = 'auto 0';
    burgerPreview.appendChild(empty);
    return;
  }

  playerStack.forEach(key => {
    const piece = document.createElement('div');
    piece.className = `piece ${key}`;
    piece.setAttribute('title', ingredientLabel(key));
    burgerPreview.appendChild(piece);
  });
}

function ingredientLabel(key) {
  return INGREDIENTS.find(item => item.key === key)?.label || key;
}

function pickOrder() {
  const template = ORDER_TEMPLATES[Math.floor(Math.random() * ORDER_TEMPLATES.length)];
  currentOrder = {
    name: template.name,
    stack: [...template.stack]
  };
  playerStack = [];
  renderOrder();
  renderPlayerBurger();
  setFeedback('', '');
}

function renderOrder() {
  orderName.textContent = currentOrder.name;
  orderList.innerHTML = '';
  currentOrder.stack.forEach(item => {
    const li = document.createElement('li');
    li.textContent = ingredientLabel(item);
    orderList.appendChild(li);
  });
}

function setFeedback(message, kind) {
  feedback.textContent = message;
  feedback.className = 'feedback';
  if (kind) feedback.classList.add(kind);
}

function serveBurger() {
  if (!timerInterval) return;

  const isMatch = JSON.stringify(playerStack) === JSON.stringify(currentOrder.stack);

  if (isMatch) {
    score += 10;
    round += 1;
    updateHud();
    setFeedback('Perfect order. Nice work!', 'good');
    pickOrder();
  } else {
    score = Math.max(0, score - 3);
    updateHud();
    setFeedback('Nope. That one is going back to the pass.', 'bad');
  }
}

function updateHud() {
  scoreEl.textContent = score;
  timerEl.textContent = timeLeft;
  roundEl.textContent = round;
}

function startGame() {
  score = 0;
  timeLeft = 45;
  round = 1;
  updateHud();
  pickOrder();
  showScreen(gameScreen);

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateHud();
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  timerInterval = null;
  finalScoreEl.textContent = score;
  finalMessageEl.textContent = getFinalMessage(score);
  showScreen(gameOverScreen);
}

function getFinalMessage(points) {
  if (points >= 80) return 'Burger wizard. Somebody get you a spatula.';
  if (points >= 50) return 'Strong service. You can hold down the lunch rush.';
  if (points >= 25) return 'Not bad. You lived through it.';
  return 'A little chaotic, but honestly? Same.';
}

undoBtn.addEventListener('click', () => {
  if (!timerInterval) return;
  playerStack.pop();
  renderPlayerBurger();
});

clearBtn.addEventListener('click', () => {
  if (!timerInterval) return;
  playerStack = [];
  renderPlayerBurger();
  setFeedback('', '');
});

newOrderBtn.addEventListener('click', () => {
  if (!timerInterval) return;
  score = Math.max(0, score - 1);
  updateHud();
  pickOrder();
});

serveBtn.addEventListener('click', serveBurger);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

setupIngredientButtons();
renderPlayerBurger();
