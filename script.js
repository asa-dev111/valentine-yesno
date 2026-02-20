const area = document.getElementById("area");
const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const msg = document.getElementById("msg");

function moveNoButton() {
  const areaRect = area.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const maxX = areaRect.width - btnRect.width;
  const maxY = areaRect.height - btnRect.height;

  const x = Math.max(0, Math.floor(Math.random() * maxX));
  const y = Math.max(0, Math.floor(Math.random() * maxY));

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

noBtn.style.left = "55%";
noBtn.style.top = "55%";
noBtn.style.transform = "translate(-50%, -50%)";

noBtn.addEventListener("pointerenter", moveNoButton);
noBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  moveNoButton();
});

yesBtn.addEventListener("click", () => {
  msg.textContent = "Yayyyyy!♡";
});