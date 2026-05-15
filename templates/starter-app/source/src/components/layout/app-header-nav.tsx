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
    <nav className="hidden items-center gap-1 rounded-lg border bg-card p-1 md:flex">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);

        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "rounded-md",
              isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
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
