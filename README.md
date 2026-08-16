# website

Personal site - static HTML/CSS/vanilla JS, no build step, deployed via GitHub Pages.

## Structure

- `index.html` - single-page site (Home, About, Projects, Contact as anchored
  sections with a sticky nav).
- `family/index.html` - password-gated page listing private family videos,
  served at `/family/`. Deliberately not linked from the main nav.
- `assets/css/style.css` - all site styling.
- `assets/js/main.js` - mobile nav toggle, footer year.
- `assets/js/social-links.js` - single place to set social URLs (see below).
- `assets/js/crypto.js` - shared AES-GCM/PBKDF2 module used by both the site
  and the local encryptor tool. Contains no secrets - safe to commit.
- `assets/js/family.js` - decrypts and renders the family video list.
- `family-data.js` - holds only the **encrypted** blob for the Family page.
- `tools/encryptor.html` - standalone local tool to produce that blob.

### Social links

Edit `assets/js/social-links.js` and fill in the URLs you want to use. Any
left blank are automatically hidden across every page.

### Custom domain

`CNAME` is committed with `leemcilwraith.com`. If it ever needs to change,
update DNS first, then the `CNAME` file, then re-check "Enforce HTTPS" in the
repo's Settings > Pages.

## Family area

The video list is never committed in plaintext. To publish or update it:

1. Open `https://leemcilwraith.com/tools/encryptor.html` directly (it's
   already deployed, so this is a secure context and needs no local server) -
   or open `tools/encryptor.html` locally if working offline; see below if
   `crypto.subtle` isn't available over `file://`.
2. Enter a strong passphrase and your video list as JSON, e.g.:
   ```json
   [
     { "title": "Birthday party 2026", "description": "Optional", "url": "https://youtu.be/VIDEOID" }
   ]
   ```
3. Click Encrypt, copy the output blob.
4. Paste it as the value of `ENCRYPTED_FAMILY_DATA` in `family-data.js`.
5. Share the passphrase with family separately (never commit it).

If your browser doesn't expose `crypto.subtle` over `file://`, run a local
server instead:

```
python3 -m http.server
open http://localhost:8000/tools/encryptor.html
```

## Deployment

GitHub Pages is configured to serve from the `main` branch root. Push to
`main` and the site is live at `leemcilwraith.com`.
