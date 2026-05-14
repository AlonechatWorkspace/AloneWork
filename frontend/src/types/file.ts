export type FileType = "document" | "spreadsheet" | "presentation" | "other";

export interface FileRecord {
  id: string;
  filename: string;
  fileType: FileType;
  content?: unknown;
  previewData?: unknown;
  fileSize?: number;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  remoteId?: string;
}

export interface LocalFile {
  id?: number;
  filename: string;
  fileType: FileType;
  content: unknown;
  updatedAt: string;
  synced: boolean;
  remoteId?: string;
}

export interface UploadFileRequest {
  file: File;
  workspaceId: string;
}

export interface FileListParams {
  workspaceId: string;
  fileType?: FileType;
  page?: number;
  pageSize?: number;
  search?: string;
}
