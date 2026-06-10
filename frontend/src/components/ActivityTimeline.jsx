import ActivityToolbar from './ActivityToolbar';
import ActivityLogCard from './ActivityLogCard';
import { activityData } from '@/data/activityData';

export default function ActivityTimeline() {
  return (
    <section className="flex flex-col h-full">
      <div className="px-6 pt-6">
        <ActivityToolbar />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-20 space-y-2">
        {activityData.map((log, index) => (
          <ActivityLogCard key={log.id} log={log} isFirst={index === 0} />
        ))}
        {/* Fill lower space */}
        <div className="h-6"></div>
      </div>
    </section>
  );
}
