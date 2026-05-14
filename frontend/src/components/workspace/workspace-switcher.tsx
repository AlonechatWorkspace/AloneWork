"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Settings,
  Check,
  Folder,
  Briefcase,
  Users,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Workspace } from "@/types/workspace";

const mockWorkspaces: Workspace[] = [
  {
    id: "default",
    name: "默认工作区",
    description: "个人工作空间",
    icon: "folder",
    ownerId: "user1",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "team",
    name: "团队协作",
    description: "团队项目空间",
    icon: "briefcase",
    ownerId: "user1",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
];

const workspaceIcons: Record<string, React.ElementType> = {
  folder: Folder,
  briefcase: Briefcase,
  users: Users,
  sparkles: Sparkles,
};

export function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    mockWorkspaces[0]
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("currentWorkspaceId");
    if (saved) {
      const workspace = workspaces.find((w) => w.id === saved);
      if (workspace) setCurrentWorkspace(workspace);
    }
  }, [workspaces]);

  const handleSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem("currentWorkspaceId", workspace.id);
    setIsOpen(false);
  };

  const handleCreate = () => {
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: "新工作区",
      description: "",
      ownerId: "user1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorkspaces([...workspaces, newWorkspace]);
    handleSelect(newWorkspace);
  };

  const Icon = currentWorkspace
    ? workspaceIcons[currentWorkspace.icon || "folder"]
    : Folder;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
          <div className="w-6 h-6 rounded bg-[var(--office-blue-bg)] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[var(--office-blue)]" />
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:block">
            {currentWorkspace?.name || "选择工作区"}
          </span>
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            工作区
          </p>
        </div>
        {workspaces.map((workspace) => {
          const WorkspaceIcon = workspaceIcons[workspace.icon || "folder"];
          return (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleSelect(workspace)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded bg-[var(--office-blue-bg)] flex items-center justify-center">
                <WorkspaceIcon className="w-4 h-4 text-[var(--office-blue)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{workspace.name}</p>
                {workspace.description && (
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {workspace.description}
                  </p>
                )}
              </div>
              {currentWorkspace?.id === workspace.id && (
                <Check className="w-4 h-4 text-[var(--office-blue)]" />
              )}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCreate}
          className="flex items-center gap-3 cursor-pointer text-[var(--office-blue)]"
        >
          <div className="w-8 h-8 rounded bg-[var(--office-blue-bg)] flex items-center justify-center">
            <Plus className="w-4 h-4 text-[var(--office-blue)]" />
          </div>
          <span className="text-sm font-medium">创建新工作区</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 rounded bg-[var(--bg-tertiary)] flex items-center justify-center">
            <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
          <span className="text-sm">工作区设置</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
