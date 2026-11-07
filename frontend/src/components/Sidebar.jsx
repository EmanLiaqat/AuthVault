import {
  ShieldCheck,
  LayoutDashboard,
  UserRound,
  History,
  LogOut,
  X,
  LockKeyhole 
} from "lucide-react";

const navigationItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard
  },
  {
    id: "personal",
    label: "Personal Information",
    icon: UserRound
  },
  {
    id: "activity",
    label: "Activity Log",
    icon: History
  },
  {
    id: "security",
    label: "Security",
    icon: LockKeyhole
  }
];

export default function Sidebar({
  activeSection,
  onNavigate,
  onLogout,
  mobileOpen,
  onClose
}) {
  function navigate(section) {
    onNavigate(section);
    onClose();
  }

  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div className="sidebar-brand-text">
            <strong>AuthVault</strong>
            <span>SECURE IDENTITY</span>
          </div>

          <button
            className="icon-button sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-item ${
                  activeSection === item.id ? "nav-item-active" : ""
                }`}
                onClick={() => navigate(item.id)}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-security-note">
            <ShieldCheck size={21} />
            <div>
              <strong>Your account, protected</strong>
              <span>AuthVault authentication</span>
            </div>
          </div>

          <button className="nav-item logout-button" onClick={onLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>

          <div className="sidebar-version">AUTHVAULT · PROFILE PORTAL</div>
        </div>
      </aside>
    </>
  );
}