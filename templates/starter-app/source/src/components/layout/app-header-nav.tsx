"use client";

import Link from "next/link";
import { CreditCard, LayoutDashboard, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Workspace", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

export function AppHeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 rounded-full border border-zinc-200/80 bg-white/80 p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80 md:flex">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);

        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "rounded-full",
              isActive &&
                "bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100",
            )}
          >
            <Link href={item.href}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
