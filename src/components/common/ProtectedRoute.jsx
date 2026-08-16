import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isReady, status } = useSelector((state) => state.auth);

  if (status === "loading" || !isReady) {
    return (
      <section className="checkout-page">
        <div className="wrap">
          <p className="empty-wishlist-copy">Loading your session...</p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
