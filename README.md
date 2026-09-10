<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=32&pause=1000&color=6366F1&center=true&vCenter=true&width=600&lines=🎨+DRIP+Paint+Platform;Your+Colors%2C+Your+World" alt="DRIP Typing Banner"/>

### A full-stack paint e-commerce platform with an interactive room color visualizer, smart paint calculator, and complete shopping experience.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white&labelColor=20232A)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?style=flat-square&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=flat-square&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖌️ **Room Color Visualizer** | SVG-based live visualizer — 5 room types, 3 lighting modes |
| 🧮 **Smart Paint Calculator** | Calculate paint quantities with room presets |
| 🛒 **Full E-Commerce** | Product listing, cart drawer, wishlist, checkout |
| 🔐 **Authentication** | Signup, login, forgot password via Supabase |
| 📦 **Order Tracking** | Real-time order status tracking |
| 🏪 **Admin Panel** | Full backend management dashboard |
| 📱 **WhatsApp Widget** | Floating concierge support widget |
| 🎨 **Color Palette System** | Signature, Neutrals, Cool Blues/Greens, Dramatic Bold |
| ⚡ **Performance** | Code-split lazy loading on all routes |
| 👨‍🎨 **Find Painters** | Connect with professional painters near you |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router v7 |
| **State Management** | Redux Toolkit, Redux Persist |
| **Backend / Auth** | Supabase (PostgreSQL + Auth) |
| **3D / Graphics** | Three.js |
| **Styling** | CSS Modules, Custom Design System |
| **Linting** | OxLint |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
src/
├── app/             # Redux store setup
├── assets/          # Images, icons, static assets
├── components/      # Reusable UI components
│   ├── common/      # Buttons, Cards, Modals...
│   ├── layout/      # Navbar, Footer, CartDrawer
│   ├── product/     # Product cards, grids
│   └── section/     # Home page sections
├── features/        # Redux slices (auth, cart, wishlist...)
├── pages/           # Route-level page components
│   ├── auth/        # Login, Signup, ForgotPassword
│   ├── Home.jsx
│   ├── Shop.jsx
│   ├── Visualizer.jsx   # 🖌️ Room color visualizer
│   ├── Calculator.jsx   # 🧮 Paint calculator
│   ├── Cart.jsx
│   ├── Checkout.jsx     # 🔒 Protected route
│   ├── TrackOrder.jsx
│   ├── Admin.jsx
│   └── ...
├── services/        # Supabase API calls
└── styles/          # Global CSS & design tokens
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- A free [Supabase](https://supabase.com/) account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Muhammad-Aazan/Paint-Website.git
cd Paint-Website

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 💡 Get these from your Supabase project → **Settings → API**

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🖌️ Visualizer — Room Color Preview

The **Live Room Visualizer** lets users paint any room before buying:

- **5 Room Types:** Living Room, Bedroom, Kitchen, Hallway, Exterior
- **3 Lighting Modes:** ☀️ Daylight · 🌅 Warm Golden Hour · 💡 Cool LED
- **Color Palettes:** Signature, Neutrals, Cool Blues & Greens, Dramatic & Bold
- **Custom Color Picker:** Enter any hex value for a custom shade

---

## 🧮 Paint Calculator

Smart quantity estimator with built-in room presets:

- Select room type (Small Bedroom, Master Bedroom, Living Room, etc.)
- Auto-calculates wall area and required paint volume
- Supports custom dimensions input

---

## 📦 Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home | ❌ |
| `/shop` | Product Shop | ❌ |
| `/categories` | Browse Categories | ❌ |
| `/product/:id` | Product Detail | ❌ |
| `/visualizer` | Room Color Visualizer | ❌ |
| `/calculator` | Paint Calculator | ❌ |
| `/cart` | Shopping Cart | ❌ |
| `/wishlist` | Wishlist | ❌ |
| `/checkout` | Checkout | ✅ |
| `/track-order` | Order Tracking | ❌ |
| `/painters` | Find Painters | ❌ |
| `/admin` | Admin Dashboard | ❌ |
| `/login` | Login | ❌ |
| `/signup` | Signup | ❌ |
| `/forgot-password` | Reset Password | ❌ |

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [Muhammad Aazan](https://github.com/Muhammad-Aazan)

⭐ **Star this repo if you found it helpful!**

</div>
