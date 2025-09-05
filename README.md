# 🎯 Powerball Scanner

A beautiful, mobile-first web application that scans Powerball tickets using your iPhone's camera and instantly checks if you're a winner!

## ✨ Features

- 📸 **Camera Integration** - Use your iPhone's camera to scan tickets
- 🔍 **OCR Technology** - Advanced text recognition extracts numbers automatically
- ✏️ **Number Editing** - Review and correct extracted numbers before checking
- 🎯 **Instant Results** - Check against latest Powerball results with Power Play support
- 🌙 **Dark Mode** - Beautiful pastel color scheme with dark mode interface
- 📱 **Mobile Optimized** - Designed specifically for iPhone users

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser with camera support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd powerball-scanner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠 Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling with custom pastel theme
- **Tesseract.js** - Pure JavaScript OCR library
- **Lucide React** - Beautiful icons

## 📱 How It Works

1. **📸 Scan** - Point your camera at the Powerball ticket
2. **🔍 Extract** - AI automatically extracts all numbers
3. **✏️ Review** - Check and edit numbers if needed
4. **🎯 Check** - Submit to check against latest results
5. **🏆 Celebrate** - See if you won and what prize category!

## 🎨 Design

- **Pastel Color Palette** - Soft, modern colors
- **Dark Mode First** - Optimized for low-light scanning
- **Mobile-First** - Designed for iPhone camera usage
- **Clean & Minimal** - Simple, intuitive interface

## 🔧 Development

### Project Structure

```
src/
├── components/
│   ├── Camera/          # Camera capture components
│   ├── NumberReview/    # Number editing interface
│   ├── Results/         # Results display
│   └── Common/          # Shared components
├── services/
│   ├── powerballApi.ts  # Powerball data API
│   └── ocrService.ts    # OCR processing
├── types/
│   └── powerball.ts     # TypeScript definitions
└── App.tsx              # Main application
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

This app is optimized for deployment on **Vercel**:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with zero configuration

## 🎯 Powerball Prize Structure

The app supports all Powerball prize categories:

- **Jackpot** - 5 white balls + Powerball
- **$1 Million** - 5 white balls (no Powerball)
- **$50,000** - 4 white balls + Powerball
- **$100** - 4 white balls (no Powerball)
- **$100** - 3 white balls + Powerball
- **$7** - 3 white balls (no Powerball)
- **$7** - 2 white balls + Powerball
- **$4** - 1 white ball + Powerball
- **$4** - Powerball only

### Power Play Support

- **2x, 3x, 4x, 5x, 10x** multipliers
- **10x** only for prizes $150K and below
- **Jackpot and $1M** prizes are NOT multiplied

## 🔒 Privacy & Security

- **No Data Storage** - All processing happens locally
- **No Server Required** - Frontend-only application
- **Camera Privacy** - Images never leave your device
- **HTTPS Only** - Secure connections for API calls

## 🐛 Troubleshooting

### Camera Issues
- Ensure camera permissions are granted
- Try refreshing the page
- Check if another app is using the camera

### OCR Accuracy
- Ensure good lighting
- Keep ticket flat and in focus
- Avoid shadows or glare
- Use manual editing if needed

## 📄 License

This project is for educational and entertainment purposes only. Always verify lottery results with official sources.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Disclaimer**: This app is for entertainment purposes only. Always verify lottery results with official lottery sources. The developers are not responsible for any financial decisions made based on this application.