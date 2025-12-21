const sections = [
  "landing",
  "tryAgain",
  "menu",
  "gallery",
  "flower",
  "voice",
  "letter"
];

function showSection(id) {
  sections.forEach(section => {
    document.getElementById(section).classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}

function yesPlease() {
  showSection("menu");
}

function noThanks() {
  showSection("tryAgain");
}

function goBack() {
  showSection("landing");
}

function openSection(section) {
  showSection(section);
}

function goMenu() {
  showSection("menu");
}

function goHome() {
  showSection("landing");
}

function playVoice() {
  const audio = document.getElementById("voiceAudio");
  const kiss = document.getElementById("kiss");

  audio.play();
  kiss.classList.remove("hidden");

  setTimeout(() => {
    kiss.classList.add("hidden");
  }, 3000);
}
