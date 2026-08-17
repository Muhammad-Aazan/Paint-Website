import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

/* ─── Brand colours ─────────────────────────────────── */
const COLORS = {
  cobalt:  0x1e3d6e,
  poppy:   0xc23b3b,
  saffron: 0xd4882a,
  sage:    0x4a6b47,
  white:   0xffffff,
  canvas:  0xfaf9f6,
};

export default function NotFound() {
  const navigate   = useNavigate();
  const mountRef   = useRef(null);
  const frameRef   = useRef(null);

  /* ── Three.js scene ─────────────────────────────────── */
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    /* ── Renderer ─── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    /* ── Scene + Camera ─── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 14);

    /* ── Lights ─── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dir1.position.set(8, 12, 8);
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(COLORS.cobalt, 0.5);
    dir2.position.set(-8, -4, 6);
    scene.add(dir2);

    /* ── Helper: create paint bucket ─── */
    function makeBucket(color, x, y, z, scale = 1) {
      const group = new THREE.Group();

      // Body (cylinder)
      const bodyGeo = new THREE.CylinderGeometry(0.55 * scale, 0.45 * scale, 1.1 * scale, 32);
      const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.5 });
      const body    = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      // Lid
      const lidGeo  = new THREE.CylinderGeometry(0.58 * scale, 0.58 * scale, 0.1 * scale, 32);
      const lidMat  = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.6, roughness: 0.3 });
      const lid     = new THREE.Mesh(lidGeo, lidMat);
      lid.position.y = 0.6 * scale;
      group.add(lid);

      // Handle (torus)
      const handleGeo = new THREE.TorusGeometry(0.4 * scale, 0.04 * scale, 8, 24);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.7, roughness: 0.3 });
      const handle    = new THREE.Mesh(handleGeo, handleMat);
      handle.position.y = 0.9 * scale;
      handle.rotation.x = Math.PI / 2;
      group.add(handle);

      // Paint drip (small sphere at bottom)
      const dripGeo = new THREE.SphereGeometry(0.12 * scale, 12, 12);
      const dripMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3 });
      const drip    = new THREE.Mesh(dripGeo, dripMat);
      drip.position.set(0.3 * scale, -0.65 * scale, 0);
      group.add(drip);

      group.position.set(x, y, z);
      return group;
    }

    /* ── Paint Buckets ─── */
    const buckets = [
      makeBucket(COLORS.cobalt,  -4.5,  1.2,  0,   1.1),
      makeBucket(COLORS.poppy,    4.2,  0.8,  0,   1.0),
      makeBucket(COLORS.saffron, -3.0, -2.2, -1,   0.85),
      makeBucket(COLORS.sage,     3.5, -1.8, -1,   0.9),
      makeBucket(COLORS.cobalt,   0.8,  3.0, -2,   0.7),
      makeBucket(COLORS.poppy,   -1.8,  2.6, -2,   0.65),
      makeBucket(COLORS.saffron,  5.5, -0.3, -3,   0.6),
      makeBucket(COLORS.sage,    -5.8, -0.5, -3,   0.55),
    ];
    buckets.forEach(b => scene.add(b));

    /* ── Floating paint splat spheres (particles) ─── */
    const splats = [];
    const splatColors = [COLORS.cobalt, COLORS.poppy, COLORS.saffron, COLORS.sage];
    for (let i = 0; i < 60; i++) {
      const r   = 0.04 + Math.random() * 0.12;
      const geo = new THREE.SphereGeometry(r, 8, 8);
      const mat = new THREE.MeshStandardMaterial({
        color:      splatColors[i % splatColors.length],
        roughness:  0.4,
        metalness:  0.2,
        transparent: true,
        opacity:    0.6 + Math.random() * 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6 - 4,
      );
      mesh.userData = {
        speedY:  (Math.random() - 0.5) * 0.006,
        speedX:  (Math.random() - 0.5) * 0.004,
        rotZ:    (Math.random() - 0.5) * 0.02,
        originY: mesh.position.y,
        phase:   Math.random() * Math.PI * 2,
      };
      scene.add(mesh);
      splats.push(mesh);
    }

    /* ── Central rotating ring ─── */
    const ringGeo = new THREE.TorusGeometry(2.6, 0.06, 8, 80);
    const ringMat = new THREE.MeshStandardMaterial({ color: COLORS.cobalt, metalness: 0.5, roughness: 0.3, transparent: true, opacity: 0.35 });
    const ring    = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 5;
    scene.add(ring);

    const ring2Geo = new THREE.TorusGeometry(3.2, 0.04, 8, 80);
    const ring2Mat = new THREE.MeshStandardMaterial({ color: COLORS.saffron, metalness: 0.4, roughness: 0.4, transparent: true, opacity: 0.25 });
    const ring2    = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 6;
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    /* ── Mouse parallax ─── */
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    /* ── Resize handler ─── */
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    /* ── Animation loop ─── */
    let t = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.016;

      // Camera parallax
      camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 1.0 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Buckets float + spin
      buckets.forEach((b, i) => {
        b.rotation.y += 0.005 + i * 0.001;
        b.position.y += Math.sin(t * 0.7 + i * 1.1) * 0.003;
      });

      // Splats drift
      splats.forEach((s) => {
        s.position.x += s.userData.speedX;
        s.position.y  = s.userData.originY + Math.sin(t * 0.5 + s.userData.phase) * 0.4;
        s.rotation.z  += s.userData.rotZ;
        // wrap around edges
        if (s.position.x >  9) s.position.x = -9;
        if (s.position.x < -9) s.position.x =  9;
      });

      // Rings spin
      ring.rotation.z  += 0.004;
      ring2.rotation.z -= 0.003;
      ring2.rotation.y += 0.002;

      renderer.render(scene, camera);
    };
    animate();

    /* ── Cleanup ─── */
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  const goBack = useCallback(() => navigate(-1), [navigate]);
  const goHome = useCallback(() => navigate("/"), [navigate]);
  const goShop = useCallback(() => navigate("/shop"), [navigate]);

  return (
    <div className="nf-page">
      {/* Three.js canvas fills the background */}
      <div ref={mountRef} className="nf-canvas" aria-hidden="true" />

      {/* Overlay content */}
      <div className="nf-content">
        <p className="nf-eyebrow">ERROR · 404</p>

        <h1 className="nf-headline">
          <span className="nf-digit">4</span>
          <span className="nf-zero">
            {/* Animated paint bucket icon in the zero */}
            <svg viewBox="0 0 80 80" width="1em" height="1em" fill="none" xmlns="http://www.w3.org/2000/svg" className="nf-bucket-svg" aria-hidden="true">
              <ellipse cx="40" cy="60" rx="26" ry="12" fill="#1e3d6e" opacity="0.18"/>
              <rect x="22" y="22" width="36" height="34" rx="6" fill="#1e3d6e"/>
              <rect x="20" y="18" width="40" height="8" rx="4" fill="#2b5299"/>
              <path d="M34 56 Q40 72 46 56" stroke="#d4882a" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
              <path d="M28 10 Q40 2 52 10" stroke="#9b9488" strokeWidth="3" strokeLinecap="round" fill="none"/>
            </svg>
          </span>
          <span className="nf-digit">4</span>
        </h1>

        <p className="nf-tagline">Looks like this canvas is blank.</p>
        <p className="nf-sub">
          The page you're looking for doesn't exist —<br />
          but there's plenty of beautiful paint waiting for you.
        </p>

        <div className="nf-actions">
          <button className="nf-btn nf-btn-ghost" onClick={goBack}>← Go Back</button>
          <button className="nf-btn nf-btn-primary" onClick={goShop}>Browse Shop</button>
          <button className="nf-btn nf-btn-ghost" onClick={goHome}>Home</button>
        </div>

        {/* Color swatches row */}
        <div className="nf-swatches" aria-hidden="true">
          {["#1e3d6e","#c23b3b","#d4882a","#4a6b47","#2b5299","#e04e4e"].map((c, i) => (
            <div key={i} className="nf-swatch" style={{ background: c, animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
