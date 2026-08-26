import React, { useState } from "react";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");
  const whatsappNumber = "923001234567";

  const quickPrompts = [
    "🎨 Need help calculating paint gallons for my rooms.",
    "🧪 Do you offer custom computerized shade mixing?",
    "🏢 I need bulk contractor rates for a project.",
    "🚚 What is the delivery time for TCS Express?",
  ];

  const handleSend = (msgToSend) => {
    const text = msgToSend || customMsg.trim() || "Hello DRIP Paint Concierge, I am inquiring from your website.";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
    setCustomMsg("");
  };

  return (
    <div className="wa-widget-wrapper">
      {/* Popover Card */}
      {isOpen && (
        <div className="wa-widget-card">
          {/* Header */}
          <div className="wa-widget-header">
            <div className="wa-agent-info">
              <div className="wa-avatar-ring">
                <span className="wa-avatar-initials">DP</span>
                <span className="wa-online-dot" />
              </div>
              <div>
                <h4 className="wa-agent-name">
                  DRIP Paint Concierge <span className="wa-verified-badge">✓</span>
                </h4>
                <p className="wa-agent-status">Online · Typically replies in under 5 mins</p>
              </div>
            </div>
            <button
              type="button"
              className="wa-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close WhatsApp chat"
            >
              ✕
            </button>
          </div>

          {/* Chat Body */}
          <div className="wa-chat-body">
            <div className="wa-chat-bubble">
              <p className="wa-greeting">Salam &amp; Welcome to DRIP Paints! 👋</p>
              <p className="wa-msg-text">
                How can our paint laboratory &amp; color consultants assist your project today?
              </p>
              <span className="wa-timestamp">Just now</span>
            </div>

            {/* Quick Inquiry Buttons */}
            <div className="wa-quick-prompts">
              <span className="wa-prompts-label">Quick Inquiries:</span>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className="wa-prompt-pill"
                  onClick={() => handleSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(customMsg);
            }}
            className="wa-input-form"
          >
            <input
              type="text"
              placeholder="Type message to chat on WhatsApp..."
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="wa-text-input"
            />
            <button
              type="submit"
              className="wa-send-btn"
              title="Send message to WhatsApp"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        type="button"
        className={`wa-trigger-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Chat with Paint Concierge on WhatsApp"
        title="Live WhatsApp Support"
      >
        <span className="wa-pulse-radar" />
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.981.536 1.777.781 2.796.782 3.182 0 5.768-2.586 5.768-5.766 0-3.18-2.586-5.768-5.768-5.768zm3.385 8.163c-.144.405-.837.774-1.17.823-.312.045-.698.081-2.115-.506-1.748-.724-2.884-2.493-2.971-2.609-.087-.116-.708-.941-.708-1.792 0-.85.447-1.267.607-1.441.16-.174.348-.218.464-.218.116 0 .232.001.333.006.107.005.25.04.39.378.145.348.493 1.202.536 1.29.043.087.072.189.014.305-.058.116-.087.189-.174.29-.087.102-.184.227-.262.305-.088.087-.18.181-.077.356.102.174.455.75 0.976 1.213.671.597 1.238.783 1.413.87.174.087.276.073.378-.044.102-.116.435-.507.551-.681.116-.174.232-.145.391-.087s1.015.478 1.189.565.29.131.333.203c.044.073.044.421-.1 0.826z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.523 3.662 1.433 5.176L2 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.18c-1.637 0-3.15-.494-4.417-1.343l-.316-.213-3.284.861.876-3.204-.233-.37A8.146 8.146 0 013.82 12c0-4.51 3.67-8.18 8.18-8.18 4.51 0 8.18 3.67 8.18 8.18 0 4.51-3.67 8.18-8.18 8.18z" />
        </svg>
        <span className="wa-btn-label">WhatsApp Concierge</span>
      </button>
    </div>
  );
}
