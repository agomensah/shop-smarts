import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCedis, formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({
    meta: [
      { title: "Sales History | ShopDesk School Shop" },
      {
        name: "description",
        content: "Browse every school shop transaction with items sold, payment method and the staff member who served.",
      },
      { property: "og:title", content: "Sales History | ShopDesk School Shop" },
      { property: "og:description", content: "A searchable record of all school shop sales." },
    ],
  }),
  component: SalesPage,
});

type SaleRow = {
  id: string;
  total: number;
  payment_method: string;
  created_at: string;
  cashier_id: string;
  sale_items: { id: string; product_name: string; quantity: number; line_total: number }[];
};

function SalesPage() {
  const [search, setSearch] = useState("");

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, total, payment_method, created_at, cashier_id, sale_items(id, product_name, quantity, line_total)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as SaleRow[];
    },
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["staff-names"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, full_name");
      if (error) throw error;
      return data;
    },
  });

  const nameFor = (id: string) => staff.find((s) => s.id === id)?.full_name ?? "Staff";

  const filtered = sales.filter((sale) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      nameFor(sale.cashier_id).toLowerCase().includes(q) ||
      sale.sale_items.some((i) => i.product_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Sales history</h1>
        <p className="text-sm text-muted-foreground">Latest {sales.length} transactions</p>
      </div>

      <Input
        placeholder="Search by item or staff name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading sales…</p>
      ) : filtered.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No sales recorded yet.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((sale) => (
            <li key={sale.id}>
              <Card className="shadow-card">
                <CardContent className="flex flex-wrap items-start justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {sale.sale_items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ") ||
                        "No items"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(sale.created_at)} · {nameFor(sale.cashier_id)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="capitalize">
                      {sale.payment_method}
                    </Badge>
                    <span className="font-display text-lg font-semibold text-primary">
                      {formatCedis(sale.total)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
