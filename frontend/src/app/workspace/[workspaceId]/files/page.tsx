"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { FileExplorerContent } from "./file-explorer-content";

interface FilesPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function FilesPage({ params }: FilesPageProps) {
  const { workspaceId } = await params;

  return (
    <AppShell>
      <FileExplorerContent workspaceId={workspaceId} />
    </AppShell>
  );
}
