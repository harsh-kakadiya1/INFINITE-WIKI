<div align="">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🌟 Infinite Wiki

An AI-powered encyclopedia application that generates encyclopedia-style definitions and ASCII art visualizations for any topic using Google's Gemini 2.5 Flash API.

## ✨ Features

- **🔍 Smart Search**: Search for any term, concept, or topic
- **📚 Encyclopedia Definitions**: Get concise, informative definitions in encyclopedia style
- **🎨 ASCII Art Generation**: Visual representations of concepts using ASCII characters
- **🎲 Random Word Generator**: Discover interesting new topics with the random word feature
- **⚡ Real-time Streaming**: Watch definitions appear in real-time as they're generated
- **🎯 High Performance**: Optimized for low latency with thinking budget controls

## 🚀 Live Demo

View my app live : [INFINITE_WIKI](https://infinite-wikip.netlify.app/)

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **AI API**: Google Gemini 2.5 Flash
- **Styling**: CSS with modern design
- **Package Manager**: npm

## 📋 Prerequisites

- **Node.js** (version 18 or higher)
- **Google Gemini API Key** (Get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/harsh-kakadiya1/INFINITE-WIKI.git
cd infinite-wiki
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Key

Create a `.env.local` file in the root directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Replace `your_gemini_api_key_here` with your actual Gemini API key.

### 4. Run the Application
```bash
npm run dev
```

The application will be available at: **http://localhost:5173**

## 🎮 How to Use

1. **Search for Terms**: Type any word, concept, or topic in the search bar
2. **Get Definitions**: View encyclopedia-style definitions that appear in real-time
3. **See ASCII Art**: Marvel at ASCII art visualizations that represent the concept
4. **Try Random**: Click "Random" to discover interesting new topics
5. **Explore History**: Browse through your previous searches

## 📁 Project Structure

```
infinite-wiki/
├── components/           # React components
│   ├── AsciiArtDisplay.tsx
│   ├── ContentDisplay.tsx
│   ├── History.tsx
│   ├── LoadingSkeleton.tsx
│   └── SearchBar.tsx
├── services/            # API services
│   └── geminiService.ts
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔒 Security Notes

- **Never commit your API key** - The `.env.local` file is already in `.gitignore`
- **Keep your API key private** - Don't share it publicly
- **Monitor usage** - Google Gemini API has usage limits and costs

## 🎨 Features in Detail

### Encyclopedia Definitions
- Concise, single-paragraph explanations
- Neutral, informative tone
- No markdown formatting for clean display

### ASCII Art Generation
- Meta visualizations that mirror concept meanings
- Uses box-drawing and special ASCII characters
- Configurable thinking budget for speed vs. quality

### Random Word Generator
- Generates interesting English words or concepts
- Can be nouns, verbs, adjectives, or proper nouns
- Perfect for discovering new topics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini API** for providing the AI capabilities
- **React Team** for the amazing framework
- **Vite Team** for the fast build tool
- **Harsh Kakadiya** for creating this project

## 📞 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Verify your API key is correctly set
3. Ensure you have a stable internet connection
4. Open an issue on GitHub

---

<div align="center">
Made with ❤️ by Harsh Kakadiya
</div>
