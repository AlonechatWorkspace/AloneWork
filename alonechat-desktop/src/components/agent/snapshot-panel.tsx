"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Camera,
  RotateCcw,
  Trash2,
  Clock,
  GitBranch,
  Tag,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface Snapshot {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  branchName?: string;
  commitHash?: string;
  tags: string[];
}

export interface SnapshotPanelProps {
  workspacePath: string;
  snapshots: Snapshot[];
  onCreate?: (name: string, description: string) => void;
  onRollback?: (snapshotId: string) => void;
  onDelete?: (snapshotId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

export function SnapshotPanel({
  workspacePath,
  snapshots,
  onCreate,
  onRollback,
  onDelete,
  onRefresh,
  className,
}: SnapshotPanelProps) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreate = () => {
    if (newName && onCreate) {
      onCreate(newName, newDescription);
      setNewName("");
      setNewDescription("");
      setIsCreateOpen(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            工作区快照
          </CardTitle>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Camera className="h-4 w-4 mr-1" />
                  创建快照
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新快照</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">名称</label>
                    <input
                      className="w-full px-3 py-2 border rounded-md"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="快照名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">描述</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="可选描述"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleCreate} disabled={!newName}>
                    创建
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {snapshots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Camera className="h-8 w-8 mb-2 opacity-50" />
            <p>暂无快照</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSnapshot === snapshot.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() =>
                    setSelectedSnapshot(
                      snapshot.id === selectedSnapshot ? null : snapshot.id
                    )
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {snapshot.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {snapshot.id}
                        </Badge>
                      </div>
                      {snapshot.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {snapshot.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(snapshot.createdAt)}
                        </span>
                        {snapshot.branchName && (
                          <span className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            {snapshot.branchName}
                          </span>
                        )}
                      </div>
                      {snapshot.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {snapshot.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {onRollback && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRollback(snapshot.id);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(snapshot.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
