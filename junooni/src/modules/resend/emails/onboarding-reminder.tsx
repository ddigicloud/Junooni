import * as React from "react"

type Props = {
  email?: string
  studio_url?: string
  store_url?: string
}

export const onboardingReminderEmail = (props: unknown): React.ReactNode => {
  const { studio_url = "https://studio.junooni.com", store_url = "https://junooni.com" } = (props as Props) || {}

  return (
    <html>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f5f5f5", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ maxWidth: "600px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #e65100 0%, #ff6d00 100%)", padding: "40px 40px 32px", textAlign: "center" }}>
            <h1 style={{ color: "#ffffff", fontSize: "26px", fontWeight: 700, margin: 0 }}>Your Creator Journey Awaits 🚀</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", marginTop: "8px" }}>You're just a few steps away from launching your store on Junooni</p>
          </div>

          {/* Body */}
          <div style={{ padding: "40px" }}>
            <p style={{ fontSize: "17px", color: "#333", marginBottom: "16px" }}>Hey Creator 👋,</p>
            <p style={{ fontSize: "15px", color: "#555", marginBottom: "28px" }}>
              We noticed you started signing up for <strong>Junooni Creator Studio</strong> but didn't finish your onboarding. 
              No worries — your account is saved and ready to go! It only takes a few minutes to complete your profile and start selling your merchandise.
            </p>

            {/* Steps */}
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a", marginBottom: "16px" }}>Here's what you need to complete:</p>
            <div style={{ background: "#fafafa", border: "1px solid #ebebeb", borderRadius: "10px", padding: "24px", marginBottom: "32px" }}>
              {[
                { n: 1, title: "Creator Profile", desc: "Set up your name, handle, bio and profile photo" },
                { n: 2, title: "Business Details", desc: "Add your GST info and business address" },
                { n: 3, title: "Banking Information", desc: "Link your bank account to receive payouts" },
                { n: 4, title: "Launch Your Store", desc: "Start designing and selling your merchandise" },
                ].map((step, i) => (
                <table key={step.n} style={{ width: "100%", marginBottom: i < 3 ? "18px" : 0, borderCollapse: "collapse" }}>
                    <tbody>
                    <tr>
                        <td style={{ width: "36px", verticalAlign: "top", paddingTop: "2px" }}>
                        <table style={{ borderCollapse: "collapse" }}>
                            <tbody>
                            <tr>
                                <td style={{
                                background: "#e65100",
                                color: "#fff",
                                fontSize: "12px",
                                fontWeight: 700,
                                width: "26px",
                                height: "26px",
                                borderRadius: "50%",
                                textAlign: "center",
                                verticalAlign: "middle",
                                lineHeight: "26px",
                                }}>
                                {step.n}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        </td>
                        <td style={{ verticalAlign: "top", paddingLeft: "14px" }}>
                        <strong style={{ display: "block", fontSize: "14px", color: "#1a1a1a", marginBottom: "2px" }}>{step.title}</strong>
                        <span style={{ fontSize: "13px", color: "#777" }}>{step.desc}</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
                ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center", margin: "32px 0" }}>
              <a href={studio_url} style={{ display: "inline-block", background: "#e65100", color: "#ffffff", textDecoration: "none", fontSize: "16px", fontWeight: 600, padding: "14px 40px", borderRadius: "8px" }}>
                Complete My Onboarding →
              </a>
              <p style={{ fontSize: "13px", color: "#999", marginTop: "12px" }}>Takes less than 5 minutes</p>
            </div>

            {/* Benefits */}
            <div style={{ background: "linear-gradient(135deg, #fff3e0 0%, #fff8f0 100%)", border: "1px solid #ffccbc", borderRadius: "10px", padding: "24px", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#e65100", marginBottom: "14px", marginTop: 0 }}>✨ Why creators love Junooni</h3>
              {[
                { icon: "🎨", text: "Design custom merchandise with our easy-to-use studio" },
                { icon: "📦", text: "We handle printing, packing & shipping — you just create" },
                { icon: "💰", text: "Earn competitive margins on every sale with timely payouts" },
                { icon: "🇮🇳", text: "India's #1 creator merchandise marketplace" },
              ].map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#555", marginBottom: i < 3 ? "10px" : 0 }}>
                  <span style={{ fontSize: "18px" }}>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #ebebeb", margin: "28px 0" }} />
            <p style={{ fontSize: "15px", color: "#555" }}>
              If you have any questions or need help getting started, just reply to this email — we'd love to help you launch!
              <strong style={{ display: "block", marginTop: "8px", color: "#1a1a1a" }}>— The Junooni Team 🧡</strong>
            </p>
          </div>

          {/* Footer */}
          <div style={{ background: "#f9f9f9", borderTop: "1px solid #ebebeb", padding: "24px 40px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "6px" }}>
              You received this because you signed up at{" "}
              <a href={studio_url} style={{ color: "#e65100", textDecoration: "none" }}>studio.junooni.com</a>
            </p>
            <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "10px" }}>Junooni Marketplace · India</p>
            <div>
              <a href={store_url} style={{ fontSize: "12px", color: "#999", textDecoration: "none", margin: "0 6px" }}>Visit Store</a>
              <span style={{ color: "#ccc" }}>·</span>
              <a href={studio_url} style={{ fontSize: "12px", color: "#999", textDecoration: "none", margin: "0 6px" }}>Creator Studio</a>
              <span style={{ color: "#ccc" }}>·</span>
              <a href={`${store_url}/contact`} style={{ fontSize: "12px", color: "#999", textDecoration: "none", margin: "0 6px" }}>Contact Us</a>
            </div>
          </div>

        </div>
      </body>
    </html>
  )
}