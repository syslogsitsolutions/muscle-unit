"use client";

import Link from "next/link";
import { Bell, Search, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  return (
    // <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    //   <div className="container">
    //     <div className="flex h-16 items-center justify-between py-4 px-4">
    //       <div className="flex items-center gap-2">
    //         <Dumbbell className="h-6 w-6 text-primary" />
    //         <span className="text-xl font-bold">Muscle Unit</span>
    //       </div>
    //       <div className="flex items-center gap-4 lg:gap-6">
    //         <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
    //              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
    //           <Input
    //             type="search"
    //             placeholder="Search..."
    //             className="w-full bg-background pl-8" // Removed fixed widths to be more responsive
    //           />
    //         </div>
    //         <Button
    //           variant="outline"
    //           size="icon"
    //           className="relative rounded-full"
    //         >
    //           <Bell className="h-5 w-5" />
    //           <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
    //             3
    //           </span>
    //         </Button>

    //         <ThemeToggle />
    //         <SignedIn>
    //           <UserButton afterSignOutUrl="/auth/sign-in" />
    //         </SignedIn>
    //         <SignedOut>
    //           <Button asChild>
    //             <Link href="/auth/sign-in">Login</Link>
    //           </Button>
    //         </SignedOut>
    //       </div>
    //     </div>
    //   </div>
    // </header>
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between py-4 px-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Muscle Unit</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            className="relative rounded-full"
          >
            <Bell className="w-20" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              3
            </span>
          </Button>

          <ThemeToggle />
          <SignedIn>
            {/* <UserButton afterSignOutUrl="/auth/sign-in" /> */}
            <UserButton
              appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }}
            />
          </SignedIn>
          <SignedOut>
            <Button asChild>
              <Link href="/auth/sign-in">Login</Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
