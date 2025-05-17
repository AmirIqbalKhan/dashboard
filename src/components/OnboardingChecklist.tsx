'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingStep {
  id: string;
  title: string;
  description: string | null;
  order: number;
  completed: boolean;
  completedAt: string | null;
}

export default function OnboardingChecklist() {
  const { data: session } = useSession();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      const response = await fetch('/api/users/me/onboarding');
      if (!response.ok) throw new Error('Failed to fetch steps');
      const data = await response.json();
      setSteps(data);
      updateProgress(data);
    } catch (error) {
      console.error('Error fetching steps:', error);
      toast.error('Failed to load onboarding steps');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = (steps: OnboardingStep[]) => {
    const completed = steps.filter((step) => step.completed).length;
    const percentage = (completed / steps.length) * 100;
    setProgress(percentage);
  };

  const handleStepComplete = async (stepId: string, completed: boolean) => {
    try {
      const response = await fetch('/api/users/me/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId }),
      });

      if (!response.ok) throw new Error('Failed to update step');

      // Update local state
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                completed: !step.completed,
                completedAt: step.completed ? null : new Date().toISOString(),
              }
            : step
        )
      );

      // Update progress
      const updatedSteps = steps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              completed: !step.completed,
              completedAt: step.completed ? null : new Date().toISOString(),
            }
          : step
      );
      updateProgress(updatedSteps);

      toast.success(
        completed ? 'Step marked as incomplete' : 'Step completed!'
      );
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (steps.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Onboarding Checklist</span>
          <span className="text-sm font-normal text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </CardTitle>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start space-x-3 p-3 rounded-lg border"
            >
              <Checkbox
                checked={step.completed}
                onCheckedChange={(checked) =>
                  handleStepComplete(step.id, checked as boolean)
                }
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{step.title}</h3>
                  {step.completed && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
                {step.completedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed on{' '}
                    {new Date(step.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 