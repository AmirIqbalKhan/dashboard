'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/app/theme-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function SettingsForm() {
  const [theme, setTheme] = useState("light");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [orgName, setOrgName] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState("#000000");
  const [saving, setSaving] = useState(false);
  const { setTheme: setThemeContext, setBrandColor: setBrandColorContext } = useTheme();

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setApiKey(data.apiKey || "");
        setWebhookUrl(data.webhookUrl || "");
        setOrgName(data.orgName || "");
        setLogo(data.logo || null);
        setTheme(data.theme || "light");
        setBrandColor(data.brandColor || "#000000");
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          apiKey, 
          webhookUrl,
          orgName,
          logo,
          theme,
          brandColor
        }),
      });
      if (res.ok) {
        toast.success("Settings saved successfully!");
        setThemeContext(theme as "light" | "dark");
        setBrandColorContext(brandColor);
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
        </div>
        <div>
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input
            id="webhookUrl"
            type="text"
            value={webhookUrl}
            onChange={e => setWebhookUrl(e.target.value)}
            placeholder="https://yourdomain.com/webhook"
          />
        </div>
        <div>
          <Label htmlFor="orgName">Organization Name</Label>
          <Input
            id="orgName"
            type="text"
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            placeholder="Your Organization"
          />
        </div>
        <div>
          <Label htmlFor="logo">Logo</Label>
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = ev => setLogo(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
          {logo && <img src={logo} alt="Logo Preview" className="mt-2 h-16" />}
        </div>
        <div>
          <Label htmlFor="theme">Theme</Label>
          <select
            id="theme"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            value={theme}
            onChange={e => setTheme(e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <Label htmlFor="brandColor">Brand Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="brandColor"
              type="color"
              className="w-12 h-8 p-0 border-0"
              value={brandColor}
              onChange={e => setBrandColor(e.target.value)}
            />
            <span className="text-sm text-gray-500">{brandColor}</span>
          </div>
        </div>
      </div>
      <Button 
        type="submit" 
        disabled={saving}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg"
      >
        {saving ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Saving...
          </div>
        ) : (
          "Save Settings"
        )}
      </Button>
    </form>
  );
} 