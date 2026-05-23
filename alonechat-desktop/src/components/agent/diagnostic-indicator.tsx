"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export interface DiagnosticIndicatorProps {
  errors: number;
  warnings: number;
  info: number;
  hints: number;
  onOpenPanel?: () => void;
  showDetails?: boolean;
}

export function DiagnosticIndicator({
  errors,
  warnings,
  info,
  hints,
  onOpenPanel,
  showDetails = true,
}: DiagnosticIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const total = errors + warnings + info + hints;

  const getStatusColor = () => {
    if (errors > 0) return "text-red-500";
    if (warnings > 0) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusIcon = () => {
    if (errors > 0) return AlertCircle;
    if (warnings > 0) return AlertTriangle;
    if (total > 0) return Info;
    return CheckCircle2;
  };

  const StatusIcon = getStatusIcon();

  if (!showDetails) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 px-2 ${getStatusColor()}`}
        onClick={onOpenPanel}
      >
        <StatusIcon className="h-4 w-4" />
        {total > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
            {total}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 ${getStatusColor()}`}
        >
          <StatusIcon className="h-4 w-4" />
          <span className="ml-1 text-sm">{total}</span>
          <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">诊断统计</h4>
            {onOpenPanel && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  setIsOpen(false);
                  onOpenPanel();
                }}
              >
                打开面板
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">错误</span>
              </div>
              <Badge
                variant={errors > 0 ? "destructive" : "outline"}
                className="font-mono"
              >
                {errors}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">警告</span>
              </div>
              <Badge
                variant={warnings > 0 ? "default" : "outline"}
                className={`font-mono ${warnings > 0 ? "bg-yellow-500/10 text-yellow-600" : ""}`}
              >
                {warnings}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-sm">信息</span>
              </div>
              <Badge variant="outline" className="font-mono">
                {info}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-gray-500" />
                <span className="text-sm">提示</span>
              </div>
              <Badge variant="outline" className="font-mono">
                {hints}
              </Badge>
            </div>
          </div>
          {total === 0 && (
            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>没有问题</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DiagnosticStatusBar({
  diagnostics,
  onOpenPanel,
}: {
  diagnostics: {
    errors: number;
    warnings: number;
    info: number;
    hints: number;
  };
  onOpenPanel?: () => void;
}) {
  const { errors, warnings, info, hints } = diagnostics;
  const total = errors + warnings + info + hints;

  return (
    <div className="flex items-center gap-3 text-xs">
      {errors > 0 && (
        <div className="flex items-center gap-1 text-red-500">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errors}</span>
        </div>
      )}
      {warnings > 0 && (
        <div className="flex items-center gap-1 text-yellow-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{warnings}</span>
        </div>
      )}
      {info > 0 && (
        <div className="flex items-center gap-1 text-blue-500">
          <Info className="h-3.5 w-3.5" />
          <span>{info}</span>
        </div>
      )}
      {hints > 0 && (
        <div className="flex items-center gap-1 text-gray-500">
          <Lightbulb className="h-3.5 w-3.5" />
          <span>{hints}</span>
        </div>
      )}
      {total === 0 && (
        <div className="flex items-center gap-1 text-green-500">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>无问题</span>
        </div>
      )}
      {onOpenPanel && total > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-1.5 text-xs"
          onClick={onOpenPanel}
        >
          查看
        </Button>
      )}
    </div>
  );
}
