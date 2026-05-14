"use client";

import { AppShell } from "@/components/layout/app-shell";
import { WorkspacePageContent } from "./workspace-page-content";

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;

  return (
    <AppShell>
      <WorkspacePageContent workspaceId={workspaceId} />
    </AppShell>
  );
}
