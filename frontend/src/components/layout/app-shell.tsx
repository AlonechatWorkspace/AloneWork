"use client";

import { useState } from "react";
import { TopBar } from "./top-bar";
import { NavBar } from "./nav-bar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [navCollapsed, setNavCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-secondary)]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <NavBar collapsed={navCollapsed} onToggle={() => setNavCollapsed(!navCollapsed)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
