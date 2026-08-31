import type { Board, AutomationRule } from '../types/kanban';

export interface WorkspaceExportData {
  version: string;
  exportedAt: string;
  boards: Board[];
  automations: AutomationRule[];
}

/**
 * Generates and triggers a browser download of the entire workspace as a formatted JSON file.
 */
export const exportWorkspaceToJSON = (boards: Board[], automations: AutomationRule[]) => {
  const data: WorkspaceExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    boards,
    automations,
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `eztask-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

/**
 * Validates and parses uploaded JSON backup file.
 */
export const parseImportedWorkspace = async (file: File): Promise<WorkspaceExportData> => {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (!parsed.boards || !Array.isArray(parsed.boards) || parsed.boards.length === 0) {
    throw new Error('Invalid workspace backup file: Missing or empty boards array.');
  }

  return parsed as WorkspaceExportData;
};