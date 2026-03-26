import { Sidebar } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';
import { StatusBar } from '@/components/shell/StatusBar';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';

export default function App() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          <WorkflowCanvas />
        </main>
        <StatusBar />
      </div>
    </div>
  );
}
