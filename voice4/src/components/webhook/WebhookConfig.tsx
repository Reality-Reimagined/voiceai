import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { API_URL } from '../../config';
import { useAuth } from '../auth/AuthProvider';
import toast from 'react-hot-toast';

interface WebhookFormData {
  url: string;
  events: string[];
}

const AVAILABLE_EVENTS = [
  'tts.completed',
  'tts.failed',
  'speech.edited',
  'speech.edit_failed',
  'voice.cloned',
  'voice.clone_failed',
];

export function WebhookConfig() {
  const [formData, setFormData] = useState<WebhookFormData>({
    url: '',
    events: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({
          url: formData.url,
          events: formData.events,
          is_active: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to configure webhook');

      toast.success('Webhook configured successfully');
    } catch (error) {
      toast.error('Failed to configure webhook');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    setIsLoading(true);
    setTestResult(undefined);

    try {
      const response = await fetch(`${API_URL}/api/webhooks/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.id}`,
        },
        body: JSON.stringify({ url: formData.url }),
      });

      if (!response.ok) throw new Error('Webhook test failed');

      const data = await response.json();
      setTestResult('Webhook test successful');
      toast.success('Webhook test completed');
    } catch (error) {
      setTestResult('Webhook test failed');
      toast.error('Webhook test failed');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEvent = (event: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Webhook Configuration</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Webhook URL"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
            placeholder="https://your-webhook-url.com"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Events
            </label>
            <div className="space-y-2">
              {AVAILABLE_EVENTS.map((event) => (
                <label key={event} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <Button type="submit" isLoading={isLoading}>
              Save Configuration
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleTestWebhook}
              disabled={!formData.url || isLoading}
            >
              Test Webhook
            </Button>
          </div>

          {testResult && (
            <div
              className={`mt-4 p-4 rounded-md ${
                testResult.includes('successful')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {testResult}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}