# 🌐 English to Chinese Translator

A Chrome Extension that translates English text to Chinese with one click.

## Features

- **Double-click translation**: Select English text and double-click to see instant translation
- **Right-click menu**: Right-click selected text → "Translate to Chinese"
- **Popup panel**: Click the extension icon to open the translation panel

## Installation

1. Open `chrome://extensions/`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `chrome-translate-extension` folder

## Usage

### Method 1: Double-click
Select any English text and double-click — a floating tooltip will show the Chinese translation.

### Method 2: Right-click Menu
Right-click on selected text and choose "🌐 翻译成中文" from the context menu.

### Method 3: Popup Panel
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
├── content.js         # Double-click/right-click translation
├── content.css        # Tooltip styles
├── background.js      # Service worker
└── icons/             # Extension icons
```

## License

MIT
