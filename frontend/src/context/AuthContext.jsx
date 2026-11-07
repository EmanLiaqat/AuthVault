import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("authvault_token")
  );

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("authvault_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((newToken, userData) => {
    localStorage.setItem("authvault_token", newToken);
    localStorage.setItem("authvault_user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  }, []);

  const updateUser = useCallback((userData) => {
  setUser((currentUser) => {
    const updatedUser = {
      ...(currentUser || {}),
      ...userData,
    };

    localStorage.setItem(
      "authvault_user",
      JSON.stringify(updatedUser)
    );

    return updatedUser;
  });
}, []);

  const logout = useCallback(() => {
    localStorage.removeItem("authvault_token");
    localStorage.removeItem("authvault_user");

    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
      updateUser,
    }),
    [token, user, login, logout, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}