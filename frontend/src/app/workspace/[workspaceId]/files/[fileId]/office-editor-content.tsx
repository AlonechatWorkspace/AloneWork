"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Download,
  Share2,
  MoreHorizontal,
  FileText,
  BarChart3,
  Presentation,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentEditor } from "@/components/office/document-editor";
import { SpreadsheetEditor } from "@/components/office/spreadsheet-editor";
import { PresentationEditor } from "@/components/office/presentation-editor";
import type { LocalFile, FileType } from "@/types/file";
import { getFileById, updateFile } from "@/lib/file-store";

interface OfficeEditorContentProps {
  workspaceId: string;
  fileId: string;
}

// Mock file data
const mockFiles: Record<string, LocalFile> = {
  "1": {
    id: 1,
    filename: "项目计划文档",
    fileType: "document",
    content: { type: "doc" },
    updatedAt: new Date().toISOString(),
    synced: true,
  },
  "2": {
    id: 2,
    filename: "Q4 销售报表",
    fileType: "spreadsheet",
    content: { sheets: [{ name: "Sheet1", cells: {} }], activeSheetIndex: 0 },
    updatedAt: new Date().toISOString(),
    synced: true,
  },
  "3": {
    id: 3,
    filename: "产品演示文稿",
    fileType: "presentation",
    content: { slides: [{ id: "1", elements: [] }], activeSlideIndex: 0 },
    updatedAt: new Date().toISOString(),
    synced: false,
  },
};

const typeIcons: Record<FileType, React.ElementType> = {
  document: FileText,
  spreadsheet: BarChart3,
  presentation: Presentation,
  other: FileText,
};

export function OfficeEditorContent({ workspaceId, fileId }: OfficeEditorContentProps) {
  const router = useRouter();
  const [file, setFile] = useState<LocalFile | null>(null);
  const [title, setTitle] = useState("加载中...");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // In production, load from IndexedDB
    // const loadedFile = await getFileById(parseInt(fileId));
    const loadedFile = mockFiles[fileId];
    if (loadedFile) {
      setFile(loadedFile);
      setTitle(loadedFile.filename);
    }
  }, [fileId]);

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    try {
      await updateFile(file.id!, { ...file, updatedAt: new Date().toISOString() });
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save:", error);
    }
    setSaving(false);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasChanges(true);
    if (file) {
      setFile({ ...file, filename: newTitle });
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      if (confirm("有未保存的更改，确定要离开吗？")) {
        router.push(`/workspace/${workspaceId}/files`);
      }
    } else {
      router.push(`/workspace/${workspaceId}/files`);
    }
  };

  const handleExport = () => {
    alert("导出功能开发中...");
  };

  const handleShare = () => {
    alert("分享功能开发中...");
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--office-blue)]" />
          <p className="text-[var(--text-muted)]">加载中...</p>
        </div>
      </div>
    );
  }

  const Icon = typeIcons[file.fileType];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-secondary)]">
      {/* Title Bar */}
      <div className="flex items-center justify-between h-12 px-4 bg-[var(--bg-primary)] border-b border-[var(--border-light)]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-6 h-6 rounded bg-[var(--office-blue-bg)] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[var(--office-blue)]" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-sm font-medium bg-transparent border-none outline-none focus:underline"
          />
          {hasChanges && (
            <span className="text-xs text-[var(--text-muted)]">● 未保存</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && !hasChanges && (
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Check className="w-3 h-3 text-[var(--success)]" />
              已保存 {lastSaved.toLocaleTimeString()}
            </span>
          )}

          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" />
            分享
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            保存
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            导出
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded hover:bg-[var(--bg-hover)]">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>文件信息</DropdownMenuItem>
              <DropdownMenuItem>版本历史</DropdownMenuItem>
              <DropdownMenuItem>打印</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>关闭</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Ribbon Toolbar */}
      <RibbonToolbar fileType={file.fileType} />

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        {file.fileType === "document" && <DocumentEditor file={file} onChange={setFile} />}
        {file.fileType === "spreadsheet" && <SpreadsheetEditor file={file} onChange={setFile} />}
        {file.fileType === "presentation" && (
          <PresentationEditor file={file} onChange={setFile} />
        )}
      </div>
    </div>
  );
}

interface RibbonToolbarProps {
  fileType: FileType;
}

function RibbonToolbar({ fileType }: RibbonToolbarProps) {
  const [activeTab, setActiveTab] = useState("home");

  const tabs =
    fileType === "document"
      ? ["开始", "插入", "布局", "审阅", "视图"]
      : fileType === "spreadsheet"
        ? ["开始", "插入", "公式", "数据", "审阅", "视图"]
        : ["开始", "插入", "动画", "幻灯片放映", "审阅", "视图"];

  return (
    <div className="bg-[var(--ribbon-bg)] border-b border-[var(--ribbon-border)]">
      <div className="flex items-center border-b border-[var(--ribbon-border)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[var(--bg-primary)] border-b-2 border-[var(--office-blue)] text-[var(--office-blue)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--ribbon-tab-hover)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 p-2 bg-[var(--ribbon-bg)] min-h-[48px]">
        <RibbonGroup label="剪贴板">
          <RibbonButton icon="clipboard">粘贴</RibbonButton>
          <RibbonButton icon="cut">剪切</RibbonButton>
          <RibbonButton icon="copy">复制</RibbonButton>
          <RibbonButton icon="format">格式刷</RibbonButton>
        </RibbonGroup>
        <RibbonGroup label="字体">
          <RibbonButton icon="bold" />
          <RibbonButton icon="italic" />
          <RibbonButton icon="underline" />
          <RibbonButton icon="strikethrough" />
          <RibbonSelect
            options={[
              { value: "11", label: "11" },
              { value: "12", label: "12" },
              { value: "14", label: "14" },
              { value: "16", label: "16" },
              { value: "18", label: "18" },
              { value: "24", label: "24" },
              { value: "36", label: "36" },
            ]}
            defaultValue="11"
          />
        </RibbonGroup>
        <RibbonGroup label="段落">
          <RibbonButton icon="align-left" />
          <RibbonButton icon="align-center" />
          <RibbonButton icon="align-right" />
          <RibbonButton icon="align-justify" />
          <RibbonButton icon="list" />
          <RibbonButton icon="list-ordered" />
        </RibbonGroup>
      </div>
    </div>
  );
}

function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

function RibbonButton({
  icon,
  children,
}: {
  icon: string;
  children?: React.ReactNode;
}) {
  const iconMap: Record<string, React.ReactNode> = {
    bold: <span className="font-bold">B</span>,
    italic: <span className="italic">I</span>,
    underline: <span className="underline">U</span>,
    strikethrough: <span className="line-through">S</span>,
    clipboard: "📋",
    cut: "✂️",
    copy: "📄",
    format: "🎨",
    "align-left": "⬅",
    "align-center": "➡",
    "align-right": "➡",
    "align-justify": "↔",
    list: "☰",
    "list-ordered": "1.",
  };

  return (
    <button className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-[var(--bg-hover)]">
      {iconMap[icon] || icon}
      {children && <span className="ml-1">{children}</span>}
    </button>
  );
}

function RibbonSelect({
  options,
  defaultValue,
}: {
  options: { value: string; label: string }[];
  defaultValue: string;
}) {
  return (
    <select
      defaultValue={defaultValue}
      className="px-2 py-1 text-sm border border-[var(--border-light)] rounded bg-[var(--bg-primary)]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
