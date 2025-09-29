import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CandidatesDashboard from '@/components/dashboard/CandidatesDashboard';
import PersistenceManager from '@/components/debug/PersistenceManager';

const InterviewerView = () => {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Candidates Dashboard</TabsTrigger>
          <TabsTrigger value="persistence">Persistence Manager</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <CandidatesDashboard />
        </TabsContent>
        <TabsContent value="persistence" className="mt-6">
          <PersistenceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewerView;