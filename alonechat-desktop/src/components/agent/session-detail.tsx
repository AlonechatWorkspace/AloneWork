"use client"

import type { Session, SessionMessage } from "@/types/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  MessageSquare,
  GitBranch,
  Settings,
  User,
  Bot,
} from "lucide-react";

interface SessionDetailProps {
  session: Session;
  messages: SessionMessage[];
}

const roleIcons = {
  user: User,
  assistant: Bot,
  system: Settings,
};

const roleColors = {
  user: "bg-blue-100 text-blue-800",
  assistant: "bg-green-100 text-green-800",
  system: "bg-gray-100 text-gray-800",
};

export function SessionDetail({ session, messages }: SessionDetailProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          会话详情 / Session Detail
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-4 pb-4">
          {/* 基本信息 / Basic Info */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {session.display_name || "未命名会话"}
              </span>
              <Badge variant="outline">{session.mode}</Badge>
              <Badge>{session.interaction_mode}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>创建: {formatDate(session.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>更新: {formatDate(session.updated_at)}</span>
              </div>
            </div>

            {session.parent_id && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GitBranch className="h-4 w-4" />
                <span>父会话: {session.parent_id}</span>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              ID: <code className="font-mono">{session.id}</code>
            </div>
          </div>

          <Separator className="my-4" />

          {/* 统计信息 / Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 rounded-lg bg-muted">
              <div className="text-2xl font-bold">
                {messages.length}
              </div>
              <div className="text-xs text-muted-foreground">消息数</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted">
              <div className="text-2xl font-bold">
                {messages.filter((m) => m.role === "user").length}
              </div>
              <div className="text-xs text-muted-foreground">用户消息</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted">
              <div className="text-2xl font-bold">
                {messages.filter((m) => m.role === "assistant").length}
              </div>
              <div className="text-xs text-muted-foreground">助手回复</div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* 消息时间线 / Message Timeline */}
          <div className="space-y-4">
            <h4 className="font-medium">消息时间线 / Message Timeline</h4>
            
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无消息</p>
            ) : (
              <div className="space-y-3">
                {messages.map((message, index) => {
                  const Icon = roleIcons[message.role] || MessageSquare;
                  const colorClass =
                    roleColors[message.role] || "bg-gray-100";

                  return (
                    <div
                      key={message.id || index}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div className={`p-1.5 rounded ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={colorClass}>{message.role}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(message.timestamp)}
                          </span>
                          {message.metadata?.duration_ms && (
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(message.metadata.duration_ms)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm line-clamp-3">
                          {message.content}
                        </p>
                        {message.metadata?.tool_name && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            工具: {message.metadata.tool_name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
