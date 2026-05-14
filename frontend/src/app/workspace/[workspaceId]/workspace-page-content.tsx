"use client";

import { useState } from "react";
import {
  FileText,
  BarChart3,
  Presentation,
  FolderOpen,
  Clock,
  Star,
  Users,
  Plus,
  Grid,
  List,
  Search,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Workspace } from "@/types/workspace";

interface WorkspacePageContentProps {
  workspaceId: string;
}

const recentFiles = [
  { id: "1", name: "项目计划文档", type: "document" as const, time: "10分钟前" },
  { id: "2", name: "Q4 销售报表", type: "spreadsheet" as const, time: "1小时前" },
  { id: "3", name: "产品演示", type: "presentation" as const, time: "2小时前" },
];

const pinnedFiles = [
  { id: "4", name: "会议纪要模板", type: "document" as const },
  { id: "5", name: "预算跟踪表", type: "spreadsheet" as const },
];

const typeIcons: Record<string, React.ElementType> = {
  document: FileText,
  spreadsheet: BarChart3,
  presentation: Presentation,
};

const typeColors: Record<string, string> = {
  document: "bg-blue-100 text-blue-600",
  spreadsheet: "bg-green-100 text-green-600",
  presentation: "bg-orange-100 text-orange-600",
};

export function WorkspacePageContent({ workspaceId }: WorkspacePageContentProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-full overflow-auto">
      {/* Page Header */}
      <div className="px-6 py-6 border-b border-[var(--border-light)] bg-[var(--bg-primary)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              工作区名称
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              欢迎回来！这里有您最近的工作内容。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              邀请成员
            </Button>
            <Button size="sm" className="bg-[var(--office-blue)] hover:bg-[var(--office-blue-dark)]">
              <Plus className="w-4 h-4 mr-2" />
              新建
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
            <span className="text-[var(--text-secondary)]">在线</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FolderOpen className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-[var(--text-secondary)]">12 个文件</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-[var(--text-secondary)]">5 位成员</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-md focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
        </div>

        {/* Recent Files Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--text-muted)]" />
              最近文件
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentFiles.map((file) => {
              const Icon = typeIcons[file.type];
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] hover:border-[var(--border-medium)] hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[file.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{file.time}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-[var(--bg-hover)]">
                        <MoreHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>打开</DropdownMenuItem>
                      <DropdownMenuItem>重命名</DropdownMenuItem>
                      <DropdownMenuItem>移动到...</DropdownMenuItem>
                      <DropdownMenuItem className="text-[var(--error)]">删除</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pinned Files Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-[var(--text-muted)]" />
              收藏
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pinnedFiles.map((file) => {
              const Icon = typeIcons[file.type];
              return (
                <div
                  key={file.id}
                  className="flex flex-col items-center p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] hover:border-[var(--border-medium)] hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${typeColors[file.type]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-center truncate w-full">
                    {file.name}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold mb-4">快速开始</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-4 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] hover:border-[var(--office-blue)] hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[var(--office-blue)]" />
              </div>
              <div>
                <p className="font-medium">新建文档</p>
                <p className="text-xs text-[var(--text-muted)]">开始编写文稿</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] hover:border-[var(--office-blue)] hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">新建表格</p>
                <p className="text-xs text-[var(--text-muted)]">处理数据和计算</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] hover:border-[var(--office-blue)] hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Presentation className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">新建演示</p>
                <p className="text-xs text-[var(--text-muted)]">创建幻灯片</p>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
