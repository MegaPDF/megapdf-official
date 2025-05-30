"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Activity,
  Shield,
  Wallet,
  FileCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "PDF Tools",
    href: "/admin/settings/pdf-tools",
    icon: FileCog,
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: Wallet,
  },
  {
    title: "API Usage",
    href: "/admin/api-usage",
    icon: BarChart3,
  },
  {
    title: "Activity Logs",
    href: "/admin/activity",
    icon: Activity,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="flex items-center gap-2 p-6 border-b border-border">
        <Shield className="h-6 w-6 text-primary" />
        <span className="font-semibold text-lg">Admin Panel</span>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.includes(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
          Back to Main App
        </Link>
      </div>
    </div>
  );
}
