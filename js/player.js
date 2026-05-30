const albumCover = document.querySelector("#albumCover");

if (albumCover) {
  const coverBox = albumCover.closest(".cover");

  function revealCover() {
    coverBox.classList.add("is-loaded");
  }

  if (albumCover.complete && albumCover.naturalWidth > 0) {
    revealCover();
  } else {
    albumCover.addEventListener("load", revealCover);
    albumCover.addEventListener("error", revealCover);
  }
}

const players = Array.from(document.querySelectorAll(".player"));
const audios = players.map((player) => player.querySelector(".hidden-audio"));

let animationFrameId = null;
let activeAudio = null;

function resetButton(player) {
  const track = player.closest(".track");
  const icon = player.querySelector(".play-btn i");

  track.classList.remove("playing");
  icon.classList.remove("fa-pause");
  icon.classList.add("fa-play");
}

function activateButton(player) {
  const track = player.closest(".track");
  const icon = player.querySelector(".play-btn i");

  document.querySelectorAll(".track").forEach((item) => item.classList.remove("playing"));
  document.querySelectorAll(".play-btn i").forEach((item) => {
    item.classList.remove("fa-pause");
    item.classList.add("fa-play");
  });

  track.classList.add("playing");
  icon.classList.remove("fa-play");
  icon.classList.add("fa-pause");
}

function paintProgress(audio, player) {
  const fill = player.querySelector(".progress-fill");

  if (!audio.duration || Number.isNaN(audio.duration)) {
    fill.style.width = "0%";
    return;
  }

  const progress = Math.min((audio.currentTime / audio.duration) * 100, 100);
  fill.style.width = `${progress}%`;
}

function startProgressLoop(audio, player) {
  cancelAnimationFrame(animationFrameId);

  function update() {
    paintProgress(audio, player);

    if (!audio.paused && !audio.ended) {
      animationFrameId = requestAnimationFrame(update);
    }
  }

  update();
}

function playByIndex(index) {
  const safeIndex = (index + players.length) % players.length;
  const player = players[safeIndex];
  const audio = audios[safeIndex];

  audios.forEach((item) => {
    if (item !== audio) {
      item.pause();
    }
  });

  activeAudio = audio;
  audio.play().then(() => {
    activateButton(player);
    startProgressLoop(audio, player);
  }).catch(() => {
    resetButton(player);
  });
}

players.forEach((player, index) => {
  const audio = player.querySelector(".hidden-audio");
  const button = player.querySelector(".play-btn");
  const progressWrap = player.querySelector(".progress-wrap");
  const duration = player.querySelector(".duration");

  duration.textContent = player.dataset.duration || duration.textContent;

  button.addEventListener("click", () => {
    if (audio.paused) {
      playByIndex(index);
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    activateButton(player);
    startProgressLoop(audio, player);
  });

  audio.addEventListener("pause", () => {
    resetButton(player);
    paintProgress(audio, player);
  });

  audio.addEventListener("ended", () => {
    player.querySelector(".progress-fill").style.width = "0%";
    audio.currentTime = 0;
    playByIndex(index + 1);
  });

  progressWrap.addEventListener("click", (event) => {
    if (!audio.duration || Number.isNaN(audio.duration)) return;

    const rect = progressWrap.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);

    audio.currentTime = percent * audio.duration;
    paintProgress(audio, player);
  });
});

window.addEventListener("load", () => {
  playByIndex(0);
});

document.addEventListener("contextmenu", (event) => {
  if (event.target.closest(".player") || event.target.closest(".cover")) {
    event.preventDefault();
  }
});

const countdown = document.querySelector(".countdown");

if (countdown) {
  const releaseDate = new Date(countdown.dataset.releaseDate).getTime();

  const daysElement = document.querySelector("#days");
  const hoursElement = document.querySelector("#hours");
  const minutesElement = document.querySelector("#minutes");
  const secondsElement = document.querySelector("#seconds");
  const messageElement = document.querySelector("#countdown-message");

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function updateCountdown() {
    const now = Date.now();
    const distance = releaseDate - now;

    if (distance <= 0) {
      daysElement.textContent = "00";
      hoursElement.textContent = "00";
      minutesElement.textContent = "00";
      secondsElement.textContent = "00";
      messageElement.textContent = "Ya disponible.";

      clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    daysElement.textContent = pad(days);
    hoursElement.textContent = pad(hours);
    minutesElement.textContent = pad(minutes);
    secondsElement.textContent = pad(seconds);
  }

  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);
}

const tooltip = document.querySelector("#cursorTooltip");
const disabledLinks = document.querySelectorAll(".is-disabled");

if (tooltip) {
  disabledLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
    });

    link.addEventListener("mouseenter", () => {
      tooltip.textContent = link.dataset.tooltip || "Todavía no disponible";
      tooltip.classList.add("show");
    });

    link.addEventListener("mousemove", (event) => {
      tooltip.style.left = `${event.clientX}px`;
      tooltip.style.top = `${event.clientY}px`;
    });

    link.addEventListener("mouseleave", () => {
      tooltip.classList.remove("show");
    });
  });
}