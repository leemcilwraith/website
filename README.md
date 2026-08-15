# website

Personal site - static HTML/CSS/vanilla JS, no build step, deployed via GitHub Pages.

## Structure

- `index.html`, `about.html`, `projects.html`, `contact.html` - public pages.
- `family.html` - password-gated page listing private family videos.
- `assets/css/style.css` - all site styling.
- `assets/js/main.js` - mobile nav toggle, footer year.
- `assets/js/social-links.js` - single place to set social URLs (see below).
- `assets/js/crypto.js` - shared AES-GCM/PBKDF2 module used by both the site
  and the local encryptor tool. Contains no secrets - safe to commit.
- `assets/js/family.js` - decrypts and renders the family video list.
- `family-data.js` - holds only the **encrypted** blob for the Family page.
- `tools/encryptor.html` - standalone local tool to produce that blob.

## Content to fill in

Everything is currently placeholder copy (`Your Name`, sample bios, project
cards, `you@example.com`, etc.) - search the HTML files for these and replace
with real content.

### Social links

Edit `assets/js/social-links.js` and fill in the URLs you want to use. Any
left blank are automatically hidden across every page.

### Custom domain

No `CNAME` file is committed yet. Once you have a domain:

1. Add a `CNAME` file at the repo root containing just the domain, e.g. `example.com`.
2. Point your DNS at GitHub Pages (an `A`/`ALIAS` record for an apex domain, or a `CNAME` record for a subdomain - see GitHub's Pages docs for current IPs).
3. In the repo's Settings > Pages, enter the custom domain and enable "Enforce HTTPS" once it resolves.

## Family area

The video list is never committed in plaintext. To publish or update it:

1. Open `tools/encryptor.html` in a browser (double-click the file, or serve
   it locally - see below if `crypto.subtle` isn't available over `file://`).
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
`main` and the site is live at the repo's `github.io` URL (or the custom
domain once configured).
