export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

        :root {
          --orange: #e65100;
          --orange-light: #ff6d00;
          --orange-muted: #fff3e0;
          --ink: #1a1209;
          --muted: #7a6f62;
          --surface: #fffdf9;
          --border: #ede8df;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .nf-root {
          min-height: 100vh;
          background: var(--surface);
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        /* Decorative background rings */
        .nf-root::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          border: 1px solid var(--border);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .nf-root::after {
          content: '';
          position: absolute;
          width: 900px;
          height: 900px;
          border-radius: 50%;
          border: 1px solid var(--border);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .nf-card {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 420px;
          width: 100%;
          animation: fadeUp 0.6s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nf-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--orange-muted);
          border: 1px solid #ffd0a0;
          color: var(--orange);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 100px;
          margin-bottom: 2.5rem;
        }

        .nf-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--orange);
          display: inline-block;
        }

        .nf-icon-wrap {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          position: relative;
        }

        .nf-icon-bg {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--orange-muted);
          border: 1.5px solid #ffd0a0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nf-icon-bg svg {
          width: 32px;
          height: 32px;
          color: var(--orange);
        }

        /* Orbiting dot */
        .nf-orbit {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 1.5px dashed #ffd0a0;
          animation: spin 8s linear infinite;
        }
        .nf-orbit::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--orange);
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .nf-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.75rem, 5vw, 2.25rem);
          font-weight: 700;
          color: var(--ink);
          line-height: 1.2;
          margin-bottom: 0.875rem;
        }

        .nf-desc {
          font-size: 0.9375rem;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 0.5rem;
        }

        .nf-handle {
          display: inline-block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--muted);
          background: #f5f2ec;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 4px 10px;
          margin-top: 0.5rem;
          margin-bottom: 2rem;
          font-family: 'DM Mono', monospace;
          word-break: break-all;
        }

        .nf-divider {
          width: 40px;
          height: 1px;
          background: var(--border);
          margin: 2rem auto;
        }

        .nf-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.75rem 1.75rem;
          border-radius: 12px;
          background: var(--orange);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9375rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 14px rgba(230, 81, 0, 0.3);
        }

        .nf-cta:hover {
          background: var(--orange-light);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(230, 81, 0, 0.4);
        }

        .nf-cta:active {
          transform: translateY(0);
        }

        .nf-cta svg {
          width: 16px;
          height: 16px;
          transition: transform 0.2s ease;
        }

        .nf-cta:hover svg {
          transform: translateX(3px);
        }

        .nf-footer {
          margin-top: 2.5rem;
          font-size: 0.8125rem;
          color: #b0a898;
        }

        .nf-footer a {
          color: var(--orange);
          text-decoration: none;
          font-weight: 500;
        }

        .nf-footer a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="nf-root">
        <div className="nf-card">

          <div className="nf-badge">404 · Page Not Found</div>

          <div className="nf-icon-wrap">
            <div className="nf-orbit" />
            <div className="nf-icon-bg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
          </div>

          <h1 className="nf-title">Page not found</h1>

          <p className="nf-desc">
            This page doesn't exist or the link may be incorrect. Double-check the URL or head back to Junooni.
          </p>

          <div className="nf-divider" />

          <a href="https://junooni.com" className="nf-cta">
            Go to Junooni
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>

          <p className="nf-footer">
            Are you a creator?{" "}
            <a href="https://studio.junooni.com/">Open your store →</a>
          </p>

        </div>
      </div>
    </>
  );
}