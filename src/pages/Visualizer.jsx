import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Navbar, Footer, Button } from "@/components";
import { useToast } from "@/components/common/useToast";
import { addToCart } from "@/features/cart/cartSlice";

import paintBucket1 from "@/assets/paint-bkt-1.png";

const rooms = [
  {
    id: "living",
    name: "Modern Living Room",
    type: "Interior",
    icon: "🛋️",
    desc: "Spacious contemporary lounge with soft ambient window light",
    defaultWallColor: "#1e3d6e",
    defaultAccentColor: "#f4ebd9",
  },
  {
    id: "bedroom",
    name: "Cozy Master Bedroom",
    type: "Interior",
    icon: "🛏️",
    desc: "Peaceful bedroom suite with headboard feature wall",
    defaultWallColor: "#2d5a3f",
    defaultAccentColor: "#e8e4da",
  },
  {
    id: "kitchen",
    name: "Kitchen & Dining Space",
    type: "Interior",
    icon: "🍽️",
    desc: "Open plan dining room with clean architectural lines",
    defaultWallColor: "#9d5b3d",
    defaultAccentColor: "#ffffff",
  },
  {
    id: "hallway",
    name: "Minimalist Entryway",
    type: "Interior",
    icon: "🚪",
    desc: "High ceiling gallery hallway with architectural shadows",
    defaultWallColor: "#7a9a7a",
    defaultAccentColor: "#faf9f6",
  },
  {
    id: "exterior",
    name: "Modern Villa Exterior",
    type: "Exterior",
    icon: "🏡",
    desc: "Facade wall with sunlight & weather-resistant coating",
    defaultWallColor: "#33363b",
    defaultAccentColor: "#d4882a",
  },
];

const colorPalettes = {
  Signature: [
    { name: "Cobalt Hour", hex: "#1e3d6e", code: "DP-01", mood: "Serene & Regal" },
    { name: "Clay Pot", hex: "#9d5b3d", code: "DP-02", mood: "Warm & Earthy" },
    { name: "Forest Velvet", hex: "#2d5a3f", code: "DP-03", mood: "Rich & Grounding" },
    { name: "Saffron Glow", hex: "#d4882a", code: "DP-04", mood: "Energetic & Bold" },
    { name: "Crimson Rose", hex: "#992834", code: "DP-05", mood: "Passionate & Luxe" },
    { name: "Sage Mist", hex: "#7a9a7a", code: "DP-06", mood: "Organic & Fresh" },
  ],
  Neutrals: [
    { name: "Alabaster White", hex: "#f9f8f5", code: "NT-01", mood: "Clean & Bright" },
    { name: "Warm Linen", hex: "#ece6d8", code: "NT-02", mood: "Cozy & Soft" },
    { name: "Desert Sand", hex: "#d6cabb", code: "NT-03", mood: "Neutral Earth" },
    { name: "Smoky Taupe", hex: "#a49b8f", code: "NT-04", mood: "Sophisticated" },
    { name: "Raw Biscuit", hex: "#dfd2c0", code: "NT-05", mood: "Relaxing Muted" },
    { name: "Charcoal Slate", hex: "#3b3e44", code: "NT-06", mood: "Modern Contrast" },
  ],
  CoolBluesGreens: [
    { name: "Nordic Frost", hex: "#d0e1e8", code: "CB-01", mood: "Crisp & Airy" },
    { name: "Aegean Sea", hex: "#2b6777", code: "CB-02", mood: "Deep Coastal" },
    { name: "Sky Horizon", hex: "#6897bb", code: "CB-03", mood: "Calm & Open" },
    { name: "Olive Grove", hex: "#556b2f", code: "CB-04", mood: "Earthy Botanical" },
    { name: "Eucalyptus", hex: "#87a987", code: "CB-05", mood: "Refreshing Green" },
    { name: "Midnight Navy", hex: "#111e38", code: "CB-06", mood: "Intimate & Dramatic" },
  ],
  DramaticBold: [
    { name: "Aubergine Plum", hex: "#4a233b", code: "DB-01", mood: "Regal & Moody" },
    { name: "Deep Terracotta", hex: "#b85d38", code: "DB-02", mood: "Rustic Mediterranean" },
    { name: "Mustard Spice", hex: "#c49000", code: "DB-03", mood: "Vibrant Accent" },
    { name: "Emerald Jewel", hex: "#044343", code: "DB-04", mood: "Ultra Luxe" },
    { name: "Obsidian Noir", hex: "#1f2022", code: "DB-05", mood: "Maximum Contrast" },
    { name: "Burnt Ochre", hex: "#8c4425", code: "DB-06", mood: "Warm Antique" },
  ],
};

const lightingModes = [
  { id: "daylight", name: "Natural Daylight", icon: "☀️", filter: "brightness(1) contrast(1)" },
  { id: "warm", name: "Warm Golden Hour", icon: "🌅", filter: "sepia(0.2) saturate(1.15) brightness(0.96)" },
  { id: "cool", name: "Cool Modern LED", icon: "💡", filter: "hue-rotate(5deg) brightness(1.04)" },
];

export default function Visualizer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [selectedRoom, setSelectedRoom] = useState(rooms[0]);
  const [activeWallColor, setActiveWallColor] = useState(rooms[0].defaultWallColor);
  const [activeColorName, setActiveColorName] = useState("Cobalt Hour");
  const [activeColorCode, setActiveColorCode] = useState("DP-01");
  const [paletteCategory, setPaletteCategory] = useState("Signature");
  const [lighting, setLighting] = useState(lightingModes[0]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [customHex, setCustomHex] = useState("#1e3d6e");

  const handleRoomSelect = (r) => {
    setSelectedRoom(r);
    setActiveWallColor(r.defaultWallColor);
    setShowOriginal(false);
  };

  const handleColorSelect = (color) => {
    setActiveWallColor(color.hex);
    setActiveColorName(color.name);
    setActiveColorCode(color.code);
    setCustomHex(color.hex);
    setShowOriginal(false);
  };

  const handleCustomColor = (hex) => {
    setCustomHex(hex);
    setActiveWallColor(hex);
    setActiveColorName("Custom Mix");
    setActiveColorCode("CUSTOM");
    setShowOriginal(false);
  };

  const handleAddToCartShade = () => {
    dispatch(
      addToCart({
        id: `custom-shade-${activeColorCode}-${Date.now()}`,
        name: `Drip Interior Paint (${activeColorName} · 4L Gallon)`,
        image: paintBucket1,
        category: "Custom Tinted Paint",
        price: 2650,
        quantity: 1,
        unit: "/ gallon",
      })
    );
    toast?.show(`Added 1 Gallon of "${activeColorName}" (${activeWallColor}) to cart! 🛒`, "success");
    navigate("/cart");
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(`${activeColorName} | Code: ${activeColorCode} | Hex: ${activeWallColor}`);
    toast?.show(`Copied color recipe to clipboard! 📋`, "info");
  };

  return (
    <>
      <Navbar />

      <main className="visualizer-page">
        {/* Header */}
        <section className="visualizer-header">
          <div className="wrap">
            <p className="page-eyebrow">INTERACTIVE ROOM SIMULATOR</p>
            <h1 className="visualizer-title">Live Wall Color Visualizer</h1>
            <p className="visualizer-sub">
              Test any shade on realistic architectural room templates. Experience how natural lighting shifts wall colors before painting.
            </p>
          </div>
        </section>

        <section className="visualizer-workspace">
          <div className="wrap visualizer-layout">
            {/* LEFT: INTERACTIVE ROOM CANVAS */}
            <div className="visualizer-canvas-panel">
              {/* Room Selector Bar */}
              <div className="visualizer-room-bar">
                {rooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`visualizer-room-btn ${selectedRoom.id === r.id ? "active" : ""}`}
                    onClick={() => handleRoomSelect(r)}
                  >
                    <span>{r.icon}</span> {r.name}
                  </button>
                ))}
              </div>

              {/* SIMULATED ROOM CANVAS */}
              <div
                className="visualizer-room-stage"
                style={{ filter: lighting.filter }}
              >
                {/* SVG REALISTIC ROOM VECTOR WITH DYNAMIC WALL LAYER */}
                <svg
                  viewBox="0 0 800 500"
                  className="visualizer-svg"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    {/* Linear gradient for natural ambient lighting across wall */}
                    <linearGradient id="wallLightGrad" x1="0%" y1="0%" x2="100%" y2="80%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                      <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                    </linearGradient>

                    {/* Corner Shadow Gradient */}
                    <linearGradient id="cornerShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </linearGradient>

                    {/* Window Light Beam */}
                    <linearGradient id="sunbeam" x1="0%" y1="0%" x2="80%" y2="100%">
                      <stop offset="0%" stopColor="#fff7e6" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>

                    {/* Floor Wood Texture Gradient */}
                    <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8d6e63" />
                      <stop offset="50%" stopColor="#6d4c41" />
                      <stop offset="100%" stopColor="#4e342e" />
                    </linearGradient>
                  </defs>

                  {/* Ceiling */}
                  <polygon points="0,0 800,0 680,80 120,80" fill="#f8f7f4" />
                  <polygon points="0,0 800,0 680,80 120,80" fill="url(#wallLightGrad)" opacity="0.4" />

                  {/* MAIN WALL (Dynamic color fill) */}
                  <polygon
                    points="120,80 680,80 680,380 120,380"
                    fill={showOriginal ? "#e8e5de" : activeWallColor}
                    className="visualizer-dynamic-wall"
                  />
                  {/* Natural Wall Lighting Overlay */}
                  <polygon points="120,80 680,80 680,380 120,380" fill="url(#wallLightGrad)" />

                  {/* Left Side Wall */}
                  <polygon
                    points="0,0 120,80 120,380 0,500"
                    fill={showOriginal ? "#ded9ce" : activeWallColor}
                    filter="brightness(0.85)"
                  />
                  <polygon points="0,0 120,80 120,380 0,500" fill="url(#cornerShadow)" opacity="0.6" />

                  {/* Right Side Wall / Window Zone */}
                  <polygon
                    points="800,0 680,80 680,380 800,500"
                    fill={showOriginal ? "#f0ebe1" : activeWallColor}
                    filter="brightness(1.1)"
                  />

                  {/* Baseboard & Moulding Trims */}
                  <rect x="120" y="375" width="560" height="7" fill="#ffffff" />
                  <rect x="120" y="78" width="560" height="4" fill="#ffffff" />

                  {/* Floor */}
                  <polygon points="0,500 120,380 680,380 800,500" fill="url(#floorGrad)" />
                  {/* Floor reflection sheen */}
                  <polygon points="200,380 600,380 700,500 100,500" fill="#ffffff" opacity="0.06" />

                  {/* SCENE SPECIFIC ARCHITECTURAL ELEMENTS */}
                  {selectedRoom.id === "living" && (
                    <g className="room-elements">
                      {/* Window on right wall with sunlight rays */}
                      <polygon points="700,120 780,100 780,320 700,340" fill="#cbe6f7" opacity="0.85" />
                      <line x1="740" y1="110" x2="740" y2="330" stroke="#ffffff" strokeWidth="4" />
                      <line x1="700" y1="220" x2="780" y2="210" stroke="#ffffff" strokeWidth="4" />
                      {/* Sunbeam across floor and wall */}
                      <polygon points="700,120 780,100 500,480 320,480" fill="url(#sunbeam)" />

                      {/* Designer Art Frame on Main Wall */}
                      <rect x="340" y="120" width="120" height="150" fill="#ffffff" stroke="#222222" strokeWidth="6" rx="2" />
                      <rect x="350" y="130" width="100" height="130" fill="#eae6df" />
                      <circle cx="400" cy="180" r="30" fill="var(--saffron)" opacity="0.8" />
                      <path d="M370,220 Q400,170 430,220" stroke="#1e3d6e" strokeWidth="4" fill="none" />

                      {/* Modern Sofa */}
                      {/* Drop shadow */}
                      <ellipse cx="400" cy="420" rx="190" ry="24" fill="#000000" opacity="0.35" />
                      {/* Sofa base & back cushions */}
                      <rect x="230" y="320" width="340" height="70" rx="14" fill="#303236" />
                      <rect x="250" y="270" width="140" height="60" rx="10" fill="#3c3f45" />
                      <rect x="410" y="270" width="140" height="60" rx="10" fill="#3c3f45" />
                      {/* Throw pillows */}
                      <rect x="260" y="290" width="45" height="45" rx="6" fill="var(--saffron)" transform="rotate(-10 260 290)" />
                      <rect x="500" y="280" width="45" height="45" rx="6" fill="#eaeaea" transform="rotate(12 500 280)" />

                      {/* Potted fiddle-leaf fig on left */}
                      <ellipse cx="170" cy="390" rx="25" ry="10" fill="#000000" opacity="0.3" />
                      <polygon points="155,390 185,390 180,350 160,350" fill="#d4882a" />
                      <path d="M170,350 Q160,280 150,220" stroke="#2d5a3f" strokeWidth="4" fill="none" />
                      <ellipse cx="145" cy="220" rx="20" ry="14" fill="#386b4d" />
                      <ellipse cx="175" cy="250" rx="22" ry="15" fill="#2d5a3f" />
                      <ellipse cx="150" cy="280" rx="18" ry="12" fill="#447e5b" />
                    </g>
                  )}

                  {selectedRoom.id === "bedroom" && (
                    <g className="room-elements">
                      {/* Headboard */}
                      <rect x="250" y="200" width="300" height="150" rx="8" fill="#4a443e" />
                      {/* Bed mattress and sheets */}
                      <polygon points="230,350 570,350 630,450 170,450" fill="#f5f2ea" />
                      {/* Pillows */}
                      <rect x="270" y="290" width="110" height="45" rx="8" fill="#ffffff" stroke="#e0ded9" />
                      <rect x="420" y="290" width="110" height="45" rx="8" fill="#ffffff" stroke="#e0ded9" />
                      {/* Duvet accent fold */}
                      <polygon points="210,380 590,380 630,450 170,450" fill="#dcd7cd" />

                      {/* Bedside tables */}
                      <rect x="160" y="320" width="60" height="60" fill="#302d2a" rx="4" />
                      <rect x="580" y="320" width="60" height="60" fill="#302d2a" rx="4" />

                      {/* Pendant lamps with ambient glow */}
                      <line x1="190" y1="80" x2="190" y2="240" stroke="#d4882a" strokeWidth="2" />
                      <circle cx="190" cy="245" r="14" fill="#ffffff" />
                      <circle cx="190" cy="245" r="35" fill="#ffeaa7" opacity="0.3" />

                      <line x1="610" y1="80" x2="610" y2="240" stroke="#d4882a" strokeWidth="2" />
                      <circle cx="610" cy="245" r="14" fill="#ffffff" />
                      <circle cx="610" cy="245" r="35" fill="#ffeaa7" opacity="0.3" />
                    </g>
                  )}

                  {selectedRoom.id === "kitchen" && (
                    <g className="room-elements">
                      {/* Upper cabinets */}
                      <rect x="180" y="100" width="440" height="90" fill="#2b2d31" rx="4" />
                      <line x1="326" y1="100" x2="326" y2="190" stroke="#1c1d20" strokeWidth="2" />
                      <line x1="472" y1="100" x2="472" y2="190" stroke="#1c1d20" strokeWidth="2" />

                      {/* Backsplash tiles visible between cabinets */}
                      <rect x="180" y="190" width="440" height="80" fill="#ffffff" opacity="0.9" />

                      {/* Countertop */}
                      <rect x="160" y="270" width="480" height="120" fill="#1f2023" rx="4" />
                      <rect x="150" y="270" width="500" height="12" fill="#e0ded9" />

                      {/* Bar Stools */}
                      <ellipse cx="280" cy="460" rx="30" ry="10" fill="#000000" opacity="0.3" />
                      <circle cx="280" cy="350" r="24" fill="#9d5b3d" />
                      <line x1="280" y1="374" x2="280" y2="455" stroke="#111111" strokeWidth="4" />

                      <ellipse cx="520" cy="460" rx="30" ry="10" fill="#000000" opacity="0.3" />
                      <circle cx="520" cy="350" r="24" fill="#9d5b3d" />
                      <line x1="520" y1="374" x2="520" y2="455" stroke="#111111" strokeWidth="4" />
                    </g>
                  )}

                  {selectedRoom.id === "hallway" && (
                    <g className="room-elements">
                      {/* Arched Mirror */}
                      <path d="M350,150 A50,50 0 0,1 450,150 L450,290 L350,290 Z" fill="#e8f1f5" stroke="#d4882a" strokeWidth="5" />
                      {/* Console table */}
                      <rect x="300" y="290" width="200" height="14" fill="#2b2623" rx="2" />
                      <line x1="320" y1="304" x2="310" y2="430" stroke="#2b2623" strokeWidth="4" />
                      <line x1="480" y1="304" x2="490" y2="430" stroke="#2b2623" strokeWidth="4" />
                      {/* Table vase */}
                      <polygon points="385,290 415,290 410,250 390,250" fill="#ffffff" />
                      <line x1="400" y1="250" x2="400" y2="210" stroke="#4a6b47" strokeWidth="3" />
                      <circle cx="400" cy="205" r="8" fill="#d4882a" />
                    </g>
                  )}

                  {selectedRoom.id === "exterior" && (
                    <g className="room-elements">
                      {/* Modern Front Door */}
                      <rect x="340" y="160" width="120" height="220" fill="#5a3d28" stroke="#ffffff" strokeWidth="6" />
                      <rect x="350" y="180" width="100" height="40" fill="#2c2d30" opacity="0.6" />
                      <circle cx="440" cy="270" r="5" fill="#ffd700" />
                      {/* Exterior Sconce Light */}
                      <rect x="300" y="210" width="15" height="35" fill="#111111" />
                      <circle cx="307" cy="227" r="20" fill="#fff3c4" opacity="0.4" />
                      {/* Planters */}
                      <rect x="230" y="320" width="50" height="60" fill="#7a7f85" />
                      <circle cx="255" cy="300" r="25" fill="#386b4d" />
                    </g>
                  )}
                </svg>

                {/* Floating Active Shade Badge */}
                <div className="visualizer-floating-badge">
                  <span className="visualizer-swatch-circle" style={{ backgroundColor: activeWallColor }} />
                  <div>
                    <strong>{activeColorName}</strong>
                    <span>{activeColorCode} · {activeWallColor.toUpperCase()}</span>
                  </div>
                </div>

                {/* Bottom Overlay Controls */}
                <div className="visualizer-canvas-controls">
                  {/* Before / After toggle button */}
                  <button
                    type="button"
                    className={`visualizer-ctrl-btn ${showOriginal ? "active" : ""}`}
                    onClick={() => setShowOriginal(!showOriginal)}
                  >
                    {showOriginal ? "👁️ Showing Original Neutral" : "👁️ View Original Neutral"}
                  </button>

                  {/* Lighting Mode Selector */}
                  <div className="visualizer-lighting-pills">
                    {lightingModes.map((lm) => (
                      <button
                        key={lm.id}
                        type="button"
                        className={`visualizer-light-btn ${lighting.id === lm.id ? "active" : ""}`}
                        onClick={() => setLighting(lm)}
                        title={lm.name}
                      >
                        {lm.icon} {lm.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: COLOR PALETTES & ACTIONS */}
            <aside className="visualizer-palette-panel">
              <div className="visualizer-palette-header">
                <h3 className="visualizer-section-title">Select Wall Shade</h3>
                <p style={{ fontSize: "13px", color: "var(--ink-muted)", marginTop: "4px" }}>
                  Pick from curated designer swatches or mix your custom tone.
                </p>
              </div>

              {/* Palette Category Tabs */}
              <div className="visualizer-cat-tabs">
                {Object.keys(colorPalettes).map((catKey) => (
                  <button
                    key={catKey}
                    type="button"
                    className={`visualizer-cat-btn ${paletteCategory === catKey ? "active" : ""}`}
                    onClick={() => setPaletteCategory(catKey)}
                  >
                    {catKey === "CoolBluesGreens" ? "Cool & Serene" : catKey === "DramaticBold" ? "Bold & Moody" : catKey}
                  </button>
                ))}
              </div>

              {/* Color Swatch Grid */}
              <div className="visualizer-swatches-grid">
                {colorPalettes[paletteCategory].map((color) => {
                  const isSelected = activeWallColor.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.code}
                      type="button"
                      className={`visualizer-swatch-card ${isSelected ? "selected" : ""}`}
                      onClick={() => handleColorSelect(color)}
                    >
                      <div className="visualizer-swatch-preview" style={{ backgroundColor: color.hex }}>
                        {isSelected && <span className="visualizer-check">✓</span>}
                      </div>
                      <div className="visualizer-swatch-info">
                        <div className="visualizer-swatch-name">{color.name}</div>
                        <div className="visualizer-swatch-meta">{color.code} · {color.mood}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Wheel Picker */}
              <div className="visualizer-custom-picker-box">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>🎨 Custom Color Mixer:</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>{customHex.toUpperCase()}</span>
                </label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="color"
                    className="visualizer-color-wheel"
                    value={customHex}
                    onChange={(e) => handleCustomColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={customHex}
                    onChange={(e) => handleCustomColor(e.target.value)}
                    placeholder="#1e3d6e"
                    style={{ fontFamily: "var(--mono)", textTransform: "uppercase" }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="visualizer-actions-box">
                <Button
                  text={`Order "${activeColorName}" Paint →`}
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%" }}
                  onClick={handleAddToCartShade}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                  <Button
                    text="📋 Copy Recipe"
                    className="btn btn-ghost btn-sm"
                    onClick={handleCopyCode}
                  />
                  <Button
                    text="📐 Estimate Gallons"
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate("/calculator")}
                  />
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
