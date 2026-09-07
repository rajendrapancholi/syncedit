'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Cookie,
  Info,
  Save,
  Bell,
  BarChart3,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';

const CookieSettings = () => {
  const [settings, setSettings] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    personalization: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    if (key === 'essential') return;
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    console.log('Settings Saved:', settings);
    alert('Preferences updated successfully!');
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6 transition-colors duration-500">
      <div className="container mx-auto max-w-3xl">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Cookie size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Cookie Preferences
            </h1>
            <p className="text-muted-foreground text-sm">
              Control how Raje uses data to improve your collaborative
              experience.
            </p>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="p-6 rounded-2xl bg-muted/50 border border-border mb-10 flex gap-4">
          <Info className="text-primary shrink-0" size={20} />
          <p className="text-sm leading-relaxed text-muted-foreground">
            We use cookies to ensure our platform is fast, secure, and reliable.
            Some are essential for the editor to function, while others help us
            understand how you use the tool. Read our
            <Link href="/privacy" className="text-primary hover:underline ml-1">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* SETTINGS LIST */}
        <div className="space-y-4">
          <PreferenceItem
            icon={<ShieldCheck size={20} />}
            title="Strictly Essential"
            description="Required for authentication, security, and real-time syncing. Cannot be turned off."
            enabled={settings.essential}
            disabled={true}
            onToggle={() => {}}
          />
          <PreferenceItem
            icon={<BarChart3 size={20} />}
            title="Analytics & Performance"
            description="Helps us measure site traffic and find bugs in the editor before they reach you."
            enabled={settings.analytics}
            onToggle={() => toggleSetting('analytics')}
          />
          <PreferenceItem
            icon={<Settings2 size={20} />}
            title="Personalization"
            description="Remembers your editor theme, keybindings, and layout preferences."
            enabled={settings.personalization}
            onToggle={() => toggleSetting('personalization')}
          />
          <PreferenceItem
            icon={<Bell size={20} />}
            title="Marketing & Social"
            description="Used to deliver relevant news and updates about new features."
            enabled={settings.marketing}
            onToggle={() => toggleSetting('marketing')}
          />
        </div>

        {/* ACTIONS */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Changes will take effect immediately across all your active
            sessions.
          </p>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <Save size={18} />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

/* SUB-COMPONENT FOR REUSE */
const PreferenceItem = ({
  icon,
  title,
  description,
  enabled,
  onToggle,
  disabled = false,
}: any) => {
  return (
    <div
      className={`p-6 rounded-2xl border transition-all ${enabled ? 'bg-card border-border' : 'bg-muted/20 border-transparent opacity-70'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div
            className={`mt-1 p-2 rounded-lg ${enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={onToggle}
          disabled={disabled}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ring-offset-background focus:ring-2 focus:ring-primary/50 ${
            enabled ? 'bg-primary' : 'bg-muted border border-border'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default CookieSettings;
