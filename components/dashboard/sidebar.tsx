"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  CreditCard,
  DollarSign,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  Wallet,
  Building,
  Shield,
  Bell,
  Palette,
  ArrowBigUp,
  ArrowBigDown,
  IndianRupee,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: "Members",
    href: "/dashboard/members",
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: "Fees",
    href: "/dashboard/fees",
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    title: "Payments",
    icon: <IndianRupee className="w-5 h-5" />,
    children: [
      {
        title: "Income",
        href: "/dashboard/payments/income",
        icon: <ArrowBigUp className="w-4 h-4" />,
      },
      {
        title: "Expenses",
        href: "/dashboard/payments/expenses",
        icon: <ArrowBigDown className="w-4 h-4" />,
      },
    ],
  },
  // {
  //   title: "Attendance",
  //   href: "/dashboard/attendance",
  //   icon: <CalendarClock className="w-5 h-5" />,
  // },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    title: "Settings",
    icon: <Settings className="w-5 h-5" />,
    children: [
      {
        title: "Membership Types",
        href: "/dashboard/settings/membership-types",
        icon: <CreditCard className="w-4 h-4" />,
      },
      // {
      //   title: "Gym Profile",
      //   href: "/dashboard/settings/gym-profile",
      //   icon: <Building className="w-4 h-4" />,
      // },
      // {
      //   title: "User Management",
      //   href: "/dashboard/settings/users",
      //   icon: <Shield className="w-4 h-4" />,
      // },
      // {
      //   title: "Notifications",
      //   href: "/dashboard/settings/notifications",
      //   icon: <Bell className="w-4 h-4" />,
      // },
      // {
      //   title: "Appearance",
      //   href: "/dashboard/settings/appearance",
      //   icon: <Palette className="w-4 h-4" />,
      // },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="dashboard-sidebar flex flex-col h-full bg-card border-r">
      {/* <div className="p-4 flex items-center gap-2">
        <Dumbbell className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          GymPro
        </span>
      </div> */}

      <ScrollArea className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {sidebarNavItems.map((item, index) => {
            const isGroup = !!item.children;

            if (isGroup) {
              const isOpen =
                openMenus[item.title] ??
                pathname.startsWith(
                  item.children?.[0]?.href.split("/").slice(0, 3).join("/")
                );
              const isGroupActive = item.children?.some(
                (child) => pathname === child.href
              );

              return (
                <Collapsible
                  key={index}
                  open={isOpen}
                  onOpenChange={() => toggleMenu(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant={isGroupActive ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start w-full transition-all duration-300",
                        isGroupActive
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <span className="mr-2 text-primary">{item.icon}</span>
                      <span className="flex-1 text-left">{item.title}</span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-primary" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {item.children.map((child, cIdx) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Button
                          key={cIdx}
                          asChild
                          variant={isChildActive ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "justify-start ml-6 w-[calc(100%-1.5rem)] transition-all duration-300",
                            isChildActive
                              ? "bg-primary/15 text-primary hover:bg-primary/25 border-l-2 border-primary"
                              : "hover:bg-primary/5 hover:text-primary text-muted-foreground"
                          )}
                        >
                          <Link
                            href={child.href}
                            className="flex items-center w-full"
                          >
                            <span className="mr-2">{child.icon}</span>
                            <span>{child.title}</span>
                          </Link>
                        </Button>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            const isActive = pathname === item.href;

            return (
              <Button
                key={index}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "justify-start transition-all duration-300",
                  isActive
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "hover:bg-primary/5 hover:text-primary"
                )}
              >
                <Link href={item.href}>
                  <span className="mr-2 text-primary">{item.icon}</span>
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40"
          asChild
        >
          <Link href="/">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Link>
        </Button>
      </div>
    </div>
  );
}
