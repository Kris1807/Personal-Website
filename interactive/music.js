export function bindMuseumMusic(audio, buttons, statuses) {
  let pending = false;
  let failed = false;
  let quiet = false;
  let resumeAfterProjects = false;
  let generation = 0;

  function render() {
    const playing = !quiet && (pending || (!audio.paused && !failed));
    const action = playing ? "Pause" : "Play";
    for (const button of buttons) {
      button.disabled = quiet;
      button.setAttribute("aria-label", quiet ? "Museum music off in Projects" : `${action} museum music`);
      button.querySelector("[data-music-label]").textContent = quiet ? "Music off in Projects" : `${action} music`;
      button.dataset.playing = String(playing);
    }
    for (const status of statuses) {
      status.textContent = failed && !quiet ? "Music unavailable. Try again." : "";
      status.hidden = !failed || quiet;
    }
  }

  function pause() {
    generation++;
    pending = false;
    if (!audio.paused) audio.pause();
  }

  async function play() {
    const attempt = ++generation;
    pending = true;
    failed = false;
    try {
      if (!audio.getAttribute("src")) audio.src = audio.dataset.src;
      else if (audio.error) audio.load();
      const playing = audio.play();
      render();
      await playing;
    } catch (error) {
      if (attempt === generation && error?.name !== "AbortError") failed = true;
    } finally {
      if (attempt === generation) {
        pending = false;
        render();
      }
    }
  }

  for (const button of buttons) button.addEventListener("click", () => {
    if (quiet) return;
    if (pending || (!audio.paused && !failed)) {
      pause();
      render();
    } else void play();
  });
  for (const event of ["play", "playing"]) audio.addEventListener(event, () => {
    if (quiet) pause();
    render();
  });
  for (const event of ["pause", "ended"]) audio.addEventListener(event, render);
  audio.addEventListener("error", () => { if (!quiet) { failed = true; render(); } });

  render();
  return function setMusicRoom(roomId) {
    const nextQuiet = roomId === "projects";
    if (quiet === nextQuiet) return;
    quiet = nextQuiet;
    if (quiet) {
      resumeAfterProjects = pending || (!audio.paused && !failed);
      pause();
    } else if (resumeAfterProjects) {
      resumeAfterProjects = false;
      void play();
    }
    render();
  };
}
