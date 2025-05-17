'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ClipLoader } from 'react-spinners';
import { useTheme } from '@/app/theme-context';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string | null;
  order: number;
}

export function OnboardingForm() {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<OnboardingStep | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
  });
  const { brandColor } = useTheme();

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      const response = await fetch('/api/onboarding-steps');
      if (!response.ok) throw new Error('Failed to fetch steps');
      const data = await response.json();
      setSteps(data);
    } catch (error) {
      console.error('Error fetching steps:', error);
      toast.error('Failed to load onboarding steps');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/onboarding-steps';
      const method = editingStep ? 'PUT' : 'POST';
      const body = editingStep ? { ...formData, id: editingStep.id } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save step');

      toast.success(
        editingStep ? 'Step updated successfully' : 'Step created successfully'
      );
      setEditingStep(null);
      setFormData({
        title: '',
        description: '',
        order: steps.length + 1,
      });
      fetchSteps();
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error('Failed to save step');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this step?')) return;

    try {
      const response = await fetch('/api/onboarding-steps', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete step');

      toast.success('Step deleted successfully');
      fetchSteps();
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error('Failed to delete step');
    }
  };

  const handleEdit = (step: OnboardingStep) => {
    setEditingStep(step);
    setFormData({
      title: step.title,
      description: step.description || '',
      order: step.order,
    });
  };

  const handleAdd = () => {
    setEditingStep(null);
    setFormData({
      title: '',
      description: '',
      order: steps.length + 1,
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Order</label>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: parseInt(e.target.value),
                })
              }
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end space-x-2">
          {editingStep && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingStep(null);
                setFormData({
                  title: '',
                  description: '',
                  order: steps.length + 1,
                });
              }}
            >
              Cancel
            </Button>
          )}
          <Button type="submit">
            {editingStep ? 'Update Step' : 'Add Step'}
          </Button>
        </div>
      </form>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <ClipLoader color={brandColor} size={48} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {steps.map((step) => (
                  <tr key={step.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{step.order}</td>
                    <td className="px-4 py-3 text-sm">{step.title}</td>
                    <td className="px-4 py-3 text-sm">{step.description}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(step)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(step.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {steps.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-8">
                      No steps found. Add your first step above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 