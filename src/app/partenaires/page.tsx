"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';

export default function PartenairesPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (activeTab === 'all') {
            setActiveTab('users');
        }
    }, []);

    return (
        <div className="flex h-screen overflow-hidden text-gray-800 bg-slate-50 font-sans">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
                <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition">
                                <i className="fa-solid fa-bars text-xl"></i>
                            </button>
                            <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-72 md:w-96 focus-within:ring-2 focus-within:ring-blue-400 transition">
                                <i className="fa-solid fa-search text-gray-400"></i>
                                <input type="text" placeholder="Rechercher un partenaire (Hôtel, Agence)..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
                                <i className="fa-solid fa-bell text-xl"></i>
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <div className="flex items-center space-x-3 border-l pl-4 border-gray-200 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                                <img src="https://ui-avatars.com/api/?name=Lionel+Vithiano&background=0D8ABC&color=fff" alt="User" className="w-9 h-9 rounded-full shadow-sm" />
                                <div className="hidden md:block text-sm">
                                    <p className="font-semibold text-gray-700">M. Lionel Vithiano</p>
                                    <p className="text-xs text-gray-500">Administrateur</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-8 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Réseau de Partenaires</h2>
                            <p className="text-sm text-gray-500 mt-1">Gérez vos collaborations (hôtels, traiteurs, agences de voyage)</p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5 text-sm font-medium flex items-center">
                            <i className="fa-solid fa-plus mr-2"></i> Nouveau Partenaire
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                            <p className="text-gray-500">Aucun partenaire enregistré pour le moment.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
