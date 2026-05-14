"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  User,
  HelpCircle,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-[var(--bg-primary)] border-b border-[var(--border-light)]">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[var(--office-blue)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">CA</span>
          </div>
          <span className="font-semibold text-[var(--text-primary)] hidden sm:block">
            ChatAgent
          </span>
        </div>

        {/* Workspace Switcher */}
        <WorkspaceSwitcher />
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="搜索文件、工作区..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-md focus:outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--office-blue-bg)]"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] rounded border border-[var(--border-light)]">
            /
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Help */}
        <button className="p-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
          <HelpCircle className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
          <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--error)] rounded-full" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/avatar.jpg" />
                <AvatarFallback className="bg-[var(--office-blue)] text-white text-sm">
                  U
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="font-medium text-sm">用户名称</p>
              <p className="text-xs text-[var(--text-muted)]">user@example.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>个人资料</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>设置</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[var(--error)]">
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
