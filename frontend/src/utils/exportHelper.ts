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

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `eztask-backup-${new Date().toISOString().split('T')[0]}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

/**
 * Validates and parses uploaded JSON backup file.
 */
export const parseImportedWorkspace = async (file: File): Promise<WorkspaceExportData> => {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (!parsed.boards || !Array.isArray(parsed.boards)) {
    throw new Error('Invalid workspace file: Missing boards array.');
  }

  return parsed as WorkspaceExportData;
};