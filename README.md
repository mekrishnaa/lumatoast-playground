# LumaToast Playground

An interactive showcase and playground built with **Angular 19/22** for exploring, configuring, and testing the [`lumatoast`](https://www.npmjs.com/package/lumatoast) notification library.

🌐 **Live Website**: [https://lumatoast.vercel.app/](https://lumatoast.vercel.app/)

---

## ✨ Features Included

1. **Core Notification Types**: Success, Error, Warning, Info, Loading, and Custom.
2. **9 Built-in Design Themes**:
   - `LINEAR` (⚡) — Sleek dark frosted glass
   - `AURORA` (🌌) — Multi-color ambient northern glow
   - `VISION` (🥽) — Apple VisionOS spatial frosted glass
   - `MINIMAL` (◽) — High-contrast monochrome clean style
   - `CUPERTINO` (🍎) — Apple iOS/macOS clean aesthetic
   - `MATERIAL` (🎨) — Google Material Design 3 elevation
   - `TERMINAL` (💻) — Monospace retro hacker console
   - `GITHUB` (🐙) — GitHub developer UI palette
   - `CYBERPUNK` (🕶️) — Neon synthwave futuristic style
3. **Promise & Async API**:
   - Integrated with real mock APIs (**DummyJSON** quotes and simulated HTTP 500 error handling).
4. **In-Place Live Updates**:
   - Fetches mock user from **JSONPlaceholder** (`/users/1`) and transforms loading state into success seamlessly.
5. **Action Buttons**:
   - Interactive callbacks with `solid`, `outline`, and `ghost` button variants.
6. **Screen Positions**:
   - Support for all 6 anchor positions: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, and `bottom-right`.
7. **Duration Variants**:
   - Short (2s), Default (4s), Long (8s), and Infinite with action dismiss buttons.
8. **Progress Bar & Behaviors**:
   - Top/bottom progress indicators, click-to-dismiss, hide icon, and non-dismissible toasts.
9. **Enter & Exit Animations**:
   - Bounce, Scale, Pure Fade, and Instant.
10. **Custom CSS Tokens & Themes**:
    - Inline `--luma-*` CSS variables, custom class overrides, and custom theme definitions.
11. **Global Presets & ToastManager**:
    - Application-wide configuration and active toast inspection.
12. **Interactive Global Configurator**:
    - Real-time custom toast generator with dynamic code preview and interactive form controls.
13. **Split Buttons with Code Modal**:
    - Left side fires toast; right side (`</>`) opens clean copyable code snippets with auto-close on copy.
14. **Dark & Light Mode Toggle**:
    - Integrated UI theme switcher to test how toasts look against light and dark backgrounds.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
git clone https://github.com/mekrishnaa/lumatoast-playground.git
cd lumatoast-playground
npm install
```

### Local Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`.

### Production Build
```bash
npm run build
```
Output files will be generated in `dist/testing/browser/`.

---

## ☁️ Deployment on Vercel

This repository includes a pre-configured `vercel.json` file for single-command or git-push deployment on Vercel:

```bash
vercel --prod
```

Or connect the GitHub repository directly in your [Vercel Dashboard](https://vercel.com/new).

---

## 📄 License
MIT
