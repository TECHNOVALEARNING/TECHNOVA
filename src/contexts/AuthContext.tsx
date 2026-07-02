import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { buyerSupabase } from "@/integrations/supabase/buyer-client";

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  store_slug: string | null;
  store_description: string | null;
  contact: string | null;
  onboarding_completed: boolean | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const fallbackAuthContext: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  loading: false,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
};

export const useAuth = () => {
  return useContext(AuthContext) ?? fallbackAuthContext;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const latestProfileUserIdRef = useRef<string | null>(null);
  const authEventReceivedRef = useRef(false);
  const bootstrapCompletedRef = useRef(false);
  const signingOutRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    latestProfileUserIdRef.current = userId;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (latestProfileUserIdRef.current !== userId) return;

      if (error) {
        console.error("Erreur chargement profil:", error.message);
        setProfile(null);
        return;
      }

      if (data) {
        setProfile(data as Profile);
        return;
      }

      const { data: createdProfile, error: createError } = await supabase
        .from("profiles")
        .upsert({ id: userId }, { onConflict: "id" })
        .select("*")
        .single();

      if (latestProfileUserIdRef.current !== userId) return;

      if (createError) {
        console.error("Erreur création profil:", createError.message);
        setProfile(null);
        return;
      }

      setProfile(createdProfile as Profile);
    } catch (err) {
      if (latestProfileUserIdRef.current !== userId) return;
      console.error("Erreur inattendue profil:", err);
      setProfile(null);
    }
  }, []);

  const syncSession = useCallback(
    async (nextSession: Session | null) => {
      const nextUser = nextSession?.user ?? null;

      setSession(nextSession);
      setUser(nextUser);

      if (!nextUser) {
        latestProfileUserIdRef.current = null;
        setProfile(null);
        return;
      }

      await fetchProfile(nextUser.id);
    },
    [fetchProfile],
  );

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [fetchProfile, user]);

  useEffect(() => {
    let mounted = true;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void supabase.auth.startAutoRefresh();
      } else {
        void supabase.auth.stopAutoRefresh();
      }
    };

    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const scheduleSessionSync = (nextSession: Session | null) => {
      window.setTimeout(() => {
        if (!mounted) return;

        void syncSession(nextSession).finally(() => {
          if (mounted && bootstrapCompletedRef.current) {
            setLoading(false);
          }
        });
      }, 0);
    };

    const recoverAfterUnexpectedSignedOut = () => {
      window.setTimeout(() => {
        if (!mounted) return;

        void supabase.auth
          .getSession()
          .then(async ({ data: { session: recoveredSession } }) => {
            if (!mounted) return;
            await syncSession(recoveredSession);
          })
          .finally(() => {
            if (mounted) setLoading(false);
          });
      }, 250);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION") return;

      authEventReceivedRef.current = true;
      bootstrapCompletedRef.current = true;

      if (event === "TOKEN_REFRESHED") {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        return;
      }

      if (event === "SIGNED_OUT" && !signingOutRef.current && !nextSession) {
        setLoading(true);
        recoverAfterUnexpectedSignedOut();
        return;
      }

      setLoading(true);
      scheduleSessionSync(nextSession);
    });

    const bootstrapAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!authEventReceivedRef.current) {
          await syncSession(currentSession);
        }
      } catch (err) {
        console.error("Erreur bootstrap auth:", err);
      } finally {
        if (mounted) {
          bootstrapCompletedRef.current = true;
          setLoading(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void supabase.auth.startAutoRefresh();
      subscription.unsubscribe();
    };
  }, [syncSession]);

  const signOut = useCallback(async () => {
    signingOutRef.current = true;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erreur déconnexion:", error.message);
      }
      try {
        await buyerSupabase.auth.signOut();
        sessionStorage.removeItem("buyer_session");
      } catch (buyerErr) {
        console.error("Erreur clearing buyer auth on seller signout:", buyerErr);
      }
      await syncSession(null);
    } finally {
      signingOutRef.current = false;
      setLoading(false);
    }
  }, [syncSession]);

  const isAdmin = user?.email === "ancres707@gmail.com";

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, isAdmin, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
