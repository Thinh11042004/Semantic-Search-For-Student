import * as React from 'react';

interface UserInfo {
  name: string;
  email: string;
  company: string;
  role: string;
  plan: string;
  memberSince: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (email: string, password: string, fullName: string) => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<UserInfo | null>(null);

  const login = (email: string, password: string) => {
    // TODO: Implement actual authentication logic here
    setIsAuthenticated(true);
    // Set mock user data
    setUser({
      name: "John Doe",
      email: email,
      company: "Example Corp",
      role: "Researcher",
      plan: "Premium",
      memberSince: "January 2023"
    });
    // Store authentication token in localStorage
    localStorage.setItem('isAuthenticated', 'true');
  };

  const register = async (email: string, password: string, fullName: string): Promise<void> => {
    // TODO: Implement actual registration logic here
    // For now, just simulate a successful registration
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
  };

  React.useEffect(() => {
    // Check if user is already authenticated on mount
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      // Set mock user data
      setUser({
        name: "John Doe",
        email: "john.doe@example.com",
        company: "Example Corp",
        role: "Researcher",
        plan: "Premium",
        memberSince: "January 2023"
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 