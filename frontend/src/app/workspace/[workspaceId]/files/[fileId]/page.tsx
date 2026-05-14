"use client";

import { AppShell } from "@/components/layout/app-shell";
import { OfficeEditorContent } from "./office-editor-content";

interface FileEditorPageProps {
  params: Promise<{
    workspaceId: string;
    fileId: string;
  }>;
}

export default async function FileEditorPage({ params }: FileEditorPageProps) {
  const { workspaceId, fileId } = await params;

  return (
    <AppShell>
      <OfficeEditorContent workspaceId={workspaceId} fileId={fileId} />
    </AppShell>
  );
}
