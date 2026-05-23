"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  FileCode,
  RefreshCw,
  Filter,
} from "lucide-react";

export interface Diagnostic {
  id: string;
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  severity: "error" | "warning" | "info" | "hint";
  message: string;
  source?: string;
  code?: string;
  relatedInfo?: Array<{
    file: string;
    line: number;
    message: string;
  }>;
}

export interface DiagnosticsPanelProps {
  diagnostics: Diagnostic[];
  onRefresh?: () => void;
  onDiagnosticClick?: (diagnostic: Diagnostic) => void;
  className?: string;
}

const severityConfig = {
  error: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    label: "错误",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    label: "警告",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    label: "信息",
  },
  hint: {
    icon: Lightbulb,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
    label: "提示",
  },
};

export function DiagnosticsPanel({
  diagnostics,
  onRefresh,
  onDiagnosticClick,
  className,
}: DiagnosticsPanelProps) {
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "info" | "hint">("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [groupByFile, setGroupByFile] = useState(true);

  const filteredDiagnostics = diagnostics.filter((d) =>
    filter === "all" ? true : d.severity === filter
  );

  const groupedDiagnostics = useCallback(() => {
    if (!groupByFile) {
      return { "All Files": filteredDiagnostics };
    }
    const groups: Record<string, Diagnostic[]> = {};
    for (const d of filteredDiagnostics) {
      if (!groups[d.file]) {
        groups[d.file] = [];
      }
      groups[d.file].push(d);
    }
    return groups;
  }, [filteredDiagnostics, groupByFile]);

  const stats = {
    errors: diagnostics.filter((d) => d.severity === "error").length,
    warnings: diagnostics.filter((d) => d.severity === "warning").length,
    info: diagnostics.filter((d) => d.severity === "info").length,
    hints: diagnostics.filter((d) => d.severity === "hint").length,
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderDiagnostic = (diagnostic: Diagnostic) => {
    const config = severityConfig[diagnostic.severity];
    const Icon = config.icon;
    const isExpanded = expandedItems.has(diagnostic.id);

    return (
      <div
        key={diagnostic.id}
        className={`border rounded-lg p-3 mb-2 cursor-pointer transition-colors hover:bg-accent/50 ${config.borderColor}`}
        onClick={() => onDiagnosticClick?.(diagnostic)}
      >
        <div className="flex items-start gap-2">
          <Icon className={`h-4 w-4 mt-0.5 ${config.color}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {diagnostic.message}
              </span>
              {diagnostic.code && (
                <Badge variant="outline" className="text-xs">
                  {diagnostic.code}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>
                {diagnostic.file}:{diagnostic.line}:{diagnostic.column}
              </span>
              {diagnostic.source && (
                <Badge variant="secondary" className="text-xs">
                  {diagnostic.source}
                </Badge>
              )}
            </div>
            {diagnostic.relatedInfo && diagnostic.relatedInfo.length > 0 && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(diagnostic.id);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 mr-1" />
                  ) : (
                    <ChevronRight className="h-3 w-3 mr-1" />
                  )}
                  {diagnostic.relatedInfo.length} 相关信息
                </Button>
                {isExpanded && (
                  <div className="mt-2 pl-4 space-y-1">
                    {diagnostic.relatedInfo.map((info, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-muted-foreground flex items-center gap-1"
                      >
                        <FileCode className="h-3 w-3" />
                        <span>
                          {info.file}:{info.line}
                        </span>
                        <span className="ml-2">{info.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">诊断面板</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGroupByFile(!groupByFile)}
            >
              <Filter className="h-4 w-4 mr-1" />
              {groupByFile ? "按文件" : "全部"}
            </Button>
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant={filter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("all")}
          >
            全部 ({diagnostics.length})
          </Badge>
          <Badge
            variant={filter === "error" ? "destructive" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("error")}
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            {stats.errors}
          </Badge>
          <Badge
            variant={filter === "warning" ? "default" : "outline"}
            className="cursor-pointer bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
            onClick={() => setFilter("warning")}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {stats.warnings}
          </Badge>
          <Badge
            variant={filter === "info" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("info")}
          >
            <Info className="h-3 w-3 mr-1" />
            {stats.info}
          </Badge>
          <Badge
            variant={filter === "hint" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("hint")}
          >
            <Lightbulb className="h-3 w-3 mr-1" />
            {stats.hints}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {filteredDiagnostics.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
              <p>没有诊断结果</p>
            </div>
          ) : (
            Object.entries(groupedDiagnostics()).map(([file, items]) => (
              <div key={file} className="mb-4">
                {groupByFile && (
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                    <FileCode className="h-4 w-4" />
                    <span>{file}</span>
                    <Badge variant="secondary" className="text-xs">
                      {items.length}
                    </Badge>
                  </div>
                )}
                {items.map(renderDiagnostic)}
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
