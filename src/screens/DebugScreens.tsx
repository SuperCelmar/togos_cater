import React from 'react';
import { NavContextType } from '../../types';
import { ConnectionTester } from '../components/Debug/ConnectionTester';

export const DebugScreen: React.FC<{ nav: NavContextType }> = ({ nav }) => {
  return (
    <div className="relative flex flex-col h-screen w-full bg-gray-100 dark:bg-black overflow-hidden font-display">
       <div className="flex items-center p-4 bg-white dark:bg-zinc-900 shadow-sm z-10">
            <button onClick={() => nav.goBack()} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-[#181111] dark:text-white">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex-1 text-center pr-10">
                <p className="font-bold text-lg text-slate-900 dark:text-white">System Diagnostics</p>
            </div>
       </div>
       <div className="flex-1 overflow-y-auto">
          <ConnectionTester />
       </div>
    </div>
  );
};
