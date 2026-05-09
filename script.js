// ================= TV LOGO =================
const logo = document.getElementById("logo");

let x = 100, y = 100;
const speed = 1.5;
let dx = speed * (Math.random() < 0.5 ? 1 : -1);
let dy = speed * (Math.random() < 0.5 ? 1 : -1);

let tvAnimationId = null;
let hue = Math.random() * 360;

function updateColor() {
  hue = (hue + 60 + Math.random() * 60) % 360;
  logo.style.filter = `hue-rotate(${hue}deg)`;
  logo.style.boxShadow = `0 0 25px hsl(${hue}, 100%, 50%)`;
}

function startTV() {
  if (tvAnimationId) return;

  const screen = document.getElementById("tv-screen");

  function loop() {
    const rect = screen.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      tvAnimationId = null;
      return;
    }

    const maxX = rect.width - logo.offsetWidth;
    const maxY = rect.height - logo.offsetHeight;
    console.log(`Screen: ${rect.width}x${rect.height}, Logo: ${logo.offsetWidth}x${logo.offsetHeight}, Max: ${maxX}x${maxY}`);

    x += dx;
    y += dy;

    if (x <= 0 || x >= maxX) {
      dx *= -1;
      updateColor();
    }

    if (y <= 0 || y >= maxY) {
      dy *= -1;
      updateColor();
    }

    logo.style.left = x + "px";
    logo.style.top = y + "px";

    tvAnimationId = requestAnimationFrame(loop);
  }

  tvAnimationId = requestAnimationFrame(loop);
}

function stopTV() {
  if (tvAnimationId) {
    cancelAnimationFrame(tvAnimationId);
    tvAnimationId = null;
  }
}

// ================= DINO =================
const dino = document.getElementById("dino");
const game = document.getElementById("game");
const scoreEl = document.getElementById("score");
const gameOverText = document.getElementById("gameOver");

let yDino = 0, velocity = 0;
let gravity = 0.8, jumping = false;

let obstacles = [];
let speedDino = 5;
let score = 0;
let gameOver = false;

let dinoAnimationId = null;

function jump() {
  if (!jumping && !gameOver) {
    velocity = 18;
    jumping = true;
  } else if (gameOver) {
    restartDino();
  }
}

document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});
document.addEventListener("click", jump);

function spawnObstacle() {
  if (gameOver) return;

  const cactus = document.createElement("div");
  cactus.classList.add("cactus");
  game.appendChild(cactus);

  obstacles.push({ el: cactus, x: window.innerWidth });

  setTimeout(spawnObstacle, 1000 + Math.random() * 1500);
}

function isColliding(a, b) {
  const ar = a.getBoundingClientRect();
  const br = b.getBoundingClientRect();
  return !(ar.right < br.left || ar.left > br.right || ar.bottom < br.top || ar.top > br.bottom);
}

function startDino() {
  if (dinoAnimationId) return;

  function loop() {
    if (gameOver) {
      dinoAnimationId = null;
      return;
    }

    velocity -= gravity;
    yDino += velocity;

    if (yDino <= 0) {
      yDino = 0;
      jumping = false;
    }

    dino.style.bottom = yDino + "px";

    obstacles.forEach((obs, i) => {
      obs.x -= speedDino;
      obs.el.style.left = obs.x + "px";

      if (isColliding(dino, obs.el)) {
        endGame();
      }

      if (obs.x < -20) {
        obs.el.remove();
        obstacles.splice(i, 1);
      }
    });

    score++;
    scoreEl.textContent = score;

    dinoAnimationId = requestAnimationFrame(loop);
  }

  spawnObstacle();
  dinoAnimationId = requestAnimationFrame(loop);
}

function stopDino() {
  if (dinoAnimationId) {
    cancelAnimationFrame(dinoAnimationId);
    dinoAnimationId = null;
  }
}

function endGame() {
  gameOver = true;
  gameOverText.style.display = "block";
}

function restartDino() {
  obstacles.forEach(o => o.el.remove());
  obstacles = [];

  score = 0;
  yDino = 0;
  velocity = 0;
  gameOver = false;

  gameOverText.style.display = "none";
  startDino();
}

// ================= GAME SWITCHER =================
function stopAll() {
  stopTV();
  stopDino();
}

function playGame() {
  stopAll();

  const games = ["tv-screen", "dino-game"];
  const choice = games[Math.floor(Math.random() * games.length)];

  document.getElementById("default-header").classList.add("hidden");

  games.forEach(id => {
    document.getElementById(id).classList.toggle("hidden", id !== choice);
  });

  setTimeout(() => {
    if (choice === "tv-screen") {
      const rect = document.getElementById("tv-screen").getBoundingClientRect();
      x = Math.random() * (rect.width - 256);
      y = Math.random() * (rect.height - 256);
      startTV();
    } else {
      startDino();
    }
  }, 100);
}