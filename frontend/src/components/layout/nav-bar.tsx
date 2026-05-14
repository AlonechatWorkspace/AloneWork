"use client";

import { useState } from "react";
import {
  Home,
  FolderOpen,
  FileText,
  BarChart3,
  Presentation,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users,
  Wrench,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  path?: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: "home", icon: Home, label: "首页" },
  { id: "files", icon: FolderOpen, label: "文件" },
  { id: "document", icon: FileText, label: "文档", badge: 3 },
  { id: "spreadsheet", icon: BarChart3, label: "表格" },
  { id: "presentation", icon: Presentation, label: "演示" },
];

const bottomItems: NavItem[] = [
  { id: "team", icon: Users, label: "团队" },
  { id: "tools", icon: Wrench, label: "工具" },
  { id: "settings", icon: Settings, label: "设置" },
];

interface NavBarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function NavBar({ collapsed, onToggle }: NavBarProps) {
  const [activeId, setActiveId] = useState("files");

  return (
    <nav
      className={cn(
        "flex flex-col h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-light)] transition-all duration-200",
        collapsed ? "w-12" : "w-48"
      )}
    >
      {/* Main Nav Items */}
      <div className="flex-1 py-2">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activeId === item.id}
            collapsed={collapsed}
            onClick={() => setActiveId(item.id)}
          />
        ))}
      </div>

      {/* Bottom Nav Items */}
      <div className="py-2 border-t border-[var(--border-light)]">
        {bottomItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={activeId === item.id}
            collapsed={collapsed}
            onClick={() => setActiveId(item.id)}
          />
        ))}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-8 mx-2 mb-2 rounded-md hover:bg-[var(--sidebar-hover)] transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
        )}
      </button>
    </nav>
  );
}

interface NavButtonProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

function NavButton({ item, active, collapsed, onClick }: NavButtonProps) {
  const Icon = item.icon;

  const button = (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center w-full h-10 px-3 mx-1 rounded-md transition-colors relative",
        active
          ? "bg-[var(--sidebar-active)] text-[var(--office-blue)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)]"
      )}
    >
      <Icon className={cn("flex-shrink-0", collapsed ? "w-5 h-5" : "w-5 h-5")} />
      {!collapsed && (
        <>
          <span className="ml-3 text-sm font-medium">{item.label}</span>
          {item.badge && (
            <span className="ml-auto px-1.5 py-0.5 text-xs font-medium bg-[var(--office-blue)] text-white rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}
      {collapsed && item.badge && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--office-blue)] rounded-full" />
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-[var(--office-blue)] text-white rounded-full">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
