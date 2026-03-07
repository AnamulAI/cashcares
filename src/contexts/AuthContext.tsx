import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  company_name: string | null;
  role_title: string | null;
  organization_type: string | null;
  country: string | null;
  state_division: string | null;
  created_at: string;
  updated_at: string;
}

export type AppRole = "admin" | "user";

/** Only these fields are required for profile to be considered complete */
function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return !!profile.full_name && profile.full_name.trim().length > 0;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: AppRole[];
  isAdmin: boolean;
  loading: boolean;
  profileComplete: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data as UserProfile | null);
    return data as UserProfile | null;
  }, []);

  const fetchRoles = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const r = (data || []).map((d: any) => d.role as AppRole);
    setRoles(r);
    return r;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await Promise.all([fetchProfile(user.id), fetchRoles(user.id)]);
    }
  }, [user, fetchProfile, fetchRoles]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  }, []);

  useEffect(() => {
    // 1. Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // If getSession already initialized, handle subsequent auth events
          if (initializedRef.current) {
            // Fetch profile/roles for new sign-in events
            setTimeout(async () => {
              await Promise.all([
                fetchProfile(newSession.user.id),
                fetchRoles(newSession.user.id),
              ]);
            }, 0);
          }
        } else {
          setProfile(null);
          setRoles([]);
          if (initializedRef.current) {
            setLoading(false);
          }
        }
      }
    );

    // 2. Then restore existing session — this is the ONLY path that sets loading=false initially
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        await Promise.all([
          fetchProfile(existingSession.user.id),
          fetchRoles(existingSession.user.id),
        ]);
      }

      initializedRef.current = true;
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchRoles]);

  const isAdmin = roles.includes("admin");
  const profileComplete = isProfileComplete(profile);

  return (
    <AuthContext.Provider value={{
      user, session, profile, roles, isAdmin, loading, profileComplete,
      refreshProfile, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
