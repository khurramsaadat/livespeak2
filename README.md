# LiveSpeak

A professional real-time speech recognition and translation web application built with Next.js and Web Speech API, featuring multilingual support for English, Arabic, and Bengali.

## ✨ Features

- 🎤 **Live Speech Recognition**: Real-time transcription using device's built-in Web Speech API
- 🌍 **Multi-language Support**: **English, Arabic, and Bengali** with enhanced dialect support
- 🔄 **Instant Translation**: Real-time translation between all supported languages
- 📱 **Responsive Design**: Mobile-first design that works perfectly on all devices
- ⚡ **No External APIs**: Uses device's built-in speech recognition capabilities
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 🚀 **Beautiful Permission Modal**: Professional microphone access request with smooth animations
- 🏳️ **Enhanced Language UI**: Native language names (العربية, বাংলা) with flag icons
- 📋 **Copy Functionality**: Easy text copying with user feedback
- 🎯 **Advanced Recognition**: Dialect-specific configurations for optimal accuracy

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎯 How It Works

1. **Permission Request**: Beautiful modal requests microphone access on first visit
2. **Start Recording**: Click the "Start Recording" button to begin speech recognition
3. **Live Transcription**: See your speech transcribed in real-time as you speak
4. **Final Text**: View the complete transcription after you finish speaking
5. **Translation**: Get instant translation to your target language
6. **Clear**: Use the "Clear transcription" button to reset and start fresh

## 🌍 Supported Languages

### **English (en-US)**
- US English dialect support
- Optimized for American English recognition

### **Arabic (العربية)**
- **Saudi Arabic (ar-SA)** - Modern Standard Arabic
- **Egyptian Arabic (ar-EG)** - Colloquial Egyptian dialect
- **Palestinian Arabic (ar-PS)** - Palestinian dialect
- Enhanced maxAlternatives (5) for better dialect accuracy

### **Bengali (বাংলা)**
- **Bangladesh Bengali (bn-BD)** - Standard Bangladesh Bengali
- **Indian Bengali (bn-IN)** - Indian Bengali variations
- Enhanced maxAlternatives (4) for regional variations

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.5.0, React 19, TypeScript
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS v4
- **Speech Recognition**: Web Speech API (device built-in)
- **Translation**: Client-side dictionary-based system
- **Deployment**: Netlify with static export
- **Testing**: MCP Playwright integration

## 📱 Browser Compatibility

- **Chrome**: Full support with Web Speech API
- **Safari**: Full support with Web Speech API
- **Firefox**: Full support with Web Speech API
- **Edge**: Full support with Web Speech API
- **Mobile Browsers**: Optimized for mobile speech recognition

## 🚀 Deployment

LiveSpeak is deployed on Netlify and ready for production use:

- **Live Demo**: [https://livespeak.netlify.app/](https://livespeak.netlify.app/)
- **Static Export**: Optimized for CDN deployment
- **Performance**: Fast loading with minimal bundle size

## 🔧 Development

### Prerequisites
- Node.js 18 or higher
- npm, yarn, pnpm, or bun

### Installation
```bash
git clone https://github.com/khurramsaadat/livespeak2.git
cd livespeak
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run export
```

## 📚 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - browser speech recognition and synthesis
- [shadcn/ui](https://ui.shadcn.com/) - beautiful and accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) - utility-first CSS framework

## 🤝 Contributing

This project is open source and contributions are welcome! Check out [the LiveSpeak GitHub repository](https://github.com/khurramsaadat/livespeak2.git) for more details.

### Development Guidelines
- Follow TypeScript best practices
- Use MCP Playwright for testing
- Maintain responsive design principles
- Add comprehensive error handling

## 📊 Project Status

**Current Status**: ✅ **MVP COMPLETED & DEPLOYED**

- ✅ All core PRD requirements implemented
- ✅ Multilingual support (English, Arabic, Bengali)
- ✅ Beautiful permission modal
- ✅ Enhanced language UI with native names
- ✅ Netlify deployment ready
- ✅ Comprehensive testing with MCP Playwright

**Next Phase**: Advanced features including cross-language recognition, RTL support, and enhanced translation quality.

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, Web Speech API, and modern web technologies**
