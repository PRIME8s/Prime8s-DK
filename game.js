const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = {
  x: 50,
  y: 600 - 37,
  width: 24,
  height: 37,
  dy: 0,
  onGround: false
};

const gravity = 0.5;
const jumpStrength = -8;
let keys = {};
let barrels = [];
let platforms = [
  { x: 0, y: 600, width: 480, height: 20 },
  { x: 0, y: 500, width: 400, height: 10 },
  { x: 80, y: 400, width: 400, height: 10 },
  { x: 0, y: 300, width: 400, height: 10 },
  { x: 80, y: 200, width: 400, height: 10 },
];

let ladders = [
  { x: 200, y: 480, height: 100 },
  { x: 300, y: 380, height: 100 },
  { x: 150, y: 280, height: 100 },
  { x: 350, y: 180, height: 100 }
];

function spawnBarrel() {
  barrels.push({ x: 480, y: 0, size: 15, dx: 2 });
}

setInterval(spawnBarrel, 2000);

document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

const playerSprite = new Image();
playerSprite.src = "Cheetah.png";

function update() {
  if (keys["ArrowLeft"]) player.x -= 3;
  if (keys["ArrowRight"]) player.x += 3;

  let onLadder = false;
  for (let ladder of ladders) {
    if (
      player.x + player.width > ladder.x &&
      player.x < ladder.x + 20 &&
      player.y + player.height > ladder.y &&
      player.y < ladder.y + ladder.height
    ) {
      onLadder = true;

      if (keys["ArrowUp"]) {
        player.y -= 2;
        player.dy = 0;
      } else if (keys["ArrowDown"]) {
        player.y += 2;
        player.dy = 0;
      }
    }
  }

  if (!onLadder) {
    player.dy += gravity;
  }

  // Apply vertical movement step-by-step to avoid tunneling
  let step = Math.sign(player.dy);
  for (let i = 0; i < Math.abs(player.dy); i++) {
    player.y += step;

    // Check collision with platforms on each pixel step
    for (let plat of platforms) {
      if (
        player.y + player.height >= plat.y &&
        player.y + player.height <= plat.y + 5 &&
        player.x + player.width > plat.x &&
        player.x < plat.x + plat.width
      ) {
        player.y = plat.y - player.height;
        player.dy = 0;
        player.onGround = true;
        break;
      }
    }

    if (player.onGround) break;
  }

  player.onGround = false;
  for (let plat of platforms) {
    const nextY = player.y + player.dy;
    const onPlatform = player.x + player.width > plat.x &&
                       player.x < plat.x + plat.width &&
                       player.y + player.height <= plat.y &&
                       nextY + player.height >= plat.y;

    if (onPlatform) {
      player.y = plat.y - player.height;
      player.dy = 0;
      player.onGround = true;
      break;
    }

    // Clamp to bottom platform if falling below screen
    if (player.y + player.height > 600) {
      player.y = 600 - player.height;
      player.dy = 0;
      player.onGround = true;
    }
  }

  if (keys["Space"] && player.onGround) {
    player.dy = jumpStrength;
    player.onGround = false;
  }

  for (let barrel of barrels) {
    barrel.x += barrel.dx;

    // Barrel rolls down if it reaches end of platform
    let onPlatform = false;
    for (let plat of platforms) {
      if (
        barrel.x + barrel.size > plat.x &&
        barrel.x - barrel.size < plat.x + plat.width &&
        Math.abs(barrel.y + barrel.size - plat.y) < 5
      ) {
        onPlatform = true;
        break;
      }
    }

    if (!onPlatform) {
      barrel.y += 2; // simulate rolling/falling down
    }

    // If barrel reaches screen edge, fall down to next platform
    if (barrel.x > canvas.width || barrel.x < 0) {
      barrel.dx *= -1;
      barrel.y += 20; // drop to next level
    }

    if (player.x < barrel.x + barrel.size &&
        player.x + player.width > barrel.x &&
        player.y < barrel.y + barrel.size &&
        player.y + player.height > barrel.y) {
      alert("Game Over!");
      document.location.reload();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw platforms
  ctx.fillStyle = "#fff";
  for (let plat of platforms) {
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
  }

  // Draw ladders
  ctx.fillStyle = "blue";
  for (let ladder of ladders) {
    ctx.fillRect(ladder.x, ladder.y, 20, ladder.height);
  }

  // Draw barrels
  ctx.fillStyle = "red";
  for (let barrel of barrels) {
    ctx.beginPath();
    ctx.arc(barrel.x, barrel.y, barrel.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw player
  ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
