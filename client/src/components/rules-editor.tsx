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
import { Checkbox } from './ui/checkbox';
import { Trash2, Plus, Edit2, Save, X } from 'lucide-react';

interface BusinessRule {
  name: string;
  rule_type: string;
  operator: string;
  threshold: any;
  action: string;
  priority: number;
  enabled: boolean;
  description: string;
}

export const useRulesEngine = () => {
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch rules from backend
  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rules');
      if (!response.ok) throw new Error('Failed to fetch rules');
      const data = await response.json();
      setRules(data.rules);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Add new rule
  const addRule = async (rule: BusinessRule) => {
    try {
      const response = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      if (!response.ok) throw new Error('Failed to add rule');
      await fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Update rule
  const updateRule = async (name: string, updates: Partial<BusinessRule>) => {
    try {
      const response = await fetch(`/api/rules/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update rule');
      await fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Delete rule
  const deleteRule = async (name: string) => {
    try {
      const response = await fetch(`/api/rules/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete rule');
      await fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Toggle rule enabled state
  const toggleRule = async (rule: BusinessRule) => {
    await updateRule(rule.name, { enabled: !rule.enabled });
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return {
    rules,
    loading,
    error,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    refetch: fetchRules,
  };
};

interface RuleEditorProps {
  onClose?: () => void;
}

export const RulesEditor: React.FC<RuleEditorProps> = ({ onClose }) => {
  const { rules, loading, error, addRule, updateRule, deleteRule, toggleRule } =
    useRulesEngine();
  const [editingRule, setEditingRule] = useState<BusinessRule | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleSaveRule = async (rule: BusinessRule) => {
    if (editingRule) {
      await updateRule(editingRule.name, rule);
      setEditingRule(null);
    } else {
      await addRule(rule);
      setIsAddingNew(false);
    }
  };

  const operators = ['gt', 'lt', 'eq', 'gte', 'lte', 'in'];
  const ruleTypes = [
    'credit_score_min',
    'amount_vs_preapproved',
    'emi_income_ratio',
    'age_restriction',
    'employment_type',
    'existing_loan_check',
  ];
  const actions = ['APPROVE', 'REJECT'];

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Rules Engine</h2>
        <Button onClick={() => setIsAddingNew(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && <div className="text-center py-8">Loading rules...</div>}

      {/* Add/Edit Form */}
      {(isAddingNew || editingRule) && (
        <RuleForm
          rule={editingRule || undefined}
          operators={operators}
          ruleTypes={ruleTypes}
          actions={actions}
          onSave={handleSaveRule}
          onCancel={() => {
            setEditingRule(null);
            setIsAddingNew(false);
          }}
        />
      )}

      {/* Rules List */}
      <div className="space-y-2">
        {rules.map((rule) => (
          <Card key={rule.name} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule)}
                    aria-label={`Toggle ${rule.name}`}
                  />
                  <div>
                    <h3 className={`font-semibold ${!rule.enabled ? 'opacity-50' : ''}`}>
                      {rule.name}
                    </h3>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Type: {rule.rule_type} | Operator: {rule.operator} | Threshold:{' '}
                      {rule.threshold} | Action: {rule.action} | Priority: {rule.priority}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingRule(rule)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteRule(rule.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {onClose && (
        <Button onClick={onClose} variant="outline" className="w-full">
          Close
        </Button>
      )}
    </div>
  );
};

interface RuleFormProps {
  rule?: BusinessRule;
  operators: string[];
  ruleTypes: string[];
  actions: string[];
  onSave: (rule: BusinessRule) => void;
  onCancel: () => void;
}

const RuleForm: React.FC<RuleFormProps> = ({
  rule,
  operators,
  ruleTypes,
  actions,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<BusinessRule>(
    rule || {
      name: '',
      rule_type: ruleTypes[0],
      operator: operators[0],
      threshold: '',
      action: actions[0],
      priority: 100,
      enabled: true,
      description: '',
    }
  );

  const handleChange = (field: keyof BusinessRule, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a rule name');
      return;
    }
    onSave(formData);
  };

  return (
    <Card className="p-6 bg-blue-50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Min Credit Score"
            />
          </div>

          <div>
            <Label htmlFor="rule_type">Rule Type</Label>
            <Select value={formData.rule_type} onValueChange={(v) => handleChange('rule_type', v)}>
              <SelectTrigger id="rule_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ruleTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="operator">Operator</Label>
            <Select value={formData.operator} onValueChange={(v) => handleChange('operator', v)}>
              <SelectTrigger id="operator">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map((op) => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="threshold">Threshold Value</Label>
            <Input
              id="threshold"
              value={formData.threshold}
              onChange={(e) => handleChange('threshold', e.target.value)}
              placeholder="e.g., 700"
            />
          </div>

          <div>
            <Label htmlFor="action">Action</Label>
            <Select value={formData.action} onValueChange={(v) => handleChange('action', v)}>
              <SelectTrigger id="action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority (Higher = Evaluated First)</Label>
            <Input
              id="priority"
              type="number"
              value={formData.priority}
              onChange={(e) => handleChange('priority', parseInt(e.target.value))}
              placeholder="100"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What does this rule do?"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Rule
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RulesEditor;
