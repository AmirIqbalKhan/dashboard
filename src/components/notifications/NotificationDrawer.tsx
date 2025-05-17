'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { X, Send } from 'lucide-react';
import { createPortal } from 'react-dom';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationCreated?: () => void;
}

export function NotificationDrawer({ isOpen, onClose, onNotificationCreated }: NotificationDrawerProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, message }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create notification');
      }

      const result = await response.json();
      toast.success(result.message || 'Notification created successfully');
      setTitle('');
      setMessage('');
      onClose();
      onNotificationCreated?.();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create notification');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return typeof window !== 'undefined' && document.body ? createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]">
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-[101]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Notification</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              required
              className="w-full min-h-[100px]"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Send className="w-5 h-5 mr-2" />
                Send Notification
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
} 