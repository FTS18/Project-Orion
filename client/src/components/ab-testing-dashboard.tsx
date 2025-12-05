import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Play, Stop, Download, Plus, TrendingUp } from 'lucide-react';

interface TestVariant {
  name: string;
  description: string;
  total_requests: number;
  approvals: number;
  rejections: number;
  conversion_rate: number;
  avg_response_time: number;
  avg_satisfaction_score: number;
  config: Record<string, any>;
}

interface TestResult {
  test_id: string;
  name: string;
  status: string;
  created_at: string;
  variants: TestVariant[];
  winner?: string;
  winner_conversion?: number;
}

export const useABTests = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tests
  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tests');
      if (!response.ok) throw new Error('Failed to fetch tests');
      const data = await response.json();
      setTests(data.tests);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Create new test
  const createTest = async (testConfig: any) => {
    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testConfig),
      });
      if (!response.ok) throw new Error('Failed to create test');
      await fetchTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Stop test
  const stopTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      });
      if (!response.ok) throw new Error('Failed to stop test');
      await fetchTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Export results
  const exportResults = async (testId: string) => {
    try {
      const response = await fetch(`/api/tests/${testId}/export`);
      if (!response.ok) throw new Error('Failed to export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-${testId}-results.json`;
      a.click();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchTests();
    const interval = setInterval(fetchTests, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    tests,
    loading,
    error,
    createTest,
    stopTest,
    exportResults,
    refetch: fetchTests,
  };
};

export const ABTestingDashboard: React.FC = () => {
  const { tests, loading, error, createTest, stopTest, exportResults } = useABTests();
  const [showNewTest, setShowNewTest] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  if (loading && tests.length === 0) {
    return <div className="text-center py-8">Loading tests...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">A/B Testing Dashboard</h1>
        <Button onClick={() => setShowNewTest(!showNewTest)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          New Test
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showNewTest && (
        <NewTestForm
          onCreate={async (config) => {
            await createTest(config);
            setShowNewTest(false);
          }}
          onCancel={() => setShowNewTest(false)}
        />
      )}

      {/* Tests List */}
      <div className="space-y-4">
        {tests.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No tests yet. Create one to get started!
          </Card>
        ) : (
          tests.map((test) => (
            <TestCard
              key={test.test_id}
              test={test}
              isSelected={selectedTest?.test_id === test.test_id}
              onSelect={() => setSelectedTest(selectedTest?.test_id === test.test_id ? null : test)}
              onStop={() => stopTest(test.test_id)}
              onExport={() => exportResults(test.test_id)}
            />
          ))
        )}
      </div>

      {/* Detailed View */}
      {selectedTest && <TestDetailedView test={selectedTest} />}
    </div>
  );
};

interface TestCardProps {
  test: TestResult;
  isSelected: boolean;
  onSelect: () => void;
  onStop: () => void;
  onExport: () => void;
}

const TestCard: React.FC<TestCardProps> = ({
  test,
  isSelected,
  onSelect,
  onStop,
  onExport,
}) => {
  const statusColors = {
    running: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    paused: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <Card
      className={`p-6 cursor-pointer transition ${
        isSelected ? 'border-2 border-blue-500 bg-blue-50' : 'hover:shadow-lg'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-bold">{test.name}</h2>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                statusColors[test.status as keyof typeof statusColors]
              }`}
            >
              {test.status.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 mb-2">{test.name}</p>
          <p className="text-sm text-gray-500">
            Created: {new Date(test.created_at).toLocaleDateString()}
          </p>
        </div>

        {test.winner && (
          <div className="text-right bg-green-50 p-3 rounded">
            <div className="text-sm text-gray-600">Winner</div>
            <div className="font-bold text-green-700">{test.winner}</div>
            <div className="text-xs text-gray-600">
              {test.winner_conversion?.toFixed(1)}% conversion
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {test.variants.map((variant) => (
          <div key={variant.name} className="bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-600 font-semibold">{variant.name}</div>
            <div className="text-lg font-bold text-blue-600">
              {variant.conversion_rate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {variant.approvals}/{variant.total_requests} approved
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {test.status === 'running' && (
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onStop();
            }}
          >
            <Stop className="w-4 h-4 mr-2" />
            Stop Test
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </Card>
  );
};

interface TestDetailedViewProps {
  test: TestResult;
}

const TestDetailedView: React.FC<TestDetailedViewProps> = ({ test }) => {
  const chartData = test.variants.map((v) => ({
    name: v.name,
    'Conversion Rate': v.conversion_rate * 100,
    'Satisfaction': v.avg_satisfaction_score,
    'Response Time (ms)': v.avg_response_time * 1000,
  }));

  const approvalData = test.variants.map((v) => ({
    name: v.name,
    Approved: v.approvals,
    Rejected: v.rejections,
  }));

  return (
    <Card className="p-6 mt-6">
      <h3 className="text-xl font-bold mb-6">Detailed Analysis: {test.name}</h3>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Conversion Rate Chart */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Conversion Rates
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Conversion Rate" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Approval vs Rejection */}
        <div>
          <h4 className="font-semibold mb-4">Approval Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={approvalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Approved" fill="#10b981" />
              <Bar dataKey="Rejected" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="font-semibold mb-4">Performance Metrics</h4>
          <div className="space-y-3">
            {test.variants.map((v) => (
              <div key={v.name} className="border rounded p-3">
                <div className="font-semibold mb-2">{v.name}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Total Requests:</span>
                    <div className="font-semibold">{v.total_requests}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Response Time:</span>
                    <div className="font-semibold">{v.avg_response_time.toFixed(2)}s</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Satisfaction Score:</span>
                    <div className="font-semibold">{v.avg_satisfaction_score.toFixed(2)}/5</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Approval Rate:</span>
                    <div className="font-semibold">{(v.conversion_rate * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Variant Configs */}
        <div>
          <h4 className="font-semibold mb-4">Variant Configurations</h4>
          <div className="space-y-3">
            {test.variants.map((v) => (
              <div key={v.name} className="border rounded p-3 bg-gray-50">
                <div className="font-semibold text-sm mb-2">{v.name}</div>
                <pre className="text-xs overflow-auto bg-white p-2 rounded border">
                  {JSON.stringify(v.config, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

interface NewTestFormProps {
  onCreate: (config: any) => void;
  onCancel: () => void;
}

const NewTestForm: React.FC<NewTestFormProps> = ({ onCreate, onCancel }) => {
  const [formData, setFormData] = useState({
    test_id: '',
    name: '',
    description: '',
    hypothesis: '',
    template: 'strategy',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.test_id || !formData.name) {
      alert('Please fill in all required fields');
      return;
    }
    onCreate(formData);
  };

  return (
    <Card className="p-6 bg-blue-50">
      <h3 className="text-lg font-bold mb-4">Create New Test</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="test_id">Test ID</Label>
            <Input
              id="test_id"
              value={formData.test_id}
              onChange={(e) => setFormData({ ...formData, test_id: e.target.value })}
              placeholder="e.g., test_001"
              required
            />
          </div>

          <div>
            <Label htmlFor="template">Template</Label>
            <Select
              value={formData.template}
              onValueChange={(v) => setFormData({ ...formData, template: v })}
            >
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strategy">Strategy Comparison</SelectItem>
                <SelectItem value="communication">Communication Style</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="name">Test Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Conservative vs Aggressive"
              required
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this test about?"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="hypothesis">Hypothesis</Label>
            <Input
              id="hypothesis"
              value={formData.hypothesis}
              onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
              placeholder="What do you expect to happen?"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            Start Test
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ABTestingDashboard;
