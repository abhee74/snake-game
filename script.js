const borad = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

const blockHeight = 50;
const blockWidth = 50;

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00-00`;

highScoreElement.innerText = highScore;

const cols = borad.clientWidth / blockWidth;
const rows = borad.clientHeight / blockHeight;

let intervalId = null;
let timerIntervalId = null;
let isPaused = false;

const blocks = [];
let snake = [
  {
    x: 1,
    y: 3,
  },
];

let food = generateFood();

let direction = "down";

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    borad.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

function render() {
  let head;

  // decide next head position
  if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }

  /* -------- WALL COLLISION -------- */
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    gameOver();
    return;
  }

  /* -------- SELF COLLISION -------- */
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
      return;
    }
  }

  /* -------- FOOD -------- */
  if (head.x === food.x && head.y === food.y) {
    snake.unshift(head);

    blocks[`${food.x}-${food.y}`].classList.remove("food");
    food = generateFood();

    score += 10;
    scoreElement.innerText = score;

    if (score > highScore) {
      highScore = score;
      highScoreElement.innerText = highScore;
      localStorage.setItem("highScore", highScore);
    }
  } else {
    snake.unshift(head);
    snake.pop();
  }

  /* -------- RENDER -------- */
  document.querySelectorAll(".block").forEach((block) => {
    block.classList.remove("fill");
    block.classList.remove("food");
  });

  blocks[`${food.x}-${food.y}`].classList.add("food");

  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.add("fill");
  });
}

startButton.addEventListener("click", () => {
  modal.style.display = "none";
  intervalId = setInterval(() => {
    render();
  }, 450);
  isPaused = false;
  timerIntervalId = setInterval(updateTimer, 1000);
});

restartButton.addEventListener("click", restartGame);

function generateFood() {
  let newFood;

  while (true) {
    newFood = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };

    // check if food is on snake body
    const isOnSnake = snake.some(
      (segment) => segment.x === newFood.x && segment.y === newFood.y
    );

    if (!isOnSnake) break;
  }

  return newFood;
}

function restartGame() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);

  document.querySelectorAll(".block").forEach((block) => {
    block.classList.remove("fill");
    block.classList.remove("food");
  });

  score = 0;
  time = "00-00";
  direction = "down";
  isPaused = false;

  snake = [{ x: 1, y: 3 }];
  food = generateFood();

  scoreElement.innerText = score;
  timeElement.innerText = time;
  highScoreElement.innerText = highScore;

  modal.style.display = "none";

  intervalId = setInterval(render, 450);
  timerIntervalId = setInterval(updateTimer, 1000);
}

function gameOver() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);

  modal.style.display = "flex";
  startGameModal.style.display = "none";
  gameOverModal.style.display = "flex";
}

function pauseGame() {
  if (isPaused) return;

  clearInterval(intervalId);
  clearInterval(timerIntervalId);
  isPaused = true;
}

function resumeGame() {
  if (!isPaused) return;

  intervalId = setInterval(render, 450);
  timerIntervalId = setInterval(updateTimer, 1000);
  isPaused = false;
}

function updateTimer() {
  let [min, sec] = time.split("-").map(Number);

  sec++;
  if (sec === 60) {
    min++;
    sec = 0;
  }

  time = `${min}-${sec}`;
  timeElement.innerText = time;
}

/* ArrowUp  */
addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
    return;
  }

  if (isPaused) return;
  if (event.key == "ArrowUp") {
    direction = "up";
  } else if (event.key == "ArrowRight") {
    direction = "right";
  } else if (event.key == "ArrowLeft") {
    direction = "left";
  } else if (event.key == "ArrowDown") {
    direction = "down";
  }
});
