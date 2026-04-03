const SYMBOL_SIZE = 200;
const ROWS = 3;
const COLS = 5;

const symbols = [
  "img/1.jpg",
  "img/2.jpg",
  "img/3.jpg",
  "img/4.jpg",
  "img/5.jpg",
  "img/6.jpg",
  "img/7.jpg",
  "img/8.jpg",
  "img/9.jpg",
  "img/10.jpg",
];

const field = document.getElementById("field");
let reels = [];
let spinning = false;
function randomSymbol() {
  return Math.floor(Math.random() * symbols.length);
}
function createReels() {
  for (let i = 0; i < COLS; i++) {
    const reel = document.createElement("div");
    reel.className = "reel";
    const inner = document.createElement("div");
    inner.className = "reel-inner";
    const fragment = document.createDocumentFragment();
    for (let j = 0; j < 20; j++) {
      const img = document.createElement("img");
      img.src = symbols[randomSymbol()];
      fragment.appendChild(img);
    }
    inner.appendChild(fragment);

    reel.appendChild(inner);
    field.appendChild(reel);

    reels.push({
      el: inner,
      position: 0,
      speed: 0,
      isAnimating: false,
    });
  }
}

createReels();

function animate() {
  reels.forEach((reel) => {
    reel.position += reel.speed;

    if (reel.position >= SYMBOL_SIZE) {
      reel.position -= SYMBOL_SIZE;
      const first = reel.el.firstChild;
      reel.el.appendChild(first);
      first.src = symbols[randomSymbol()];
    }

    reel.el.style.transform = `translateY(-${Math.round(reel.position)}px)`;
  });

  requestAnimationFrame(animate);
}
animate();

document.getElementById("startBtn").onclick = () => {
  if (spinning) return;
  spinning = true;

  document.getElementById("result").textContent = "Крутим...";
  document.getElementById("combo").textContent = "";

  reels.forEach((r, i) => {
    r.speed = 20;
  });

  fakeApi().then((res) => stopSpin(res));
};
function stopSpin(res) {
  showCombination(res.combination);
  reels.forEach((reel, i) => {
    setTimeout(() => {
      slowStop(reel, res.combination[i]);
    }, i * 500);
  });

  document.getElementById("result").textContent =
    "Ответ сервера:  Задержка: " + res.delay + " сек";
}

function slowStop(reel, targetSymbolIndex) {
  let deceleration = 0.5;
  let lastTime = null;

  function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const delta = currentTime - lastTime;
    lastTime = currentTime;

    reel.speed -= deceleration * (delta / 16);

    if (reel.speed > 0) {
      requestAnimationFrame(animate);
    } else {
      reel.speed = 0;
      spinToSymbol(reel, targetSymbolIndex);
    }
  }

  requestAnimationFrame(animate);
}

function spinToSymbol(reel, targetSymbolIndex) {
  const children = reel.el.children;
  const total = children.length;
  const centerRow = 1;

  const currentRow = Math.floor(reel.position / SYMBOL_SIZE);
  const targetRow = currentRow + centerRow;

  const safeTargetIndex = Math.max(0, Math.min(total - 1, targetRow));

  children[safeTargetIndex].src = symbols[targetSymbolIndex];
  const targetPosition = (safeTargetIndex - centerRow) * SYMBOL_SIZE;

  smoothScroll(reel, targetPosition);
}

function smoothScroll(reel, target) {
  if (reel.isAnimating) return;
  reel.isAnimating = true;

  const start = reel.position;
  const distance = target - start;
  const duration = 400;
  let startTime = null;

  function animateScroll(time) {
    if (!startTime) startTime = time;
    const t = Math.min((time - startTime) / duration, 1);
    const eased = t < 1 ? t * t * (3 - 2 * t) : 1;

    reel.position = start + distance * eased;
    reel.el.style.transform = `translateY(-${Math.round(reel.position)}px)`;

    if (t < 1) {
      requestAnimationFrame(animateScroll);
    } else {
      reel.position = target;
      snapToGrid(reel);
      bounce(reel);
      reel.isAnimating = false;
      checkAllStopped();
    }
  }

  requestAnimationFrame(animateScroll);
}

function snapToGrid(reel) {
  const remainder = reel.position % SYMBOL_SIZE;
  if (remainder !== 0) {
    const adjustment =
      remainder > SYMBOL_SIZE / 2 ? SYMBOL_SIZE - remainder : -remainder;
    reel.position += adjustment;
  }
  reel.el.style.transform = `translateY(-${Math.round(reel.position)}px)`;
}
function bounce(reel) {
  const bounceDistance = SYMBOL_SIZE * 0.07;
  const start = reel.position;
  const down = start + bounceDistance;
  let t = 0;

  function anim() {
    t += 0.1;
    let current;

    if (t < 1) current = start + (down - start) * (1 - Math.pow(1 - t, 2));
    else if (t < 2) {
      const p = t - 1;
      current = down - (down - start) * Math.pow(p, 2);
    } else {
      reel.position = start;
      reel.el.style.transform = `translateY(-${Math.round(start)}px)`;
      return;
    }

    reel.position = current;
    reel.el.style.transform = `translateY(-${Math.round(current)}px)`;
    requestAnimationFrame(anim);
  }

  anim();
}

function checkAllStopped() {
  const allStopped = reels.every((r) => r.speed === 0);
  if (allStopped) spinning = false;
}

function showCombination(combination) {
  const container = document.getElementById("combo");
  container.innerHTML = "";

  combination.forEach((index) => {
    const img = document.createElement("img");
    img.src = symbols[index];
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.margin = "5px";
    container.appendChild(img);
  });
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

function checkOrientation() {
  if (!isMobileDevice()) {
    document.body.classList.remove("orientation-warning");
    return;
  }

  const isPortrait = window.innerHeight > window.innerWidth;
  if (!isPortrait) {
    document.body.classList.add("orientation-warning");
  } else {
    document.body.classList.remove("orientation-warning");
  }
}

window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);
checkOrientation();
