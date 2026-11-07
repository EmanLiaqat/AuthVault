import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Menu,
  ShieldCheck,
  Clock3,
  CalendarDays,
  UserRound,
  MapPin,
  Phone,
  Mail,
  Pencil,
  Save,
  X,
  Activity as ActivityIcon,
  CheckCircle2,
  CircleAlert,
  ArrowUpRight,
  LockKeyhole,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

function formatDate(value) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "No login recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "U"
  );
}

function getActivityLabel(type) {
  const labels = {
    account_created: "Account created",
    login: "Successful login",
    profile_updated: "Profile updated",
  };
  return labels[type] || "Account activity";
}

function getActivityDescription(activity) {
  return activity.description || getActivityLabel(activity.type);
}

function getDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createProfileForm(user) {
  return {
    name: user?.name || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    dateOfBirth: getDateInputValue(user?.dateOfBirth),
  };
}

function getErrorMessage(error, fallback) {
  const data = error.response?.data;
  const validationMessage = data?.errors
    ?.map((item) => item.message)
    .filter(Boolean)
    .join(". ");

  return (
    validationMessage ||
    data?.message ||
    (error.response
      ? fallback
      : "Unable to connect to the server. Check that your backend is running.")
  );
}

function HistoryIconFallback() {
  return <ActivityIcon size={32} />;
}

export default function Profile() {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();

  const [activeSection, setActiveSection] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    dateOfBirth: "",
  });

  //  Password Change State ---
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  // ----------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const profileResponse = await api.get("/profile");
      const user = profileResponse.data.user;

      if (!user) {
        throw new Error("The server did not return profile information.");
      }

      setProfile(user);
      setForm(createProfileForm(user));

      updateUser({
        id: user.id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      });

      try {
        const activityResponse = await api.get("/activity");
        setActivities(activityResponse.data.activities || []);
      } catch (activityError) {
        console.error("Unable to load activity history:", activityError);
        setActivities([]);
      }
    } catch (requestError) {
      console.error("Unable to load profile:", requestError);

      if (requestError.response?.status === 401) {
        logout();
        navigate("/login?session=expired", { replace: true });
        return;
      }

      setError(
        getErrorMessage(
          requestError,
          "Unable to load your profile. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [logout, navigate, updateUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const fields = [
      profile.name,
      profile.email,
      profile.phone,
      profile.location,
      profile.bio,
      profile.dateOfBirth,
    ];
    const completed = fields.filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    ).length;
    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!editing || saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch("/profile", form);
      const updatedProfile = response.data.user;

      if (!updatedProfile) {
        throw new Error("The server did not return the updated profile.");
      }

      setProfile(updatedProfile);
      setForm(createProfileForm(updatedProfile));

      updateUser({
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        authProvider: updatedProfile.authProvider,
        createdAt: updatedProfile.createdAt,
        lastLoginAt: updatedProfile.lastLoginAt,
      });

      setEditing(false);
      setSuccess("Your personal information has been saved.");

      try {
        const activityResponse = await api.get("/activity");
        setActivities(activityResponse.data.activities || []);
      } catch (activityError) {
        console.error("Unable to refresh activity history:", activityError);
      }
    } catch (requestError) {
      console.error("Unable to save profile:", requestError);

      if (requestError.response?.status === 401) {
        logout();
        navigate("/login?session=expired", { replace: true });
        return;
      }

      setError(
        getErrorMessage(
          requestError,
          "Unable to update your profile. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  //Handle Password Change ---
  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError("New passwords do not match");
    }

    setPasswordLoading(true);
    try {
      await api.patch("/password/change", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordSuccess("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      // Optionally refresh activity log to show the update
      loadData();
    } catch (err) {
      const data = err.response?.data;
      setPasswordError(
        data?.errors?.map((i) => i.message).join(". ") || 
        data?.message || 
        "Failed to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  function handleCancelEdit() {
    if (!profile) return;
    setForm(createProfileForm(profile));
    setEditing(false);
    setError("");
    setSuccess("");
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleSectionChange(nextSection) {
    setActiveSection(nextSection);
    setMobileOpen(false);
    setError("");
    setSuccess("");
    setPasswordError("");
    setPasswordSuccess("");
  }

  const sectionTitles = {
    overview: {
      title: "Overview",
      subtitle: "A snapshot of your AuthVault account.",
    },
    personal: {
      title: "Personal information",
      subtitle: "Manage the information associated with your profile.",
    },
    activity: {
      title: "Activity log",
      subtitle: "Review recent events recorded for your account.",
    },
    security: { // <-- Added Security Title
      title: "Security",
      subtitle: "Manage your password and account security.",
    },
  };

  const section = sectionTitles[activeSection] || sectionTitles.overview;

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleSectionChange}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu-button"
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <div className="breadcrumb">Workspace / Profile</div>
              <h1>{section.title}</h1>
            </div>
          </div>

          <div className="topbar-account">
            <div className="topbar-account-copy">
              <strong>{profile?.name || "Your account"}</strong>
              <span>{profile?.email || ""}</span>
            </div>

            <div className="avatar avatar-small">
              {getInitials(profile?.name)}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="page-intro">
            <div>
              <p className="eyebrow">YOUR ACCOUNT</p>
              <h2>{section.title}</h2>
              <p>{section.subtitle}</p>
            </div>

            <div className="account-status">
              <span className="status-dot" />
              Account active
            </div>
          </div>

          {error && (
            <div className="alert alert-error dashboard-alert" role="alert">
              <CircleAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success dashboard-alert" role="status">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="loading-card">
              <div className="spinner" />
              <p>Loading your account information...</p>
            </div>
          ) : !profile ? (
            <div className="empty-state">
              <LockKeyhole size={32} />
              <h3>Profile unavailable</h3>
              <p>We couldn't load your account information.</p>
              <button type="button" className="button button-primary" onClick={loadData}>
                Try again
              </button>
            </div>
          ) : (
            <>
              {activeSection === "overview" && (
                <section className="overview-section">
                  <div className="welcome-card">
                    <div className="welcome-content">
                      <div className="welcome-tag">
                        <ShieldCheck size={15} />
                        YOUR SECURE SPACE
                      </div>
                      <h2>
                        Welcome back, {profile.name?.trim().split(/\s+/)[0] || "User"}.
                      </h2>
                      <p>
                        Your account details and personal information are
                        available in one secure place.
                      </p>
                      <button
                        type="button"
                        className="button button-light"
                        onClick={() => handleSectionChange("personal")}
                      >
                        View personal information
                        <ArrowUpRight size={17} />
                      </button>
                    </div>

                    <div className="welcome-decoration">
                      <div className="welcome-orbit orbit-one" />
                      <div className="welcome-orbit orbit-two" />
                      <div className="welcome-shield">
                        <ShieldCheck size={62} strokeWidth={1.3} />
                      </div>
                    </div>
                  </div>

                  <div className="stat-grid">
                    <article className="stat-card">
                      <div className="stat-icon stat-icon-purple">
                        <UserRound size={20} />
                      </div>
                      <span className="stat-label">PROFILE COMPLETION</span>
                      <div className="stat-value-row">
                        <strong>{completion}%</strong>
                        <span>complete</span>
                      </div>
                      <div
                        className="progress-track"
                        role="progressbar"
                        aria-label="Profile completion"
                        aria-valuenow={completion}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="progress-fill"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                      <p>Complete your personal information.</p>
                    </article>

                    <article className="stat-card">
                      <div className="stat-icon stat-icon-green">
                        <CalendarDays size={20} />
                      </div>
                      <span className="stat-label">MEMBER SINCE</span>
                      <strong className="stat-date">
                        {formatDate(profile.createdAt)}
                      </strong>
                      <p>Your AuthVault account creation date.</p>
                    </article>

                    <article className="stat-card">
                      <div className="stat-icon stat-icon-blue">
                        <Clock3 size={20} />
                      </div>
                      <span className="stat-label">LAST LOGIN</span>
                      <strong className="stat-date">
                        {formatDate(profile.lastLoginAt)}
                      </strong>
                      <p>{formatDateTime(profile.lastLoginAt)}</p>
                    </article>
                  </div>

                  <div className="content-grid">
                    <article className="panel account-panel">
                      <div className="panel-heading">
                        <div>
                          <h3>Account information</h3>
                          <p>Your registered account details.</p>
                        </div>
                        <div className="panel-heading-icon">
                          <ShieldCheck size={20} />
                        </div>
                      </div>

                      <div className="account-identity">
                        <div className="avatar avatar-large">
                          {getInitials(profile.name)}
                        </div>
                        <div>
                          <h4>{profile.name}</h4>
                          <p>{profile.email}</p>
                          <span className="verified-badge">
                            <CheckCircle2 size={13} />
                            Registered account
                          </span>
                        </div>
                      </div>

                      <div className="detail-list">
                        <div className="detail-row">
                          <span>Authentication method</span>
                          <strong>
                            {profile.authProvider === "google"
                              ? "Google"
                              : "Email and password"}
                          </strong>
                        </div>
                        <div className="detail-row">
                          <span>Account created</span>
                          <strong>{formatDate(profile.createdAt)}</strong>
                        </div>
                        <div className="detail-row">
                          <span>Last successful login</span>
                          <strong>{formatDate(profile.lastLoginAt)}</strong>
                        </div>
                      </div>
                    </article>

                    <article className="panel activity-preview">
                      <div className="panel-heading">
                        <div>
                          <h3>Recent activity</h3>
                          <p>Your latest account events.</p>
                        </div>
                        <div className="panel-heading-icon">
                          <ActivityIcon size={20} />
                        </div>
                      </div>

                      {activities.length === 0 ? (
                        <p className="muted-text">
                          No activity has been recorded, or activity history
                          is currently unavailable.
                        </p>
                      ) : (
                        <div className="activity-list">
                          {activities.slice(0, 4).map((activity, index) => (
                            <div
                              className="activity-item"
                              key={activity._id || `${activity.type}-${index}`}
                            >
                              <div
                                className={`activity-marker marker-${activity.type}`}
                              >
                                <CheckCircle2 size={16} />
                              </div>
                              <div className="activity-copy">
                                <strong>{getActivityLabel(activity.type)}</strong>
                                <p>{getActivityDescription(activity)}</p>
                                <span>{formatDateTime(activity.createdAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => handleSectionChange("activity")}
                      >
                        View all activity <ArrowUpRight size={16} />
                      </button>
                    </article>
                  </div>
                </section>
              )}

              {activeSection === "personal" && (
                <section className="panel personal-panel">
                  <div className="panel-heading personal-heading">
                    <div>
                      <h3>Personal information</h3>
                      <p>Keep your information accurate and up to date.</p>
                    </div>

                    {!editing && (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => {
                          setEditing(true);
                          setSuccess("");
                          setError("");
                        }}
                      >
                        <Pencil size={16} />
                        Edit details
                      </button>
                    )}
                  </div>

                  <div className="profile-identity-banner">
                    <div className="avatar avatar-profile">
                      {getInitials(profile.name)}
                    </div>
                    <div>
                      <h3>{profile.name}</h3>
                      <p>{profile.email}</p>
                      <span className="verified-badge">
                        <ShieldCheck size={13} />
                        AuthVault member
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSave}>
                    <div className="section-divider">
                      <span>GENERAL INFORMATION</span>
                    </div>

                    <div className="profile-form-grid">
                      <div className="form-field">
                        <label htmlFor="profile-name">Full name</label>
                        <div className="field-with-icon">
                          <UserRound size={17} />
                          <input
                            id="profile-name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            minLength={2}
                            maxLength={80}
                            disabled={!editing || saving}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label htmlFor="profile-email">Email address</label>
                        <div className="field-with-icon field-disabled">
                          <Mail size={17} />
                          <input
                            id="profile-email"
                            type="email"
                            value={profile.email || ""}
                            disabled
                            readOnly
                          />
                          <LockKeyhole size={15} />
                        </div>
                        <span className="field-hint">
                          Email cannot be changed here.
                        </span>
                      </div>

                      <div className="form-field">
                        <label htmlFor="profile-phone">Phone number</label>
                        <div className="field-with-icon">
                          <Phone size={17} />
                          <input
                            id="profile-phone"
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            maxLength={20}
                            disabled={!editing || saving}
                            placeholder="Add your phone number"
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label htmlFor="profile-location">Location</label>
                        <div className="field-with-icon">
                          <MapPin size={17} />
                          <input
                            id="profile-location"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            maxLength={100}
                            disabled={!editing || saving}
                            placeholder="City, country"
                          />
                        </div>
                      </div>

                      <div className="form-field">
                        <label htmlFor="profile-dob">Date of birth</label>
                        <input
                          className="standalone-input"
                          id="profile-dob"
                          name="dateOfBirth"
                          type="date"
                          value={form.dateOfBirth}
                          onChange={handleChange}
                          disabled={!editing || saving}
                          max={getDateInputValue(new Date())}
                        />
                      </div>

                      <div className="form-field form-field-full">
                        <label htmlFor="profile-bio">About you</label>
                        <textarea
                          className="standalone-input"
                          id="profile-bio"
                          name="bio"
                          value={form.bio}
                          onChange={handleChange}
                          maxLength={300}
                          rows={4}
                          disabled={!editing || saving}
                          placeholder="Tell us a little about yourself..."
                        />
                        {editing && (
                          <span className="field-hint">
                            {form.bio.length}/300 characters
                          </span>
                        )}
                      </div>
                    </div>

                    {editing && (
                      <div className="form-actions">
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          <X size={16} />
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="button button-primary"
                          disabled={saving}
                        >
                          <Save size={16} />
                          {saving ? "Saving..." : "Save changes"}
                        </button>
                      </div>
                    )}
                  </form>

                  <div className="profile-meta">
                    <div>
                      <span>Account created</span>
                      <strong>{formatDate(profile.createdAt)}</strong>
                    </div>
                    <div>
                      <span>Authentication</span>
                      <strong>
                        {profile.authProvider === "google"
                          ? "Google"
                          : "Email and password"}
                      </strong>
                    </div>
                  </div>
                </section>
              )}

              {activeSection === "activity" && (
                <section className="panel activity-page-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Account activity</h3>
                      <p>Events recorded by the AuthVault backend.</p>
                    </div>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={loadData}
                      disabled={loading}
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="activity-summary">
                    <div className="activity-summary-icon">
                      <ActivityIcon size={23} />
                    </div>
                    <div>
                      <strong>{activities.length} recorded events</strong>
                      <p>Showing up to 50 of your most recent account events.</p>
                    </div>
                  </div>

                  {activities.length === 0 ? (
                    <div className="empty-state">
                      <HistoryIconFallback />
                      <h3>No activity to display</h3>
                      <p>
                        No events were returned. Check that the backend
                        activity endpoint is configured.
                      </p>
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={loadData}
                        disabled={loading}
                      >
                        Refresh activity
                      </button>
                    </div>
                  ) : (
                    <div className="activity-list activity-full-list">
                      {activities.map((activity, index) => (
                        <div
                          className="activity-item"
                          key={activity._id || `${activity.type}-${index}`}
                        >
                          <div
                            className={`activity-marker marker-${activity.type}`}
                          >
                            <CheckCircle2 size={17} />
                          </div>
                          <div className="activity-copy">
                            <strong>{getActivityLabel(activity.type)}</strong>
                            <p>{getActivityDescription(activity)}</p>
                            <span>{formatDateTime(activity.createdAt)}</span>
                          </div>
                          <span className="activity-type-pill">
                            {(activity.type || "activity").replaceAll("_", " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="activity-note">
                    <ShieldCheck size={18} />
                    <p>
                      This is a read-only history of events recorded by the
                      backend. Events cannot be edited or deleted here.
                    </p>
                  </div>
                </section>
              )}

              {/* --- NEW: Security Section --- */}
              {activeSection === "security" && (
                <section className="panel personal-panel">
                  <div className="panel-heading personal-heading">
                    <div>
                      <h3>Change Password</h3>
                      <p>Ensure your account stays secure by using a strong password.</p>
                    </div>
                  </div>

                  {profile.authProvider === "google" ? (
                    <div className="alert alert-success">
                      <ShieldCheck size={18} />
                      <span>Your account is secured via Google Sign-In. You don't need a password.</span>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordChange} style={{ maxWidth: "500px" }}>
                      {passwordError && (
                        <div className="alert alert-error dashboard-alert" role="alert">
                          <CircleAlert size={18} />
                          <span>{passwordError}</span>
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="alert alert-success dashboard-alert" role="status">
                          <CheckCircle2 size={18} />
                          <span>{passwordSuccess}</span>
                        </div>
                      )}

                      <div className="form-field" style={{ marginBottom: "16px" }}>
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-field" style={{ marginBottom: "16px" }}>
                        <label htmlFor="newPassword">New Password</label>
                        <input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required
                          minLength={8}
                        />
                        <span className="field-hint">Must be at least 8 characters.</span>
                      </div>

                      <div className="form-field" style={{ marginBottom: "24px" }}>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          required
                          minLength={8}
                        />
                      </div>

                      <div className="form-actions" style={{ paddingTop: 0, borderTop: "none" }}>
                        <button
                          type="submit"
                          className="button button-primary"
                          disabled={passwordLoading}
                        >
                          {passwordLoading ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  )}
                </section>
              )}
              {/* ----------------------------- */}

              <footer className="dashboard-footer">
                <span>© {new Date().getFullYear()} AuthVault</span>
                <span>
                  <ShieldCheck size={14} />
                  Secure profile management
                </span>
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
}