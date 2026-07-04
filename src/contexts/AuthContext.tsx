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

    // 1. Get initial session on mount
    console.log("AuthContext: Initializing, fetching session...");
    void supabase.auth.getSession().then(async ({ data: { session: initialSession }, error }) => {
      if (!mounted) return;
      if (error) {
        console.error("AuthContext: Error fetching session on mount:", error);
      }
      console.log("AuthContext: Initial session retrieved:", initialSession ? "Logged In" : "No Session");
      if (initialSession) {
        await syncSession(initialSession);
      } else {
        await syncSession(null);
      }
      setLoading(false);
      bootstrapCompletedRef.current = true;
    }).catch(err => {
      console.error("AuthContext: Unexpected error during initial getSession:", err);
      if (mounted) {
        setLoading(false);
        bootstrapCompletedRef.current = true;
      }
    });

    // 2. Listen to subsequent auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      
      console.log(`AuthContext: onAuthStateChange event fired: ${event}`, "Session exists:", !!nextSession);

      // Ignore initial auth state change events handled by getSession
      if (!bootstrapCompletedRef.current) {
        console.log("AuthContext: Ignoring initial event before bootstrap completion.");
        return;
      }

      if (event === "TOKEN_REFRESHED") {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        return;
      }

      if (event === "SIGNED_OUT" && !signingOutRef.current && !nextSession) {
        setLoading(true);
        console.log("AuthContext: SIGNED_OUT detected. Checking getSession to verify...");
        // Try to get session to confirm if truly signed out or just a temporary state
        void supabase.auth
          .getSession()
          .then(async ({ data: { session: recoveredSession } }) => {
            if (!mounted) return;
            console.log("AuthContext: getSession check finished. Recovered:", !!recoveredSession);
            await syncSession(recoveredSession);
          })
          .finally(() => {
            if (mounted) setLoading(false);
          });
        return;
      }

      setLoading(true);
      void syncSession(nextSession).finally(() => {
        if (mounted) setLoading(false);
      });
    });

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
