"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Play,
  Square,
  RefreshCw,
} from "lucide-react";

export interface WorkerStatus {
  id: string;
  role: "leader" | "worker" | "verifier";
  status: "pending" | "producing" | "verifying" | "done" | "retry" | "failed";
  currentTask?: string;
}

export interface SubtaskStatus {
  id: string;
  description: string;
  assignedTo?: string;
  status: "pending" | "producing" | "verifying" | "done" | "retry" | "failed";
  progress?: number;
  error?: string;
  retryCount?: number;
}

export interface TeamStateData {
  teamId: string;
  phase: string;
  leaderStatus: WorkerStatus["status"];
  workers: WorkerStatus[];
  subtasks: SubtaskStatus[];
  errors: string[];
  startTime: string;
  elapsedTime?: number;
}

const phaseLabels: Record<string, string> = {
  planning: "规划中",
  dispatching: "调度中",
  executing: "执行中",
  verifying: "验证中",
  aggregating: "聚合中",
  done: "已完成",
  failed: "失败",
};

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    label: "等待中",
  },
  producing: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "执行中",
  },
  verifying: {
    icon: Loader2,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "验证中",
  },
  done: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "完成",
  },
  retry: {
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    label: "重试中",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "失败",
  },
};

export function TeamVisualization({
  state,
  onAbort,
  onRefresh,
}: {
  state: TeamStateData;
  onAbort?: () => void;
  onRefresh?: () => void;
}) {
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);

  const completedSubtasks = state.subtasks.filter((s) => s.status === "done").length;
  const totalSubtasks = state.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const renderWorkerCard = (worker: WorkerStatus) => {
    const config = statusConfig[worker.status];
    const Icon = config.icon;

    return (
      <div
        key={worker.id}
        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
          selectedWorker === worker.id ? "border-primary bg-primary/5" : ""
        } ${config.bgColor}`}
        onClick={() => setSelectedWorker(worker.id === selectedWorker ? null : worker.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
            <span className="font-medium capitalize">{worker.role}</span>
          </div>
          <Badge variant="outline" className={`text-xs ${config.color}`}>
            {config.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{worker.currentTask || "空闲"}</p>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team 状态
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {phaseLabels[state.phase] || state.phase}
            </Badge>
            {state.phase !== "done" && state.phase !== "failed" && (
              <Button variant="ghost" size="sm" onClick={onAbort}>
                <Square className="h-4 w-4 mr-1" />
                中止
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mt-3">
          <div className="flex items-center justify-between text-sm">
            <span>进度</span>
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <Progress value={progress} />
          {state.elapsedTime && (
            <span className="text-xs text-muted-foreground">
              已运行 {(state.elapsedTime / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Leader</h4>
            {renderWorkerCard({
              id: "leader",
              role: "leader",
              status: state.leaderStatus,
            })}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Workers ({state.workers.length})</h4>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {state.workers.map(renderWorkerCard)}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Verifiers</h4>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {state.workers.filter(w => w.role === "verifier").map(renderWorkerCard)}
            </div>
          </div>
        </div>

        {state.errors.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <h4 className="text-sm font-medium text-red-700 mb-1">错误</h4>
            <ul className="text-xs text-red-600 space-y-1">
              {state.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">子任务 ({state.subtasks.length})</h4>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {state.subtasks.map((subtask) => {
                const config = statusConfig[subtask.status];
                const Icon = config.icon;

                return (
                  <div
                    key={subtask.id}
                    className={`p-3 rounded-lg border ${config.bgColor}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          <span className="text-sm truncate">{subtask.description}</span>
                          {subtask.retryCount && subtask.retryCount > 0 && (
                            <Badge variant="outline" className="text-xs">
                              重试{subtask.retryCount}
                            </Badge>
                          )}
                        </div>
                        {subtask.error && (
                          <p className="text-xs text-red-600 mt-1">{subtask.error}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-xs ${config.color}`}>
                        {config.label}
                      </Badge>
                    </div>
                    {subtask.progress !== undefined && subtask.progress > 0 && (
                      <Progress value={subtask.progress} className="mt-2 h-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
