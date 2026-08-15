document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("family-unlock-form");
  const passwordInput = document.getElementById("family-password");
  const errorEl = document.getElementById("family-error");
  const gate = document.getElementById("family-gate");
  const content = document.getElementById("family-content");
  const list = document.getElementById("family-video-list");

  if (!form) {
    return;
  }

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
      const videos = JSON.parse(json);
      renderVideos(videos);
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

  function renderVideos(videos) {
    list.innerHTML = "";

    videos.forEach((video) => {
      const videoId = extractYouTubeId(video.url || video.id);
      const item = document.createElement("li");
      item.className = "video-card";
      item.innerHTML = `
        <h3>${escapeHtml(video.title || "Untitled")}</h3>
        ${video.description ? `<p>${escapeHtml(video.description)}</p>` : ""}
        <div class="video-embed">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}"
            title="${escapeHtml(video.title || "Family video")}"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `;
      list.appendChild(item);
    });
  }
});
