"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Tags,
  FileBarChart,
  LineChart,
  Target,
  Settings,
  CreditCard,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Financeiro",
    items: [
      { label: "Fluxo de Caixa", href: "/cashflow", icon: ArrowLeftRight },
      { label: "Receitas", href: "/income", icon: TrendingUp },
      { label: "Despesas", href: "/expenses", icon: TrendingDown },
      { label: "Contas", href: "/accounts", icon: Wallet },
      { label: "Categorias", href: "/categories", icon: Tags },
      { label: "Centros de Custo", href: "/cost-centers", icon: Building2 },
      { label: "Maquinetas", href: "/payment-machines", icon: CreditCard },
    ],
  },
  {
    items: [
      { label: "Relatórios", href: "/reports", icon: FileBarChart },
      { label: "Projeções", href: "/forecast", icon: LineChart },
      { label: "Metas", href: "/goals", icon: Target },
    ],
  },
  {
    items: [{ label: "Configurações", href: "/settings", icon: Settings }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-sidebar">
      <div className="flex h-16 items-center px-6 border-b">
        <span className="text-lg font-semibold tracking-tight">FinancialManagement</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="space-y-1">
            {section.title && (
              <p className="px-3 text-xs font-medium uppercase text-muted-foreground tracking-wider">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
