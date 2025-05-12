let items = [];
let spinning = false;
let angle = 0;
let spinVelocity = 0;
let targetAngle = 0;

const canvas = document.getElementById("wheelCanvas");
const spinButton = document.getElementById("spinBtn");
const regenButton = document.getElementById("regenBtn");
const arrow = document.querySelector(".arrow");
const canvasPanel = document.getElementById("canvasPanel");
const wheelContainer = document.getElementById("wheelContainer");
const generateButton = document.getElementById("generateBtn");
const resultDisplay = document.getElementById("result");
const loaderOverlay = document.getElementById("loaderOverlay");

canvas.classList.add("hidden");
canvasPanel.classList.add("hidden");
spinButton.classList.add("hidden");
regenButton.classList.add("hidden");
arrow.classList.add("hidden");
wheelContainer.classList.add("hidden");
resultDisplay.classList.add("hidden");

const ctx = canvas.getContext("2d");
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = centerX - 10;

function generateItems() {
  const prompt = document.getElementById("prompt").value;
  loaderOverlay.classList.remove("hidden");

  fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  })
    .then(res => {
      if (!res.ok) throw new Error("Server error: " + res.status);
      return res.json();
    })
    .then(data => {
      if (!data.items || !Array.isArray(data.items)) {
        throw new Error("Invalid response format.");
      }

      items = data.items;
      angle = 0;

      wheelContainer.classList.remove("hidden");
      canvasPanel.classList.remove("hidden");
      canvas.classList.remove("hidden");
      spinButton.classList.remove("hidden");
      regenButton.classList.remove("hidden");
      arrow.classList.remove("hidden");

      generateButton.classList.add("hidden");
      resultDisplay.classList.add("hidden");
      resultDisplay.textContent = "";

        subtleActive = false;
  drawWheel();
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      alert("Something went wrong. Please try again.");
    })
    .finally(() => {
      loaderOverlay.classList.add("hidden");
    });
}

let subtleRotation = 0;
let subtleActive = true;

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!spinning && subtleActive) {
    subtleRotation += 0.001;
    angle += 0.001;
  }
  if (!items.length) return;
  const anglePerItem = 2 * Math.PI / items.length;

    items.forEach((item, i) => {
    const startAngle = angle + i * anglePerItem;
    const endAngle = startAngle + anglePerItem;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();

    const themeColors = ['#17324D', '#397B89', '#C7DDF1', '#F06B67', '#B9372F'];
        ctx.fillStyle = themeColors[i % themeColors.length];
    
    ctx.fill();

    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + anglePerItem / 2);
    ctx.translate(radius * 0.65, 0);
    ctx.rotate(Math.PI);
    ctx.scale(-1, -1);

    ctx.fillStyle = "white";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = item.length > 30 ? item.slice(0, 27) + "..." : item;
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });
}

function spinWheel() {
  if (spinning || items.length === 0) return;

  angle = angle % (2 * Math.PI);
  const fullSpins = 5 * 2 * Math.PI;
  const randomOffset = Math.random() * 2 * Math.PI;
  targetAngle = angle + fullSpins + randomOffset;

  spinVelocity = 0.5;
  spinning = true;

  resultDisplay.classList.add("hidden");
  animateSpin();
}

function animateSpin() {
  angle += spinVelocity;
  spinVelocity *= 0.985;

  drawWheel();

  if (angle >= targetAngle || spinVelocity < 0.002) {
    spinning = false;
    angle = targetAngle % (2 * Math.PI);

    drawWheel();

    const anglePerItem = 2 * Math.PI / items.length;
    const pointerAngle = (3 * Math.PI / 2 - angle + 2 * Math.PI) % (2 * Math.PI);
    const winningIndex = Math.floor(pointerAngle / anglePerItem);
    const winner = items[winningIndex];

    document.getElementById("winnerText").textContent = `${winner}✨`;
    document.getElementById("winnerModal").classList.remove("hidden");
    
    return;
  }

  requestAnimationFrame(() => animateSpin());
}

spinButton.addEventListener("click", () => {
  subtleActive = false;
  spinWheel();
});

document.addEventListener("DOMContentLoaded", () => {
  setInterval(() => {
    if (!spinning && items.length > 0) {
      drawWheel();
    }
  }, 30);
  document.getElementById("loaderOverlay").classList.add("hidden");
});
function closeModal() {
  document.getElementById("winnerModal").classList.add("hidden");
}
