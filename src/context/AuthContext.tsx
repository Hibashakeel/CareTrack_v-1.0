import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";

import {
  getUserProfile,
  listenToAuth,
  logoutUser,
  type UserProfile,
} from "../services/auth";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let requestId = 0;
    const unsubscribe = listenToAuth((nextUser) => {
      const currentRequest = ++requestId;
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      void getUserProfile(nextUser.uid)
        .then((nextProfile) => {
          if (currentRequest !== requestId) return;
          setProfile(nextProfile);
        })
        .catch((error: unknown) => {
          if (currentRequest !== requestId) return;
          console.error("Unable to load the signed-in user profile:", error);
          setProfile(null);
        })
        .finally(() => {
          if (currentRequest === requestId) setLoading(false);
        });
    });

    return () => {
      requestId += 1;
      unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (!user?.uid) {
      throw new Error("You must be signed in to refresh your profile.");
    }

    const refreshedProfile = await getUserProfile(user.uid);
    if (!refreshedProfile) {
      throw new Error("Your account profile could not be found.");
    }

    setProfile(refreshedProfile);
    return refreshedProfile;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout: logoutUser,
        refreshProfile,
      }}
    >
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
