import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, ShoppingCart, Boxes, ReceiptText, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useStaffProfile } from "@/hooks/useSession";

const nav = [
  { to: "/pos", label: "Sell", icon: ShoppingCart },
  { to: "/inventory", label: "Stock", icon: Boxes },
  { to: "/sales", label: "Sales", icon: ReceiptText },
  { to: "/trends", label: "Trends", icon: TrendingUp },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data: profile } = useStaffProfile(user?.id);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/pos" className="font-display text-lg font-bold text-primary">
            Shop<span className="text-accent">Desk</span>
          </Link>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">{profile?.fullName ?? "Staff"}</p>
            <p className="text-xs text-muted-foreground">{profile?.isAdmin ? "Admin" : "Seller"}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
