"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  BarChart3,
  Presentation,
  File,
  Plus,
  Upload,
  Search,
  Grid,
  List,
  SortAsc,
  MoreHorizontal,
  FolderPlus,
  ChevronRight,
  Star,
  Clock,
  Trash2,
  Copy,
  Move,
  Download,
  Share2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { LocalFile, FileType } from "@/types/file";
import {
  getAllFiles,
  createFile,
  deleteFile as deleteLocalFile,
} from "@/lib/file-store";

interface FileExplorerContentProps {
  workspaceId: string;
}

const typeIcons: Record<FileType, React.ElementType> = {
  document: FileText,
  spreadsheet: BarChart3,
  presentation: Presentation,
  other: File,
};

const typeColors: Record<FileType, string> = {
  document: "bg-blue-100 text-blue-600",
  spreadsheet: "bg-green-100 text-green-600",
  presentation: "bg-orange-100 text-orange-600",
  other: "bg-gray-100 text-gray-600",
};

const typeLabels: Record<FileType, string> = {
  document: "文档",
  spreadsheet: "表格",
  presentation: "演示",
  other: "文件",
};

// Mock data for demonstration
const mockFiles: LocalFile[] = [
  {
    id: 1,
    filename: "项目计划文档",
    fileType: "document",
    content: {},
    updatedAt: new Date().toISOString(),
    synced: true,
  },
  {
    id: 2,
    filename: "Q4 销售报表",
    fileType: "spreadsheet",
    content: {},
    updatedAt: new Date().toISOString(),
    synced: true,
  },
  {
    id: 3,
    filename: "产品演示文稿",
    fileType: "presentation",
    content: {},
    updatedAt: new Date().toISOString(),
    synced: false,
  },
  {
    id: 4,
    filename: "会议纪要",
    fileType: "document",
    content: {},
    updatedAt: new Date().toISOString(),
    synced: true,
  },
  {
    id: 5,
    filename: "预算跟踪表",
    fileType: "spreadsheet",
    content: {},
    updatedAt: new Date().toISOString(),
    synced: true,
  },
];

export function FileExplorerContent({ workspaceId }: FileExplorerContentProps) {
  const [files, setFiles] = useState<LocalFile[]>(mockFiles);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [filterType, setFilterType] = useState<FileType | "all">("all");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // In production, load from IndexedDB
    // const loadedFiles = await getAllFiles();
    // setFiles(loadedFiles);
  }, []);

  const handleCreateFile = async (fileType: FileType) => {
    const newFile: Omit<LocalFile, "id"> = {
      filename: `新建${typeLabels[fileType]}`,
      fileType,
      content: {},
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    try {
      const id = await createFile(newFile);
      setFiles([{ ...newFile, id }, ...files]);
    } catch (error) {
      console.error("Failed to create file:", error);
    }
    setIsCreating(false);
  };

  const handleDeleteFile = async (id: number) => {
    try {
      await deleteLocalFile(id);
      setFiles(files.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const filteredFiles = files
    .filter((file) => {
      const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || file.fileType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.filename.localeCompare(b.filename);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-light)] bg-[var(--bg-primary)]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--text-muted)]">工作区</span>
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="font-medium">所有文件</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="搜索文件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9 pr-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-md focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>

          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                类型: {filterType === "all" ? "全部" : typeLabels[filterType as FileType]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType("all")}>
                全部
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("document")}>
                文档
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("spreadsheet")}>
                表格
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("presentation")}>
                演示
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="w-4 h-4 mr-1" />
                排序
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("date")}>
                按修改时间
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                按名称
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode */}
          <div className="flex items-center border border-[var(--border-light)] rounded-md">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-[var(--bg-tertiary)]" : "hover:bg-[var(--bg-hover)]"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-[var(--bg-tertiary)]" : "hover:bg-[var(--bg-hover)]"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <DropdownMenu open={isCreating} onOpenChange={setIsCreating}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-[var(--office-blue)] hover:bg-[var(--office-blue-dark)]">
                <Plus className="w-4 h-4 mr-1" />
                新建
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCreateFile("document")}>
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                新建文档
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateFile("spreadsheet")}>
                <BarChart3 className="w-4 h-4 mr-2 text-green-600" />
                新建表格
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateFile("presentation")}>
                <Presentation className="w-4 h-4 mr-2 text-orange-600" />
                新建演示
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FolderPlus className="w-4 h-4 mr-2" />
                新建文件夹
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-1" />
            上传
          </Button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-6">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
              <FolderPlus className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-medium mb-2">暂无文件</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              点击"新建"或"上传"开始创建文件
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-[var(--office-blue)] hover:bg-[var(--office-blue-dark)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              新建文件
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => {
              const Icon = typeIcons[file.fileType];
              const colorClass = typeColors[file.fileType];
              return (
                <div
                  key={file.id}
                  className="group flex flex-col items-center p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] hover:border-[var(--border-medium)] hover:shadow-md cursor-pointer transition-all"
                >
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-3 ${colorClass}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-medium text-center truncate w-full mb-1">
                    {file.filename}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {new Date(file.updatedAt).toLocaleDateString()}
                  </p>
                  {!file.synced && (
                    <Badge variant="warning" className="mt-2 text-xs">
                      未同步
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded bg-[var(--bg-primary)] shadow border border-[var(--border-light)]">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Star className="w-4 h-4 mr-2" />
                          收藏
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          复制
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Move className="w-4 h-4 mr-2" />
                          移动
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          分享
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          下载
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-[var(--error)]"
                          onClick={() => file.id && handleDeleteFile(file.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--bg-secondary)]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    修改时间
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredFiles.map((file) => {
                  const Icon = typeIcons[file.fileType];
                  const colorClass = typeColors[file.fileType];
                  return (
                    <tr
                      key={file.id}
                      className="hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{file.filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                        {typeLabels[file.fileType]}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                        {new Date(file.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {file.synced ? (
                          <Badge variant="success" className="text-xs">已同步</Badge>
                        ) : (
                          <Badge variant="warning" className="text-xs">未同步</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-[var(--bg-tertiary)]">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>打开</DropdownMenuItem>
                            <DropdownMenuItem>重命名</DropdownMenuItem>
                            <DropdownMenuItem>复制</DropdownMenuItem>
                            <DropdownMenuItem>移动</DropdownMenuItem>
                            <DropdownMenuItem>分享</DropdownMenuItem>
                            <DropdownMenuItem>下载</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-[var(--error)]"
                              onClick={() => file.id && handleDeleteFile(file.id)}
                            >
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
