document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("family-unlock-form");
  const passwordInput = document.getElementById("family-password");
  const errorEl = document.getElementById("family-error");
  const gate = document.getElementById("family-gate");
  const content = document.getElementById("family-content");
  const frame = document.getElementById("video-frame");
  const titleEl = document.getElementById("video-title");
  const descriptionEl = document.getElementById("video-description");
  const playlistEl = document.getElementById("video-playlist");

  if (!form) {
    return;
  }

  let videos = [];

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();

    if (!window.crypto || !window.crypto.subtle) {
      showError("Your browser can't run the decryption (Web Crypto API unavailable). Please use a modern browser over HTTPS.");
      return;
    }

    if (!ENCRYPTED_FAMILY_DATA) {
      showError("No family content has been published yet.");
      return;
    }

    const passphrase = passwordInput.value;

    try {
      const json = await FamilyCrypto.decryptText(passphrase, ENCRYPTED_FAMILY_DATA);
      videos = JSON.parse(json);
      renderPlaylist();
      selectVideo(0);
      gate.hidden = true;
      content.hidden = false;
    } catch (err) {
      showError("Incorrect password. Please try again.");
      passwordInput.value = "";
      passwordInput.focus();
    }
  });

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function hideError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }

  function extractYouTubeId(urlOrId) {
    if (!urlOrId) return "";
    if (/^[\w-]{11}$/.test(urlOrId)) {
      return urlOrId;
    }
    try {
      const url = new URL(urlOrId);
      if (url.hostname.includes("youtu.be")) {
        return url.pathname.slice(1);
      }
      if (url.searchParams.get("v")) {
        return url.searchParams.get("v");
      }
      const embedMatch = url.pathname.match(/\/embed\/([\w-]{11})/);
      if (embedMatch) {
        return embedMatch[1];
      }
    } catch (err) {
      /* not a URL - fall through and use the raw value */
    }
    return urlOrId;
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value == null ? "" : String(value);
    return div.innerHTML;
  }

  function renderPlaylist() {
    playlistEl.innerHTML = "";

    videos.forEach((video, index) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "playlist-item";
      button.dataset.index = String(index);
      button.innerHTML = `
        <span class="playlist-index">${index + 1}</span>
        <span class="playlist-title">${escapeHtml(video.title || "Untitled")}</span>
      `;
      button.addEventListener("click", () => selectVideo(index));
      item.appendChild(button);
      playlistEl.appendChild(item);
    });
  }

  function selectVideo(index) {
    const video = videos[index];
    if (!video) {
      return;
    }

    const videoId = extractYouTubeId(video.url || video.id);
    const title = video.title || "Family video";

    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`;
    frame.title = title;
    titleEl.textContent = title;
    descriptionEl.textContent = video.description || "";
    descriptionEl.hidden = !video.description;

    playlistEl.querySelectorAll(".playlist-item").forEach((button) => {
      const isActive = Number(button.dataset.index) === index;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }
});
