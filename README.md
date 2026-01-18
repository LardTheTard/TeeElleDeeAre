# TeeElleDeeAre (TLDR) 


**Too Long; Didn't Read** - An AI-powered Chrome extension that summarizes web content and integrates with Google Docs. Scroll to the very bottom for author notes.

## 📋 Overview

TeeElleDeeAre is a Chrome extension that helps you quickly understand web content by generating AI-powered summaries. It can extract text from any webpage, summarize it using Meta's Llama 3.1 model, and optionally insert summaries directly into your Google Docs.

## ✨ Features

### 🤖 AI-Powered Summarization
- Generates concise summaries of web pages using Meta Llama 3.1 8B Instruct model
- Customizable summary length via max tokens (100-500)
- Adjustable text extraction scope (300-1000 elements)

### 📄 Google Docs Integration
- Connect your Google Document for automatic summary insertion
- OAuth2 authentication for secure document access
- Direct insertion of summaries into your connected document

### ⌨️ Keyboard Shortcuts
- **S key**: Summarize a link (hold S and click any link)
- **T key**: Display raw HTML content analysis of a link
- **X key**: Summarize and automatically insert into connected Google Doc

### 📊 Reading Time Estimation
- Automatically calculates and displays reading time for articles
- Works on developer documentation sites (chrome.com/docs)

## 🚀 Installation

### Prerequisites
- Google Chrome browser
- Hugging Face API token (for AI summarization)
- Google Cloud OAuth2 client ID (for Google Docs integration)

### Setup Steps

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd SummaryExtension
   ```

2. **Create `config.js` file**
   Create a `config.js` file in the root directory with your Hugging Face token:
   ```javascript
   const HF_TOKEN = 'your_huggingface_token_here';
   ```
   > **Note**: `config.js` is in `.gitignore` and should not be committed to version control.

3. **Get your Hugging Face Token**
   - Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Create a new token with "Make calls to Inference Providers" permission
   - Add the token to `config.js`

4. **Configure Google OAuth2** (for Google Docs integration)
   - The extension includes a pre-configured OAuth2 client ID in `manifest.json`
   - If needed, create your own OAuth2 credentials at [Google Cloud Console](https://console.cloud.google.com/)
   - Update the `client_id` in `manifest.json` if using your own credentials

5. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `SummaryExtension` directory

## 📖 Usage

### Initial Setup

1. **Open the Extension Popup**
   - Click the TLDR icon in your Chrome toolbar

2. **Configure Settings**
   - **Max Tokens**: Adjust the slider (100-500) to control summary length
     - Lower values (100-150): Short, concise summaries (2-3 sentences)
     - Medium values (151-250): Medium summaries (3-4 sentences)
     - Higher values (251-500): Longer summaries (4-5 sentences)
   - **Max Scope**: Adjust how many HTML elements to extract (300-1000)
     - Higher values extract more content but may be slower

3. **Connect Google Document** (Optional)
   - Enter your Google Document URL in the input field
   - Click "Connect Document"
   - The extension will remember this document for future use

### Summarizing Links

1. **Hold the S key** and **click any link** on any webpage
2. The extension will:
   - Fetch the linked page content
   - Extract main text content
   - Generate an AI summary
   - Display it in a tooltip overlay

### Inserting Summaries into Google Docs

1. **Hold the X key** and **click any link**
2. The extension will:
   - Generate a summary (same as S key)
   - Automatically insert it into your connected Google Doc
   - Show confirmation in the tooltip

### Other Features

- **T key**: Analyze HTML content structure (links, images count, etc.)
- **Reading Time**: Automatically appears on supported documentation sites

## 📁 Project Structure

```
SummaryExtension/
├── manifest.json              # Extension manifest (permissions, config)
├── popup.html                 # Extension popup UI
├── config.js                  # API tokens (not in git, create yourself)
├── .gitignore                 # Git ignore file
├── icons/                     # Extension icons
│   ├── memo-emoji-16.png
│   ├── memo-emoji-48.png
│   └── memo-emoji-128.png
├── scripts/                   # JavaScript files
│   ├── background.js          # Service worker (API calls, OAuth)
│   ├── popup.js               # Popup UI logic
│   ├── tooltip.js             # Content script (keyboard shortcuts, tooltips)
│   └── readingTime.js         # Reading time calculation
└── styles/                    # CSS stylesheets
    ├── popup.css              # Popup styling
    └── tooltip.css            # Tooltip overlay styling
```

## 🔧 Configuration

### API Settings

The extension uses the following APIs:

1. **Hugging Face Router API**
   - Model: `meta-llama/Llama-3.1-8B-Instruct`
   - Endpoint: `https://router.huggingface.co/v1/chat/completions`
   - Requires: HF_TOKEN in `config.js`

2. **Google Docs API**
   - Endpoint: `https://docs.googleapis.com/v1/documents/{id}:batchUpdate`
   - Requires: OAuth2 authentication (handled automatically)

### Storage

The extension stores the following in `chrome.storage.local`:
- `maxTokens`: Maximum tokens for summaries (default: 150)
- `maxscope`: Maximum elements to extract (default: 300)
- `docId`: Connected Google Document ID
- `oauthToken`: Google OAuth token (cached)

## 🛠️ Technologies Used

- **Chrome Extension APIs**: Manifest V3, Content Scripts, Service Workers
- **AI Model**: Meta Llama 3.1 8B Instruct via Hugging Face Router API
- **APIs**: 
  - Hugging Face Inference API (Router)
  - Google Docs API
  - Google OAuth2
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: Chrome Storage API (local)

## ⚠️ Important Notes

### API Costs
- Hugging Face Router API provides small monthly credits (~$0.10 for free accounts)
- After credits are exhausted, usage is pay-as-you-go
- Monitor your usage to avoid unexpected charges

### Privacy
- The extension fetches web page content locally in your browser
- Summaries are sent to Hugging Face API for processing
- Google Docs integration uses OAuth2 with standard Google permissions
- No data is stored on external servers (except API calls)

### Limitations
- Text extraction is limited to 1000 characters by default (configurable)
- Maximum tokens affects summary quality and length
- Some websites may block content fetching due to CORS policies

## 🐛 Troubleshooting

### Extension Not Working
- Ensure the extension is enabled in `chrome://extensions/`
- Check that `config.js` exists and contains a valid `HF_TOKEN`
- Reload the extension after making changes

### Summarization Errors
- Verify your Hugging Face token has correct permissions
- Check your API usage/credits on Hugging Face dashboard
- Ensure internet connection is active

### Google Docs Integration Issues
- Verify OAuth2 client ID is correct in `manifest.json`
- Check that the Google Document URL is valid and accessible
- Ensure you have edit permissions on the document

### Tooltips Not Showing
- Check browser console for errors (F12)
- Verify content scripts are running on the page
- Try reloading the page after installing the extension

## 📝 License

This project is provided as-is for educational and personal use.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📧 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Made with ❤️ for those who want to read less, understand more.**

## Author Notes

### Possible improvements

- Allow users to change their keybinds for different functionalities, like using 'u' instead for summarization.

- Improve the note-taking abilities when scribing to the Google Docs, making it a proper point-form or other format. 

### Really hard to set up right now

- Since it hasn't been verified yet, it's not on the Chrome extensions store, so you have to manually set it up as a test extension yourself, and add a config.js file with the HF token.

- Also only works for select browsers. Popular ones like Edge should work, but Perplexity for example malfunctions.

### Motivation

- Just a quick (~4 days) project to get my foot in the door. Helped with learning APIs and asynchronous functions.
