import { Sidebar } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';
import { StatusBar } from '@/components/shell/StatusBar';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { DiffToolbar } from '@/components/diff/DiffToolbar';
import { DetailPanel } from '@/components/diff/DetailPanel';
import { ChangesList } from '@/components/diff/ChangesList';
import { SideBySideView } from '@/components/diff/SideBySideView';
import { DiffContext } from '@/hooks/DiffContext';
import { useDiffState } from '@/hooks/useDiffState';

export default function App() {
  const { state, actions } = useDiffState();
  const showSideBySide = state.enabled && state.viewMode === 'side-by-side';

  return (
    <DiffContext.Provider value={{ state, actions }}>
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onReviewChanges={actions.enableDiff} diffEnabled={state.enabled} />
          <DiffToolbar />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-hidden">
              {showSideBySide ? <SideBySideView /> : <WorkflowCanvas />}
            </main>
            {!showSideBySide && <DetailPanel />}
            {state.enabled && <ChangesList />}
          </div>
          <StatusBar />
        </div>
      </div>
    </DiffContext.Provider>
  );
}
