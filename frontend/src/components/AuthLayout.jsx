import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="brand-lockup">
          <div className="brand-icon">
            <ShieldCheck size={28} />
          </div>
          <span>AuthVault</span>
        </div>

        <div className="brand-message">
          <span className="eyebrow">YOUR DIGITAL IDENTITY</span>
          <h1>Your identity deserves a safer home.</h1>
          <p>
            A secure and simple place to manage your account,
            personal information, and activity.
          </p>
        </div>

        <div className="brand-footer">
          Secure authentication. Private information.
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrapper">
          <div className="mobile-brand">
            <ShieldCheck size={26} />
            <span>AuthVault</span>
          </div>

          <div className="auth-heading">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {children}

          <p className="auth-legal">
            By continuing, you agree to use AuthVault responsibly.
          </p>
        </div>
      </section>
    </main>
  );
}