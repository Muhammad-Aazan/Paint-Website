import "@/styles/App.css";
import "@/components/common/Button.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useDispatch } from "react-redux";
import { ProtectedRoute, CartDrawer, WhatsAppWidget } from "@/components";
import { initializeAuth } from "@/features/auth/authSlice";

// Code-split all routes for production performance
const Home          = lazy(() => import("@/pages/Home"));
const Shop          = lazy(() => import("@/pages/Shop"));
const Categories    = lazy(() => import("@/pages/Categories"));
const About         = lazy(() => import("@/pages/About"));
const Contact       = lazy(() => import("@/pages/Contact"));
const Painters      = lazy(() => import("@/pages/Painters"));
const Wishlist      = lazy(() => import("@/pages/Wishlist"));
const Cart          = lazy(() => import("@/pages/Cart"));
const Checkout      = lazy(() => import("@/pages/Checkout"));
const Settings      = lazy(() => import("@/pages/Settings"));
const Admin         = lazy(() => import("@/pages/Admin"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Calculator    = lazy(() => import("@/pages/Calculator"));
const Visualizer    = lazy(() => import("@/pages/Visualizer"));
const TrackOrder    = lazy(() => import("@/pages/TrackOrder"));
const Login         = lazy(() => import("@/pages/auth/Login"));
const Signup        = lazy(() => import("@/pages/auth/Signup"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const NotFound      = lazy(() => import("@/pages/NotFound"));

function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-inner">
        <div className="page-loader-logo">DRIP<span className="page-loader-dot">.</span></div>
        <div className="page-loader-bar-track">
          <div className="page-loader-bar-fill" />
        </div>
        <p className="page-loader-label">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* Global Floating WhatsApp Concierge Widget */}
      <WhatsAppWidget />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/shop"            element={<Shop />} />
          <Route path="/Shop"            element={<Shop />} />
          <Route path="/categories"      element={<Categories />} />
          <Route path="/Categories"      element={<Categories />} />
          <Route path="/about"           element={<About />} />
          <Route path="/About"           element={<About />} />
          <Route path="/about-us"        element={<About />} />
          <Route path="/contact"         element={<Contact />} />
          <Route path="/Contact"         element={<Contact />} />
          <Route path="/painters"        element={<Painters />} />
          <Route path="/Painters"        element={<Painters />} />
          <Route path="/wishlist"        element={<Wishlist />} />
          <Route path="/Wishlist"        element={<Wishlist />} />
          <Route path="/settings"        element={<Settings />} />
          <Route path="/Settings"        element={<Settings />} />
          <Route path="/admin"           element={<Admin />} />
          <Route path="/Admin"           element={<Admin />} />
          <Route path="/admin/*"         element={<Admin />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/Login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/Signup"          element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart"            element={<Cart />} />
          <Route path="/Cart"            element={<Cart />} />
          <Route path="/AddToCart"       element={<Cart />} />
          <Route path="/product/:id"     element={<ProductDetail />} />
          <Route path="/calculator"      element={<Calculator />} />
          <Route path="/Calculator"      element={<Calculator />} />
          <Route path="/visualizer"      element={<Visualizer />} />
          <Route path="/Visualizer"      element={<Visualizer />} />
          <Route path="/track-order"     element={<TrackOrder />} />
          <Route path="/TrackOrder"      element={<TrackOrder />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}