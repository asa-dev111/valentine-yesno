const area = document.getElementById("area");
const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const msg = document.getElementById("msg");
const success = document.getElementById("success");
const copyBtn = document.getElementById("copyBtn");

const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d", { alpha: true });

let yesScale = 1;
let isDone = false;

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function setCanvasSize(){
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function getYesRectInArea(){
  // getBoundingClientRectはviewport基準なので、area基準に変換する
  const a = area.getBoundingClientRect();
  const y = yesBtn.getBoundingClientRect();
  return {
    left: y.left - a.left,
    top: y.top - a.top,
    right: y.right - a.left,
    bottom: y.bottom - a.top
  };
}

function overlaps(r1, r2){
  return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function growYes(){
  // 成長速度（好みで0.12〜0.30くらい）
  yesScale = Math.min(yesScale + 0.18, 3.2);
  yesBtn.style.transform = `translate(-50%, -50%) scale(${yesScale})`;
  yesBtn.classList.add("growing");

  if (yesScale >= 2.2 && !msg.textContent) {
    msg.textContent = "Come on… 😌💘";
  }
  if (yesScale >= 2.8 && msg.textContent !== "Just say YES 😌💘") {
    msg.textContent = "Just say YES 😌💘";
  }
}

function moveNoButton(){
  const a = area.getBoundingClientRect();
  const b = noBtn.getBoundingClientRect();

  const areaW = a.width;
  const areaH = a.height;

  // 余白（端で押せちゃうのを防ぐ）
  const padding = 10;

  // NOの中心点が動ける範囲
  const halfW = b.width / 2;
  const halfH = b.height / 2;

  const minX = halfW + padding;
  const maxX = areaW - halfW - padding;
  const minY = halfH + padding;
  const maxY = areaH - halfH - padding;

  // YESの周りには出現しにくいように“禁止ゾーン”を作る
  const yesRect = getYesRectInArea();
  const avoidPad = 16; // YESまわりの余白
  const avoid = {
    left: yesRect.left - avoidPad,
    top: yesRect.top - avoidPad,
    right: yesRect.right + avoidPad,
    bottom: yesRect.bottom + avoidPad
  };

  // 何回か試行して、YESに被らない場所を探す
  let x = (minX + maxX) / 2;
  let y = (minY + maxY) / 2;

  for (let i = 0; i < 18; i++){
    const rx = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const ry = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    const candidate = {
      left: rx - halfW,
      top: ry - halfH,
      right: rx + halfW,
      bottom: ry + halfH
    };

    if (!overlaps(candidate, avoid)) {
      x = rx; y = ry;
      break;
    }
    // 最後までダメならどこでもOK（完全に詰むのを防ぐ）
    if (i === 17) { x = rx; y = ry; }
  }

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = "translate(-50%, -50%)";
}

function onTryNo(e){
  if (isDone) return;
  // NOを押させない（スマホのタップを無効化）
  if (e) e.preventDefault();

  growYes();
  moveNoButton();
}

// 初期位置
function resetPositions(){
  // YESは左固定
  yesScale = 1;
  yesBtn.style.left = "35%";
  yesBtn.style.top = "55%";
  yesBtn.style.transform = "translate(-50%, -50%) scale(1)";
  yesBtn.classList.remove("growing");

  // NOは右寄り
  noBtn.style.left = "65%";
  noBtn.style.top = "55%";
  noBtn.style.transform = "translate(-50%, -50%)";
}

resetPositions();
setCanvasSize();

noBtn.addEventListener("pointerenter", onTryNo);
noBtn.addEventListener("pointerdown", onTryNo); // スマホ/タブレット
noBtn.addEventListener("touchstart", onTryNo, { passive: false }); // 保険

yesBtn.addEventListener("click", () => {
  if (isDone) return;
  isDone = true;

  msg.textContent = "";
  area.classList.add("hidden");
  success.classList.remove("hidden");

  burstConfetti();
});

copyBtn.addEventListener("click", async () => {
  const url = location.href;
  try{
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
      copyBtn.textContent = "Shared! 💘";
      return;
    }
  }catch(_){ /* ignore */ }

  try{
    await navigator.clipboard.writeText(url);
    copyBtn.textContent = "Copied! 💘";
  }catch(_){
    // clipboardが使えない環境向けフォールバック
    prompt("Copy this link:", url);
  }
});

window.addEventListener("resize", () => {
  setCanvasSize();
  // 画面サイズ変化でNOが外に出ないように調整
  if (!isDone) moveNoButton();
});

/* ===== Confetti (no external libs) ===== */
function burstConfetti(){
  setCanvasSize();
  const rect = canvas.getBoundingClientRect();

  const particles = [];
  const colors = ["#ff4d7d", "#ffd166", "#06d6a0", "#118ab2", "#8338ec"];
  const count = 140;

  for (let i = 0; i < count; i++){
    particles.push({
      x: rect.width / 2,
      y: rect.height * 0.35,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.9) * 12,
      g: 0.35 + Math.random() * 0.18,
      r: 2 + Math.random() * 3,
      a: 1,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  const start = performance.now();
  const duration = 1300;

  function frame(t){
    const elapsed = t - start;
    ctx.clearRect(0, 0, rect.width, rect.height);

    particles.forEach(p => {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.a = clamp(1 - elapsed / duration, 0, 1);

      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r, p.r * 2.2, p.r * 1.4);
      ctx.restore();
    });

    if (elapsed < duration) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, rect.width, rect.height);
  }

  requestAnimationFrame(frame);
}