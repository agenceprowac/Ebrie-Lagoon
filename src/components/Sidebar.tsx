"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            const storedRoles = localStorage.getItem('ebrie_roles');
            
            const defaultRoles = [
                { id: 'admin', name: 'Administrateur', permissions: ['tableau_de_bord', 'reservations', 'finances', 'paiements', 'flotte', 'incidents', 'partenaires', 'clients', 'parametres'], isSystem: true },
                { id: 'commercial', name: 'Commercial / Vente', permissions: ['tableau_de_bord', 'reservations', 'finances', 'paiements', 'clients', 'partenaires'], isSystem: false },
                { id: 'pilote', name: 'Pilote / Staff Technique', permissions: ['tableau_de_bord', 'flotte', 'incidents'], isSystem: false },
            ];
            
            const roles = storedRoles ? JSON.parse(storedRoles) : defaultRoles;
            
            // Essayer de trouver par roleId, sinon par l'ancien nom de rôle (pour la compatibilité)
            let role = roles.find((r: any) => r.id === user.roleId);
            
            if (!role && user.role === 'Administrateur') {
                role = roles.find((r: any) => r.id === 'admin');
            } else if (!role && user.role) {
                // Fallback générique si l'ancien rôle était 'Pilote / Staff' par exemple
                role = roles.find((r: any) => r.name === user.role);
            }
            
            // Si aucun rôle n'est trouvé, on donne au moins le tableau de bord
            if (role && role.permissions) {
                // Auto-patch pour le nouveau module paiements (si l'utilisateur est admin ou commercial mais n'a pas encore la permission)
                let finalPermissions = [...role.permissions];
                if ((role.id === 'admin' || role.id === 'commercial') && !finalPermissions.includes('paiements')) {
                    finalPermissions.push('paiements');
                }
                setPermissions(finalPermissions);
            } else {
                // Fallback sécurité si bug de session
                setPermissions(['tableau_de_bord']);
            }
        } else {
            // Default permissions if no user is found
            setPermissions(['tableau_de_bord']);
        }
    }, []);

    const handleLogout = async () => {
        localStorage.removeItem('isAuthenticated');
        window.dispatchEvent(new Event('authChange'));
        router.push('/login');
    };

    const navItems = [
        { id: 'tableau_de_bord', href: '/', icon: 'fa-chart-pie', label: 'Tableau de bord', group: 'Principal' },
        { id: 'reservations', href: '/reservations', icon: 'fa-calendar-check', label: 'Réservations', group: 'Principal' },
        { id: 'finances', href: '/finances', icon: 'fa-file-invoice-dollar', label: 'Finances & Devis', group: 'Principal' },
        { id: 'paiements', href: '/paiements', icon: 'fa-wallet', label: 'Paiements', group: 'Principal' },
        { id: 'flotte', href: '/flotte', icon: 'fa-ship', label: 'Flotte & Opérations', group: 'Principal' },
        { id: 'incidents', href: '/incidents', icon: 'fa-triangle-exclamation', label: 'Incidents', group: 'Principal' },
        { id: 'partenaires', href: '/partenaires', icon: 'fa-handshake', label: 'Partenaires', group: 'Principal' },
        { id: 'clients', href: '/clients', icon: 'fa-users', label: 'Clients', group: 'Administration' },
        { id: 'parametres', href: '/parametres', icon: 'fa-gear', label: 'Paramètres', group: 'Administration' },
    ];

    const renderNavItems = (groupName: string) => {
        const filteredItems = navItems.filter(item => item.group === groupName && permissions.includes(item.id));
        
        if (filteredItems.length === 0) return null;

        return filteredItems.map((item) => {
            const isActive = pathname === item.href;
                return (
                    <Link 
                        key={item.href} 
                        href={item.href} 
                        className={`sidebar-item flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md transform scale-[1.02]' 
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                    >
                        <i className={`fa-solid ${item.icon} w-6 ${isActive ? 'text-white' : 'text-gray-400'}`}></i> 
                        {item.label}
                    </Link>
                );
            });
    };

    return (
        <>
            {/* Overlay mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            
            <aside className={`w-64 bg-white/95 backdrop-blur-xl border-r border-gray-100 shadow-xl flex flex-col z-50 fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0`}>
                <button 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="absolute right-4 top-4 md:hidden text-gray-400 hover:text-red-500 transition-colors z-50 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                >
                    <i className="fa-solid fa-times text-sm"></i>
                </button>
                
                <div className="p-6 flex items-center justify-center border-b border-gray-100/50">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 mr-3">
                        <i className="fa-solid fa-water"></i>
                    </div>
                    <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 tracking-tight">
                        Ebrié Lagoon
                    </h1>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                    <div className="px-2 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Principal</div>
                    {renderNavItems('Principal')}

                    <div className="px-2 mt-8 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Administration</div>
                    {renderNavItems('Administration')}
                </nav>
                
                <div className="p-4 border-t border-gray-100/50 bg-gray-50/50">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                    >
                        <i className="fa-solid fa-sign-out-alt w-6 text-gray-400 group-hover:text-red-500 transition-colors"></i> 
                        Déconnexion
                    </button>
                </div>
            </aside>
        </>
    );
}
