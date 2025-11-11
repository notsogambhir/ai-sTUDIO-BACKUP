/**
 * @file AdminSystemSettingsTab.tsx
 * @description
 * This component is the "System Settings" tab within the `AdminPanel`. It allows an
 * Administrator to configure system-wide default values that affect various calculations
 * and new items created throughout the application.
 *
 * For example, when a new course is created, it will use the default values set here
 * for its attainment targets and thresholds.
 *
 * What it does:
 * 1.  **Displays Default Settings**: It shows forms for settings like:
 *     - Default CO Attainment Target.
 *     - Default Attainment Level Thresholds.
 *     - Default weights for Direct vs. Indirect PO attainment.
 * 2.  **Uses a "Draft State"**: Like other management screens, it uses a "draft state".
 *     When the Admin changes a value, it's not saved immediately. The `SaveBar` appears,
 *     allowing the Admin to save all changes at once or cancel them.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { SystemSettings } from '../../types';
import SaveBar from '../SaveBar';

const AdminSystemSettingsTab: React.FC = () => {
    // Get the main app data and tools from the "magic backpack".
    const { data, setData } = useAppContext();
    
    // --- Draft State Management ---
    // `draftSettings` is the temporary copy of the settings we make changes to.
    const [draftSettings, setDraftSettings] = useState<SystemSettings>(data.settings);
    // `initialSettings` is the saved version, used for comparison.
    const [initialSettings, setInitialSettings] = useState<SystemSettings>(data.settings);

    // This `useEffect` hook ensures our component's state is up-to-date if the global data ever changes.
    useEffect(() => {
        setDraftSettings(data.settings);
        setInitialSettings(data.settings);
    }, [data.settings]);

    // `isDirty` checks if there are any unsaved changes.
    const isDirty = useMemo(() => JSON.stringify(draftSettings) !== JSON.stringify(initialSettings), [draftSettings, initialSettings]);

    // --- Handlers for Form Inputs ---
    // A generic handler for simple input fields.
    const handleInputChange = (field: 'defaultCoTarget', value: number) => {
        if (value >= 0 && value <= 100) {
            setDraftSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    // A specific handler for the nested "Attainment Levels" object.
    const handleLevelChange = (level: keyof SystemSettings['defaultAttainmentLevels'], value: number) => {
        if (value >= 0 && value <= 100) {
            setDraftSettings(prev => ({
                ...prev,
                defaultAttainmentLevels: { ...prev.defaultAttainmentLevels, [level]: value }
            }));
        }
    };

    // A handler for the "Weights" inputs, which ensures they always add up to 100.
    const handleWeightChange = (type: 'direct' | 'indirect', value: number) => {
        if (value < 0 || value > 100) return; // Basic validation.
        setDraftSettings(prev => ({
            ...prev,
            defaultWeights: {
                direct: type === 'direct' ? value : 100 - value,
                indirect: type === 'indirect' ? value : 100 - value,
            }
        }));
    };

    // --- Handlers for the SaveBar ---
    const handleSave = () => {
        // Update the main application data in the "magic backpack".
        setData(prev => ({ ...prev, settings: draftSettings }));
        // The draft is now the new "saved" state.
        setInitialSettings(draftSettings);
        alert('System settings saved successfully!');
    };

    const handleCancel = () => {
        // Discard all changes by resetting the draft to the initial state.
        setDraftSettings(initialSettings);
    };

    return (
        // `pb-20` adds padding at the bottom so the SaveBar doesn't cover content.
        <div className="space-y-8 pb-20">
            <h2 className="text-xl font-semibold text-gray-700">Default System Settings</h2>
            
            {/* Form section for Default CO Attainment Target */}
            <div className="space-y-4 max-w-lg p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-800">Default CO Attainment Target</h3>
                <div>
                    <label htmlFor="defaultCoTarget" className="block text-sm font-medium text-gray-700">Target (%)</label>
                    <input 
                        type="number"
                        id="defaultCoTarget"
                        value={draftSettings.defaultCoTarget}
                        onChange={e => handleInputChange('defaultCoTarget', Number(e.target.value))}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">The default percentage an individual student must achieve on a CO.</p>
                </div>
            </div>

            {/* Form section for Default Attainment Level Thresholds */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-800">Default Attainment Level Thresholds</h3>
                 <p className="mt-1 text-xs text-gray-500">The percentage of students that must meet the CO Target to achieve the following attainment levels.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="level3" className="block text-sm font-medium text-gray-700">Level 3 (&ge; X%)</label>
                        <input 
                            type="number"
                            id="level3"
                            value={draftSettings.defaultAttainmentLevels.level3}
                            onChange={e => handleLevelChange('level3', Number(e.target.value))}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="level2" className="block text-sm font-medium text-gray-700">Level 2 (&ge; Y%)</label>
                        <input 
                            type="number"
                            id="level2"
                            value={draftSettings.defaultAttainmentLevels.level2}
                            onChange={e => handleLevelChange('level2', Number(e.target.value))}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="level1" className="block text-sm font-medium text-gray-700">Level 1 (&ge; Z%)</label>
                        <input 
                            type="number"
                            id="level1"
                            value={draftSettings.defaultAttainmentLevels.level1}
                            onChange={e => handleLevelChange('level1', Number(e.target.value))}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>
            </div>

            {/* Form section for Default Direct/Indirect Weights */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-800">Default PO Attainment Weights</h3>
                <p className="mt-1 text-xs text-gray-500">The default weights for combining Direct and Indirect attainment data.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
                    <div>
                        <label htmlFor="directWeight" className="block text-sm font-medium text-gray-700">Direct Weight (%)</label>
                        <input 
                            type="number"
                            id="directWeight"
                            value={draftSettings.defaultWeights.direct}
                            onChange={e => handleWeightChange('direct', Number(e.target.value))}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="indirectWeight" className="block text-sm font-medium text-gray-700">Indirect Weight (%)</label>
                        <input 
                            type="number"
                            id="indirectWeight"
                            value={draftSettings.defaultWeights.indirect}
                            onChange={e => handleWeightChange('indirect', Number(e.target.value))}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>
            </div>
            
            {/* The SaveBar only appears if `isDirty` is true. */}
            <SaveBar isDirty={isDirty} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
};

export default AdminSystemSettingsTab;