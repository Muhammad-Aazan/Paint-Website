import React from 'react';

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="wrap">
        <p className="testimonials-eyebrow">Customer reviews</p>
        <h2 className="testimonials-title">Color that holds up past the first coat.</h2>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-rating">★★★★★</div>
            <p className="testimonial-text">
              "I sent them a photo of a leaf and got back the exact green.
              My painter asked where I found the color."
            </p>
            <div className="testimonial-footer">
              <div className="testimonial-avatar">NR</div>
              <div>
                <span className="testimonial-name">Nadia R.</span>
                <span className="testimonial-detail">Repainted a kitchen</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-rating">★★★★★</div>
            <p className="testimonial-text">
              "Reordered the same formula eighteen months later for a touch-up.
              Not even a slightly different shade at the seam."
            </p>
            <div className="testimonial-footer">
              <div className="testimonial-avatar">OT</div>
              <div>
                <span className="testimonial-name">Owen T.</span>
                <span className="testimonial-detail">Living room, twice</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-rating">★★★★☆</div>
            <p className="testimonial-text">
              "The swatch kit alone saved me from three wrong gallons.
              Worth it ten times over."
            </p>
            <div className="testimonial-footer">
              <div className="testimonial-avatar">PM</div>
              <div>
                <span className="testimonial-name">Priya M.</span>
                <span className="testimonial-detail">First-time buyer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}