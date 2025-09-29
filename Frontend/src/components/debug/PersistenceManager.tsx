import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, RefreshCw, Database } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { resetToInitialState } from '@/store/chatSlice';
import { 
  purgePersistedState, 
  flushPersist, 
  isRehydrated, 
  getPersistState,
  getPersistedDataSize,
  exportPersistedData 
} from '@/utils/persistence';

const PersistenceManager = () => {
  const dispatch = useAppDispatch();
  const [isRehydratedState, setIsRehydratedState] = useState(false);
  const [persistState, setPersistState] = useState<any>(null);
  const [dataSize, setDataSize] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Check rehydration status
    setIsRehydratedState(isRehydrated());
    setPersistState(getPersistState());
    setDataSize(getPersistedDataSize());
  }, []);

  const handlePurgeData = async () => {
    if (window.confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
      try {
        await purgePersistedState();
        dispatch(resetToInitialState());
        alert('All stored data has been cleared successfully.');
        setDataSize(getPersistedDataSize());
      } catch (error) {
        console.error('Error clearing stored data:', error);
        alert('Error clearing stored data. Please try again.');
      }
    }
  };

  const handleFlushPersist = async () => {
    try {
      await flushPersist();
      alert('All pending data has been saved successfully.');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  const handleExportData = () => {
    const data = exportPersistedData();
    if (data) {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-interviewer-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert('No persisted data found to export.');
    }
  };

  const handleRefresh = () => {
    setIsRehydratedState(isRehydrated());
    setPersistState(getPersistState());
    setDataSize(getPersistedDataSize());
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = Object.values(dataSize).reduce((sum, size) => sum + size, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Persistence Manager
              </CardTitle>
              <CardDescription>
                Manage your application state and localStorage data
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Rehydration Status</span>
              <Badge variant={isRehydratedState ? "default" : "secondary"}>
                {isRehydratedState ? 'Complete' : 'Pending'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Persist State</span>
              <Badge variant={persistState?.bootstrapped ? "default" : "secondary"}>
                {persistState?.bootstrapped ? 'Bootstrapped' : 'Not Ready'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Storage Size</span>
              <span className="text-sm font-bold">{formatBytes(totalSize)}</span>
            </div>
          </div>

          {/* Storage Details */}
          {Object.keys(dataSize).length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Storage Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(dataSize).map(([key, size]) => (
                  <div key={key} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{key}</span>
                    <span className="text-sm font-medium">{formatBytes(size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleFlushPersist} variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Save All Data
            </Button>
            <Button onClick={handleExportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={handlePurgeData} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>

          {/* Debug Information */}
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Debug Information
            </summary>
            <pre className="mt-3 text-xs text-gray-600 overflow-x-auto">
              {JSON.stringify({ isRehydratedState, persistState, dataSize }, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersistenceManager;