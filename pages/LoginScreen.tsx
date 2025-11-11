/**
 * @file LoginScreen.tsx
 * @description
 * This file defines the `LoginScreen` component, which is the first page most users will see.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { College } from '../types';

const LoginScreen: React.FC = () => {
    const { login, data, setProgramAndBatch } = useAppContext();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [college, setCollege] = useState<string>(data?.colleges[0]?.id || 'CUIET');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const selectedCollege = data?.colleges.find(c => c.id === college);
        if (!selectedCollege) {
            setError('Please select a valid college.');
            return;
        }

        const success = await login(username, password, selectedCollege);
        if (success) {
            navigate('/');
        } else {
            setError('Invalid username or password.');
        }
    };

    const handleDeveloperLoginShortcut = async () => {
        const devUser = data?.users.find(u => u.username === 'pc_ece');
        const devProgram = devUser ? data?.programs.find(p => p.id === devUser.programId) : undefined;
        const devCollege = data?.colleges.find(c => c.id === 'CUIET');

        if (devUser && devProgram && devUser.password && devCollege) {
            const success = await login(devUser.username, devUser.password, devCollege);
            if (success) {
                setProgramAndBatch(devProgram, '2025-2029');
                navigate('/');
            }
        } else {
            console.error("Developer shortcut failed: Could not find user 'pc_ece', their assigned program, or the college in the data.");
        }
    };

    if (!data) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <img src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411" alt="Logo" className="h-20 mx-auto mb-4 animate-pulse" />
                    <p className="text-xl font-semibold text-gray-700\">Loading Portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-100\">
            <div className="w-full max-w-md p-8">
                <div className="flex justify-center mb-8" onDoubleClick={handleDeveloperLoginShortcut}>
                     <img src="https://d1hbpr09pwz0sk.cloudfront.net/logo_url/chitkara-university-4c35e411" alt="Logo" className="h-20" />
                </div>
                <div className="bg-white p-8 rounded-xl shadow-2xl">
                    <h2 className="text-3xl font-bold text-center text-red-600 mb-6\">LOG IN</h2>
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="username\" className="text-sm font-bold text-gray-600 tracking-wide\">USERNAME</label>
                            <input
                                id="username\"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 mt-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="password-input\" className="text-sm font-bold text-gray-600 tracking-wide\">PASSWORD</label>
                            <input
                                id="password-input\"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 mt-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="college\" className="text-sm font-bold text-gray-600 tracking-wide\">COLLEGE</label>
                            <select
                                id="college\"
                                value={college}
                                onChange={(e) => setCollege(e.target.value)}
                                className="w-full px-4 py-2 mt-2 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                {data?.colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        {error && <p className="text-sm text-center text-red-600\">{error}</p>}
                        
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center bg-red-600 text-gray-100 p-3 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-red-700"
                            >
                                LOGIN
                            </button>
                        </div>
                    </form>
                     <div className="p-4 mt-6 text-sm text-gray-600 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-center\">Demo Logins (password: "password")</h4>
                      <ul className="mt-2 list-disc list-inside">
                        <li>Username: <strong>teacher_ece1</strong> (Teacher)</li>
                        <li>Username: <strong>pc_ece</strong> (PC)</li>
                        <li>Username: <strong>dept_cuiet</strong> (Dept, CUIET)</li>
                        <li>Username: <strong>dept_ccp</strong> (Dept, CCP)</li>
                        <li>Username: <strong>dept_cbs</strong> (Dept, CBS)</li>
                        <li>Username: <strong>university</strong></li>
                        <li>Username: <strong>admin</strong></li>
                      </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
