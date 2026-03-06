# PaperStack

A personal notes app with typing and drawing support, optimized for iPad Pro with Apple Pencil.

## Features

- **Type & Draw**: Switch between keyboard typing (TipTap rich text editor) and Apple Pencil drawing
- **Labels**: Color-coded labels to organize your notes
- **Search**: Full-text search across all notes
- **Favorites**: Pin important notes for quick access
- **Offline Support**: Works offline via IndexedDB caching
- **PWA**: Installable on iPad home screen for native-like experience

## Tech Stack

- React 18 + Vite
- TipTap v2 (rich text editor)
- Zustand (state management)
- Tailwind CSS
- IndexedDB (local storage)
- PWA (vite-plugin-pwa)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd paperstack

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Deploying

The app can be deployed to any static hosting service (Vercel, Netlify, etc.)

```bash
# Preview production build locally
npm run preview
```

## Project Structure

```
paperstack/
├── public/
│   ├── icons/           # PWA icons
│   └── manifest.json    # PWA manifest
├── src/
│   ├── components/
│   │   ├── editor/      # Note editor components
│   │   ├── labels/      # Label management
│   │   ├── layout/      # Sidebar, TopBar
│   │   ├── notes/       # Notes list
│   │   └── ui/          # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── store/           # Zustand store
│   └── styles/          # Global CSS
└── package.json
```

## iPad Installation

1. Open the app URL in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Tap "Add"

## Keyboard Shortcuts

- `Cmd/Ctrl + B` - Bold
- `Cmd/Ctrl + I` - Italic
- `Cmd/Ctrl + U` - Underline
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo

## Drawing Gestures (iPad)

- Apple Pencil: Draw
- 2-finger tap: Undo
- 3-finger tap: Redo
- Double-tap Pencil: Toggle eraser

## License

MIT
