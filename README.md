# 🌐 English to Chinese Translator

A Chrome Extension that translates English text to Chinese with one click.

## Features

- **Alt+Q Shortcut**: Select English text and press `Alt+Q` for instant translation ✨
- **Double-click translation**: Double-click any English text for instant translation
- **Right-click menu**: Right-click selected text → "Translate to Chinese"
- **Popup panel**: Click the extension icon to open the translation panel

## Installation

1. Open `chrome://extensions/`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `chrome-translate-extension` folder

## Usage

### Quick Start: Alt+Q (Recommended)
1. Select any English text on any webpage
2. Press `Alt+Q`
3. Chinese translation appears instantly!

### Other Methods

#### Double-click
Select English text and double-click — a floating tooltip shows the Chinese translation.

#### Right-click Menu
Right-click on selected text and choose "🌐 翻译成中文" from the context menu.

#### Popup Panel
Click the extension icon in the toolbar to open the translation panel.

## Tech Stack

- **Manifest V3** (Chrome Extension Manifest)
- **Google Translate API** (free, no API key required)
- Pure HTML/CSS/JS — no dependencies

## Project Structure

```
chrome-translate-extension/
├── manifest.json      # Extension configuration
├── popup.html         # Popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic
├── content.js         # Shortcut/double-click/right-click translation
├── content.css        # Tooltip styles
├── background.js      # Service worker
└── icons/             # Extension icons
```

## Keyboard Shortcut

| Shortcut | Action |
|----------|--------|
| `Alt+Q` | Translate selected English text to Chinese |

> Note: On macOS, use `Option+Q` instead of `Alt+Q`

## License

MIT
