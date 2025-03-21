"use client";

import { Dashboard } from "@/components/dashboard";
import { toast, Toaster } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const onLinkClick = (path: string) => {
    toast.info("Under construction");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="w-48 border-r bg-card">
        <div className="flex flex-col gap-2 p-4">
          <h1 className="text-xl font-bold mb-4">Gambling Stats</h1>
          <a
            href="/"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium cursor-pointer"
          >
            Dashboard
          </a>
          <a
            className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent cursor-pointer"
            onClick={() => onLinkClick("/wheel")}
          >
            Wheel
          </a>
          <a
            className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent cursor-pointer"
            onClick={() => onLinkClick("/tournament")}
          >
            Tournament
          </a>
          <div className="mt-auto pt-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="flex-1 p-6">
        <Dashboard />
      </div>
      <Toaster />
    </div>
  );
}
