/**
 * @file AdminSystemSettingsTab.tsx
 * @description
 * This component is the "System Settings" tab within the `AdminPanel`.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { SystemSettings } from '../../types';
import SaveBar from '../SaveBar';
import apiClient from '../../api';

const AdminSystemSettingsTab: React.FC = () => {
    const { data, fetchAppData } = useAppContext();
    
    const [draftSettings, setDraftSettings] = useState<SystemSettings | null>(data?.settings || null);
    const [initialSettings, setInitialSettings] = useState<SystemSettings | null>(data?.settings || null);

    useEffect(() => {
        setDraftSettings(data?.settings || null);
        setInitialSettings(data?.settings || null);
    }, [data?.settings]);

    const isDirty = useMemo(() => JSON.stringify(draftSettings) !== JSON.stringify(initialSettings), [draftSettings, initialSettings]);

    const handleInputChange = (field: keyof SystemSettings, value: number) => {
        setDraftSettings(prev => (prev ? { ...prev, [field]: value } : null));
    };

    const handleLevelChange = (level: keyof SystemSettings['defaultAttainmentLevels'], value: number) => {
        setDraftSettings(prev => (prev ? {
            ...prev,
            defaultAttainmentLevels: { ...prev.defaultAttainmentLevels, [level]: value }
        } : null));
    };

    const handleWeightChange = (type: 'direct' | 'indirect', value: number) => {
        if (value < 0 || value > 100) return;
        setDraftSettings(prev => (prev ? {
            ...prev,
            defaultWeights: {
                direct: type === 'direct' ? value : 100 - value,
                indirect: type === 'indirect' ? value : 100 - value,
            }
        } : null));
    };

    const handleSave = async () => {
        if (!draftSettings) return;
        try {
            await apiClient.patch(`/system-settings/${draftSettings.id}/`, draftSettings);
            await fetchAppData();
            setInitialSettings(draftSettings);
            alert('System settings saved successfully!');
        } catch (error) {
            console.error('Failed to save system settings:', error);
            alert('Failed to save settings. Please try again.');
        }
    };

    const handleCancel = () => {
        setDraftSettings(initialSettings);
    };

    if (!draftSettings) {
        return <div>Loading settings...</div>;
    }

    return (
        <div className="space-y-8 pb-20">
            <h2 className="text-xl font-semibold text-gray-700\">Default System Settings</h2>
            
            <div className="space-y-4 max-w-lg">
              {/* ... */}
            </div>

            <div className="space-y-4">
              {/* ... */}
            </div>

            <div className="space-y-4">
              {/* ... */}
            </div>

            <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
};

export default AdminSystemSettingsTab;
