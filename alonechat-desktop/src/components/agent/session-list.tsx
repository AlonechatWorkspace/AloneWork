"use client"

import type { Session } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreVertical,
  Trash2,
  Archive,
  Pin,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useState } from "react";

interface SessionListProps {
  sessions: Session[];
  currentSessionId?: string;
  onSelect: (session: Session) => void;
  onCreate: () => void;
  onDelete: (sessionId: string) => void;
  onArchive?: (sessionId: string) => void;
  onSearch: (query: string) => void;
}

const modeColors = {
  MTC: "bg-blue-100 text-blue-800",
  CODE: "bg-green-100 text-green-800",
};

const interactionModeColors = {
  plan: "bg-blue-100 text-blue-800",
  agent: "bg-green-100 text-green-800",
  yolo: "bg-yellow-100 text-yellow-800",
};

export function SessionList({
  sessions,
  currentSessionId,
  onSelect,
  onCreate,
  onDelete,
  onArchive,
  onSearch,
}: SessionListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "昨天";
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            会话列表 / Sessions
          </CardTitle>
          <Button size="sm" onClick={onCreate}>
            <Plus className="h-4 w-4 mr-1" />
            新建
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索会话... / Search sessions..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4 pb-4">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mb-2" />
              <p className="text-sm">暂无会话 / No sessions</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                const isCurrent = session.id === currentSessionId;
                const isPinned = session.metadata?.pinned;
                const isArchived = session.metadata?.archived;

                return (
                  <div
                    key={session.id}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border cursor-pointer
                      transition-colors
                      ${isCurrent
                        ? "bg-primary/10 border-primary"
                        : "bg-card hover:bg-muted/50"
                      }
                      ${isArchived ? "opacity-60" : ""}
                    `}
                    onClick={() => onSelect(session)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isPinned && <Pin className="h-3 w-3 text-primary" />}
                        <span className="font-medium truncate">
                          {session.display_name || "未命名会话"}
                        </span>
                        <Badge
                          className={
                            interactionModeColors[
                              session.interaction_mode as keyof typeof interactionModeColors
                            ] || "bg-gray-100"
                          }
                        >
                          {session.interaction_mode}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(session.updated_at)}</span>
                        <span>·</span>
                        <span>{session.message_count || 0} 条消息</span>
                      </div>

                      {session.last_message && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {session.last_message}
                        </p>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle pin
                          }}
                        >
                          <Pin className="h-4 w-4 mr-2" />
                          {isPinned ? "取消置顶" : "置顶"}
                        </DropdownMenuItem>
                        {onArchive && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onArchive(session.id);
                            }}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            {isArchived ? "取消归档" : "归档"}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(session.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
