# Login background images

Place login screen background images in this folder.

## Default image

| File | Usage |
|------|--------|
| `login-default.png` | Shipped default — modern office workspace photo |

## Change the background

1. Add your image here (e.g. `my-office.jpg`, `team-photo.webp`).
2. Open `js/config.js` and set:

```js
LOGIN_BACKGROUND: 'assets/backgrounds/my-office.jpg',
```

3. Hard-refresh the browser (`Ctrl+Shift+R`).

## Tips

- **Recommended size:** 1920×1080 or larger (landscape).
- **Formats:** `.jpg`, `.png`, `.webp`
- **Subject:** Keep the center-left area relatively clear so headline text stays readable, or use a brighter photo — the UI adds a light gradient scrim automatically.
- Paths are **relative to `index.html`** (project root), not this folder.

## Files in this folder

You can keep multiple backgrounds and switch via `config.js`:

```
assets/backgrounds/
├── README.md           ← this file
├── login-default.png   ← current default
├── login-dark.jpg      ← optional alternate
└── login-custom.webp   ← your own image
```
