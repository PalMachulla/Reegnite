# Monster Hunter PWA 🗺️👹

A **Progressive Web App** for discovering and collecting monsters in the real world using location-based gameplay, weather integration, and AI-generated creatures.

## ✨ Features

### 🎮 **Core Gameplay**

- **Location-based monster spawning** - Creatures appear near your real-world location
- **Interactive map** powered by OpenStreetMap
- **Fishing-style capture minigame** with physics-based mechanics
- **Weather-aware difficulty** using real meteorological data
- **Biome-specific creatures** that match your environment

### 🤖 **AI Integration**

- **Gemini 2.0 Flash** generates unique monster descriptions
- **Context-aware generation** based on location, weather, and time
- **Dynamic monster stats** that reflect environmental conditions
- **Rich lore generation** for each captured creature

### 🌍 **Real-World Integration**

- **MET Norway Weather API** - Free, worldwide weather data
- **Biome detection** - Mountains, forests, coasts, urban areas, etc.
- **Time and season awareness** - Different creatures at different times
- **GPS tracking** for authentic location-based gameplay

### 📱 **PWA Features**

- **Offline support** with service worker caching
- **Install-to-home-screen** for native app experience
- **Mobile-optimized** UI with touch controls
- **Low-poly aesthetic** for consistent visual style

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **Gemini API key** from [AI Studio](https://aistudio.google.com)

### Installation

1. **Clone and install**

   ```bash
   git clone <your-repo>
   cd monster-hunter-pwa
   npm install
   ```

2. **Environment setup**

   ```bash
   cp env.example .env
   ```

3. **Configure your .env file**

   ```env
   # Authentication (change these!)
   VITE_AUTH_USERNAME=admin
   VITE_AUTH_PASSWORD=your_secure_password

   # Gemini AI (required for monster generation)
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Game Configuration
   VITE_MONSTER_SPAWN_RADIUS=100
   VITE_CAPTURE_DIFFICULTY=medium
   VITE_DEBUG_MODE=true
   ```

4. **Start development**

   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:3000`

## 🔑 API Setup

### Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create a new API key
3. Add it to your `.env` file as `VITE_GEMINI_API_KEY`

### Weather API

- **No setup required!** Uses free MET Norway API
- Worldwide coverage, no API key needed
- Rate limited but generous for development

## 🎮 How to Play

### 1. **Login**

- Use the credentials from your `.env` file
- Default: `admin` / `password`

### 2. **Grant Location Permission**

- Required for location-based gameplay
- Enables weather detection and biome classification

### 3. **Explore the Map**

- See your location on the interactive map
- Monsters spawn automatically within 100m radius
- Different biomes produce different creatures

### 4. **Capture Monsters**

- Click monster markers on the map
- Play the fishing-style minigame:
  - **Aim** your capture tool (45° is optimal)
  - **Charge power** by holding the button
  - **Manage tension** during the fight
  - **Don't break your line!**

### 5. **Build Your Collection**

- Successfully captured monsters are AI-generated
- Unique names, stats, and lore based on your location
- View your collection in the Collection tab

## 🐛 Debug Features

With `VITE_DEBUG_MODE=true`:

- **Force Spawn** button to create test monsters
- **Test AI** button to verify Gemini API connection
- Enhanced logging in browser console

## 🏗️ Architecture

### **Frontend Stack**

- **React 18** with TypeScript
- **Vite** for fast development and PWA building
- **Tailwind CSS** with custom game theme
- **Zustand** for state management
- **React Router** for navigation

### **Map & Location**

- **Leaflet.js** with React-Leaflet bindings
- **OpenStreetMap** tiles (free, no API key)
- **HTML5 Geolocation** for player tracking
- **Custom biome detection** algorithms

### **APIs & Services**

- **Gemini 2.0 Flash** for AI monster generation
- **MET Norway** for weather data
- **Service Worker** for offline caching

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Game/           # Game-specific components
│   └── Map/            # Map-related components
├── pages/              # Main application pages
├── services/           # API integration services
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel (automatic with git push)
```

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔧 Configuration Options

### Environment Variables

- `VITE_AUTH_USERNAME/PASSWORD` - Login credentials
- `VITE_GEMINI_API_KEY` - AI generation (required)
- `VITE_MONSTER_SPAWN_RADIUS` - Spawn distance (meters)
- `VITE_CAPTURE_DIFFICULTY` - Game difficulty level
- `VITE_DEBUG_MODE` - Enable debug features

### Game Mechanics

- **Spawn rate**: 30 seconds between spawns
- **Despawn time**: 5 minutes if not captured
- **Max monsters**: 5 active at once
- **Capture difficulty**: Weather and biome dependent

## 🐛 Troubleshooting

### Map Not Loading

- Ensure Leaflet CSS is loading properly
- Check browser console for errors
- Verify internet connection for OpenStreetMap tiles

### AI Generation Failing

- Verify `VITE_GEMINI_API_KEY` is correct
- Check API quota in Google AI Studio
- Use "Test AI" debug button to diagnose

### Location Issues

- Grant location permission in browser
- Enable location services on device
- Check if GPS/WiFi location is available

## 📄 License

MIT License - Feel free to use for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy Monster Hunting!** 🎮✨
