const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = {
  x: 50,
  y: 580,
  width: 24,
  height: 37,
  dy: 0,
  onGround: false
};

const gravity = 0.5;
const jumpStrength = -10;
let keys = {};
let barrels = [];
let platforms = [
  { x: 0, y: 600, width: 480, height: 20 },
  { x: 0, y: 500, width: 400, height: 10 },
  { x: 80, y: 400, width: 400, height: 10 },
  { x: 0, y: 300, width: 400, height: 10 },
  { x: 80, y: 200, width: 400, height: 10 },
];

function spawnBarrel() {
  barrels.push({ x: 0, y: 200, size: 15, dx: 2 });
}

setInterval(spawnBarrel, 2000);

document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

const playerSprite = new Image();
playerSprite.src = "Cheetah.png";

function update() {
  if (keys["ArrowLeft"]) player.x -= 3;
  if (keys["ArrowRight"]) player.x += 3;
  if (keys["Space"] && player.onGround) {
    player.dy = jumpStrength;
    player.onGround = false;
  }

  player.dy += gravity;
  player.y += player.dy;

  player.onGround = false;
  for (let plat of platforms) {
    if (player.x < plat.x + plat.width &&
        player.x + player.width > plat.x &&
        player.y + player.height < plat.y + 5 &&
        player.y + player.height + player.dy >= plat.y) {
      player.y = plat.y - player.height;
      player.dy = 0;
      player.onGround = true;
    }
  }

  for (let barrel of barrels) {
    barrel.x += barrel.dx;
    if (barrel.x > canvas.width) barrel.x = 0;

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

  ctx.fillStyle = "#fff";
  for (let plat of platforms) {
    ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
  }

  ctx.fillStyle = "red";
  for (let barrel of barrels) {
    ctx.beginPath();
    ctx.arc(barrel.x, barrel.y, barrel.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
