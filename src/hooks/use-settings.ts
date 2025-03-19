import { useState, useEffect } from 'react';

interface Settings {
  theme: 'light' | 'dark';
  colorMode: 'default' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'highContrast';
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    colorMode: 'default',
  });

  useEffect(() => {
    // Hent innstillinger fra localStorage eller API
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('settings', JSON.stringify(updatedSettings));
  };

  return { settings, updateSettings };
} 