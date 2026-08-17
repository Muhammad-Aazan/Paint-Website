import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Navbar, Footer, Button } from "@/components";
import { useToast } from "@/components/common/useToast";
import { addToCart } from "@/features/cart/cartSlice";

import paintBucket1 from "@/assets/paint-bkt-1.png";
import paintBucket2 from "@/assets/paint-bkt-2.png";
import paintBucket3 from "@/assets/paint-bkt-3.png";
import paintBrush   from "@/assets/paint-brush-1.png";
import roller       from "@/assets/roller.png";

const presets = [
  { name: "Small Bedroom", length: 10, width: 10, height: 9, doors: 1, windows: 1 },
  { name: "Master Bedroom", length: 14, width: 16, height: 10, doors: 2, windows: 2 },
  { name: "Spacious Living Room", length: 18, width: 22, height: 10, doors: 2, windows: 3 },
  { name: "Hallway / Entryway", length: 6, width: 16, height: 9, doors: 3, windows: 1 },
];

const paintGrades = [
  {
    id: "standard",
    name: "Cobalt Hour — Interior Matte",
    price: 2450,
    coveragePerGallon: 380,
    image: paintBucket1,
    desc: "Zero-VOC washable matte finish for bedrooms & living rooms",
  },
  {
    id: "exterior",
    name: "Clay Pot — Exterior Weatherproof",
    price: 2850,
    coveragePerGallon: 340,
    image: paintBucket2,
    desc: "UV & rain-resistant elastomeric acrylic for outer walls",
  },
  {
    id: "luxury",
    name: "Forest Green — Luxury Velvet Enamel",
    price: 3250,
    coveragePerGallon: 420,
    image: paintBucket3,
    desc: "Ultra-pigmented stain-proof enamel for high-traffic zones",
  },
];

export default function Calculator() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const [unit, setUnit] = useState("feet"); // 'feet' | 'meters'
  const [length, setLength] = useState(14);
  const [width, setWidth] = useState(16);
  const [height, setHeight] = useState(10);
  const [doors, setDoors] = useState(1);
  const [windows, setWindows] = useState(2);
  const [coats, setCoats] = useState(2);
  const [surfaceType, setSurfaceType] = useState("smooth"); // 'smooth' (1.0), 'drywall' (1.15), 'porous' (1.3)
  const [selectedGrade, setSelectedGrade] = useState("standard");
  const [includeToolsBundle, setIncludeToolsBundle] = useState(true);

  // Unit conversion multipliers (1 meter = 3.28084 feet)
  const toFeet = (val) => (unit === "meters" ? val * 3.28084 : Number(val) || 0);

  const lFt = toFeet(length);
  const wFt = toFeet(width);
  const hFt = toFeet(height);

  // Wall area calculation = 2 * (L + W) * H
  const grossWallArea = Math.max(0, 2 * (lFt + wFt) * hFt);

  // Deductions: Standard Door ~21 sq ft, Standard Window ~15 sq ft
  const doorDeduction = (Number(doors) || 0) * 21;
  const windowDeduction = (Number(windows) || 0) * 15;
  const netPaintableArea = Math.max(20, grossWallArea - doorDeduction - windowDeduction);

  // Surface multiplier
  const surfaceMultiplier = surfaceType === "porous" ? 1.3 : surfaceType === "drywall" ? 1.15 : 1.0;

  // Selected paint product specs
  const activePaint = paintGrades.find((p) => p.id === selectedGrade) || paintGrades[0];
  const effectiveCoverage = activePaint.coveragePerGallon / surfaceMultiplier;

  // Total sq ft to cover across all coats
  const totalCoverageNeeded = netPaintableArea * coats;

  // Exact gallons & rounded gallons (1 gallon = 3.785 liters)
  const exactGallons = totalCoverageNeeded / effectiveCoverage;
  const recommendedGallons = Math.max(1, Math.ceil(exactGallons));
  const estimatedLiters = Math.round(recommendedGallons * 3.785);

  // Primer recommendation (1 coat of primer if unprimed/bare drywall or porous)
  const needsPrimer = surfaceType !== "smooth";
  const primerGallons = needsPrimer ? Math.max(1, Math.ceil(netPaintableArea / 350)) : 0;
  const primerCost = primerGallons * 1850;

  // Total cost
  const paintCost = recommendedGallons * activePaint.price;
  const toolsBundlePrice = 1650;
  const totalEstimatedCost = paintCost + primerCost + (includeToolsBundle ? toolsBundlePrice : 0);

  const applyPreset = (preset) => {
    setUnit("feet");
    setLength(preset.length);
    setWidth(preset.width);
    setHeight(preset.height);
    setDoors(preset.doors);
    setWindows(preset.windows);
  };

  const handleAddBundleToCart = () => {
    // 1. Add calculated paint
    dispatch(
      addToCart({
        id: `calc-paint-${activePaint.id}`,
        name: `${activePaint.name} (${recommendedGallons} Gallons)`,
        image: activePaint.image,
        category: "Paint Cans",
        price: activePaint.price,
        quantity: recommendedGallons,
        unit: "/ gallon",
      })
    );

    // 2. Add tools bundle if checked
    if (includeToolsBundle) {
      dispatch(
        addToCart({
          id: "tools-pro-kit-bundle",
          name: "Pro Painter Supply Kit (Roller + 2.5\" Brush + Tray + Tape)",
          image: roller,
          category: "Supplies",
          price: toolsBundlePrice,
          quantity: 1,
          unit: "/ kit",
        })
      );
    }

    // 3. Add primer if needed
    if (primerGallons > 0) {
      dispatch(
        addToCart({
          id: "primer-undercoat-gallon",
          name: `High-Adhesion Primer Undercoat (${primerGallons} Gallons)`,
          image: paintBrush,
          category: "Primers",
          price: 1850,
          quantity: primerGallons,
          unit: "/ gallon",
        })
      );
    }

    toast?.show(`Added ${recommendedGallons} Gallons + supplies to your cart! 🛒`, "success");
    navigate("/cart");
  };

  return (
    <>
      <Navbar />

      <main className="calculator-page">
        {/* Hero Section */}
        <section className="calc-hero">
          <div className="wrap">
            <p className="page-eyebrow">SMART ESTIMATOR</p>
            <h1 className="calc-hero-title">
              Paint Coverage & Cost Calculator
            </h1>
            <p className="calc-hero-sub">
              Never run out of paint or buy too much. Enter your room dimensions below to calculate exact gallons, primer, and material costs.
            </p>
          </div>
        </section>

        <section className="calc-main-section">
          <div className="wrap">
            {/* Presets Row */}
            <div className="calc-presets-bar">
              <span className="calc-presets-label">⚡ Quick Room Presets:</span>
              <div className="calc-presets-buttons">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    className="calc-preset-chip"
                    onClick={() => applyPreset(p)}
                  >
                    {p.name} ({p.length}×{p.width} ft)
                  </button>
                ))}
              </div>
            </div>

            <div className="calc-layout-grid">
              {/* LEFT: INPUTS & SETTINGS */}
              <div className="calc-form-card">
                <div className="calc-card-header">
                  <h2 className="calc-section-title">1. Room Dimensions & Openings</h2>
                  {/* Unit toggle */}
                  <div className="calc-unit-toggle">
                    <button
                      type="button"
                      className={`calc-unit-btn ${unit === "feet" ? "active" : ""}`}
                      onClick={() => setUnit("feet")}
                    >
                      Feet (ft)
                    </button>
                    <button
                      type="button"
                      className={`calc-unit-btn ${unit === "meters" ? "active" : ""}`}
                      onClick={() => setUnit("meters")}
                    >
                      Meters (m)
                    </button>
                  </div>
                </div>

                <div className="calc-inputs-3col">
                  <div className="form-group">
                    <label className="form-label">Room Length ({unit === "feet" ? "ft" : "m"})</label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      className="form-input calc-num-input"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room Width ({unit === "feet" ? "ft" : "m"})</label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      className="form-input calc-num-input"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ceiling Height ({unit === "feet" ? "ft" : "m"})</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      className="form-input calc-num-input"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                </div>

                <div className="calc-inputs-2col" style={{ marginTop: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">🚪 Number of Doors (Deduction)</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      className="form-input calc-num-input"
                      value={doors}
                      onChange={(e) => setDoors(e.target.value)}
                    />
                    <span className="calc-input-hint">-21 sq ft per door</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">🪟 Number of Windows (Deduction)</label>
                    <input
                      type="number"
                      min="0"
                      max="25"
                      className="form-input calc-num-input"
                      value={windows}
                      onChange={(e) => setWindows(e.target.value)}
                    />
                    <span className="calc-input-hint">-15 sq ft per window</span>
                  </div>
                </div>

                <div className="calc-divider" />

                {/* 2. COATS & SURFACE */}
                <h2 className="calc-section-title">2. Application Details</h2>

                <div className="calc-options-group">
                  <label className="form-label">Number of Paint Coats:</label>
                  <div className="calc-pill-selector">
                    {[
                      { num: 1, tag: "Touch-up / Same Color" },
                      { num: 2, tag: "Standard / Recommended" },
                      { num: 3, tag: "Dark to Light Transition" },
                    ].map((c) => (
                      <button
                        key={c.num}
                        type="button"
                        className={`calc-pill-item ${coats === c.num ? "selected" : ""}`}
                        onClick={() => setCoats(c.num)}
                      >
                        <div className="calc-pill-title">{c.num} {c.num === 1 ? "Coat" : "Coats"}</div>
                        <div className="calc-pill-desc">{c.tag}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="calc-options-group" style={{ marginTop: "20px" }}>
                  <label className="form-label">Wall Surface Texture & Condition:</label>
                  <div className="calc-pill-selector">
                    {[
                      { id: "smooth", name: "Smooth / Repaint", note: "Standard 100% coverage" },
                      { id: "drywall", name: "New Unprimed Drywall", note: "+15% absorption" },
                      { id: "porous", name: "Rough / Brick / Concrete", note: "+30% absorption" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        className={`calc-pill-item ${surfaceType === st.id ? "selected" : ""}`}
                        onClick={() => setSurfaceType(st.id)}
                      >
                        <div className="calc-pill-title">{st.name}</div>
                        <div className="calc-pill-desc">{st.note}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="calc-divider" />

                {/* 3. PAINT PRODUCT GRADE */}
                <h2 className="calc-section-title">3. Choose Paint Formulation</h2>
                <div className="calc-grades-list">
                  {paintGrades.map((grade) => (
                    <div
                      key={grade.id}
                      className={`calc-grade-card ${selectedGrade === grade.id ? "selected" : ""}`}
                      onClick={() => setSelectedGrade(grade.id)}
                    >
                      <img src={grade.image} alt={grade.name} className="calc-grade-img" />
                      <div className="calc-grade-info">
                        <div className="calc-grade-name">{grade.name}</div>
                        <div className="calc-grade-desc">{grade.desc}</div>
                        <div className="calc-grade-meta">
                          <span>Rs. {grade.price.toLocaleString()} / gal</span>
                          <span>· Covers ~{grade.coveragePerGallon} sq ft</span>
                        </div>
                      </div>
                      <div className="calc-grade-radio">
                        {selectedGrade === grade.id ? "●" : "○"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: RESULTS & ESTIMATE BREAKDOWN */}
              <aside className="calc-results-card">
                <div className="calc-results-top">
                  <span className="calc-results-badge">📊 ESTIMATED REQUIREMENT</span>
                  <h3 className="calc-results-headline">Material Summary</h3>
                </div>

                {/* Stat Badges */}
                <div className="calc-stats-grid">
                  <div className="calc-stat-box">
                    <span className="calc-stat-num">{Math.round(netPaintableArea)}</span>
                    <span className="calc-stat-lbl">Net Wall Area (sq. ft.)</span>
                  </div>

                  <div className="calc-stat-box highlight">
                    <span className="calc-stat-num">{recommendedGallons}</span>
                    <span className="calc-stat-lbl">Gallons of Paint ({estimatedLiters} Liters)</span>
                  </div>
                </div>

                {/* Cost & Items Breakdown */}
                <div className="calc-breakdown-list">
                  <div className="calc-breakdown-row">
                    <span>
                      {recommendedGallons}x {activePaint.name}
                    </span>
                    <strong>Rs. {paintCost.toLocaleString()}</strong>
                  </div>

                  {needsPrimer && (
                    <div className="calc-breakdown-row">
                      <span>
                        {primerGallons}x High-Adhesion Primer
                      </span>
                      <strong>Rs. {primerCost.toLocaleString()}</strong>
                    </div>
                  )}

                  {/* Supply kit add-on checkbox */}
                  <div className="calc-addon-box">
                    <label className="calc-addon-label">
                      <input
                        type="checkbox"
                        checked={includeToolsBundle}
                        onChange={(e) => setIncludeToolsBundle(e.target.checked)}
                      />
                      <div>
                        <strong>Add Pro Painter Supply Kit (+Rs. {toolsBundlePrice.toLocaleString()})</strong>
                        <p>Includes 9" Roller, 2.5" Sash Brush, Tray & Masking Tape</p>
                      </div>
                    </label>
                  </div>

                  <div className="calc-divider" />

                  {/* Total Estimated Cost */}
                  <div className="calc-total-row">
                    <div>
                      <span className="calc-total-label">Total Estimated Cost</span>
                      <p className="calc-total-sub">Includes paint, primer & supplies</p>
                    </div>
                    <div className="calc-total-amount">
                      Rs. {totalEstimatedCost.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <Button
                  text="Add Estimated Supplies to Cart 🛒"
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", marginTop: "24px" }}
                  onClick={handleAddBundleToCart}
                />

                <div className="calc-links-footer">
                  <Link to="/visualizer">🎨 Preview colors in Room Visualizer →</Link>
                  <Link to="/painters">👷 Hire a certified painter instead →</Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
