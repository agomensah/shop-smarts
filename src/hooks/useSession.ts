import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useStaffProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["staff-profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const [profile, roles] = await Promise.all([
        supabase.from("profiles").select("id, full_name").eq("id", userId!).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId!),
      ]);
      if (profile.error) throw profile.error;
      if (roles.error) throw roles.error;
      return {
        fullName: profile.data?.full_name ?? "Staff",
        isAdmin: (roles.data ?? []).some((r) => r.role === "admin"),
      };
    },
  });
}
