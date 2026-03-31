import { useEffect } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';
import { StatusBar } from '@/components/shell/StatusBar';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { EditPanel } from '@/components/editing/EditPanel';
import { CompareToolbar } from '@/components/history/CompareToolbar';
import { CompareSideBySide } from '@/components/history/CompareSideBySide';
import { StagingToolbar } from '@/components/history/StagingToolbar';
import { StagingSideBySide } from '@/components/history/StagingSideBySide';
import { StagingChangesList } from '@/components/history/StagingChangesList';
import { PreviewBanner } from '@/components/history/PreviewBanner';
import { HistoryDropdown } from '@/components/history/HistoryDropdown';
import { GuidedTour } from '@/components/shell/GuidedTour';
import { VersionContext } from '@/hooks/VersionContext';
import { useVersionState } from '@/hooks/useVersionState';

export default function App() {
  const { state, actions } = useVersionState();

  useEffect(() => {
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrer: document.referrer }),
    }).catch(() => {});
  }, []);
  const isEditing = state.mode.type === 'editing';
  const showStagingOverlay = isEditing && state.hasUncommittedChanges;
  const isSideBySide = state.compareViewMode === 'side-by-side';

  return (
    <VersionContext.Provider value={{ state, actions }}>
      <div className="relative flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          {state.mode.type === 'comparing' && <CompareToolbar />}
          {showStagingOverlay && <StagingToolbar />}
          {state.mode.type === 'previewing' && <PreviewBanner />}
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-hidden">
              {state.mode.type === 'comparing' && isSideBySide ? (
                <CompareSideBySide />
              ) : showStagingOverlay && isSideBySide ? (
                <StagingSideBySide />
              ) : (
                <WorkflowCanvas />
              )}
            </main>
            {isEditing && state.editingNodeId && <EditPanel />}
            {showStagingOverlay && <StagingChangesList />}
          </div>
          <StatusBar />
        </div>
        <HistoryDropdown />
        <GuidedTour />
      </div>
    </VersionContext.Provider>
  );
}
