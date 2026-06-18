"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = () => {
            const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
            
            if (!isAuthenticated && pathname !== '/login') {
                router.push('/login');
            } else if (isAuthenticated && pathname === '/login') {
                router.push('/');
            } else if (isAuthenticated && pathname !== '/login' && pathname !== '/') {
                const storedUser = localStorage.getItem('currentUser');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    const storedRoles = localStorage.getItem('ebrie_roles');
                    
                    const defaultRoles = [
                        { id: 'admin', name: 'Administrateur', permissions: ['tableau_de_bord', 'reservations', 'finances', 'flotte', 'incidents', 'partenaires', 'clients', 'parametres'], isSystem: true },
                        { id: 'commercial', name: 'Commercial / Vente', permissions: ['tableau_de_bord', 'reservations', 'finances', 'clients', 'partenaires'], isSystem: false },
                        { id: 'pilote', name: 'Pilote / Staff Technique', permissions: ['tableau_de_bord', 'flotte', 'incidents'], isSystem: false },
                    ];
                    
                    const roles = storedRoles ? JSON.parse(storedRoles) : defaultRoles;
                    
                    let role = roles.find((r: any) => r.id === user.roleId);
                    
                    if (!role && user.role === 'Administrateur') {
                        role = roles.find((r: any) => r.id === 'admin');
                    } else if (!role && user.role) {
                        role = roles.find((r: any) => r.name === user.role);
                    }
                    
                    if (role) {
                        const routeName = pathname.split('/')[1];
                        const protectedModules = ['reservations', 'finances', 'flotte', 'incidents', 'partenaires', 'clients', 'parametres'];
                        if (protectedModules.includes(routeName) && !role.permissions.includes(routeName)) {
                            router.push('/'); // Redirection vers le tableau de bord si accès refusé
                        }
                    }
                }
            }
            
            setLoading(false);
        };

        checkUser();
        
        // Listen for storage changes if logout happens in another tab or component
        const handleStorageChange = () => {
            checkUser();
        };
        
        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-tab updates
        window.addEventListener('authChange', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authChange', handleStorageChange);
        };
    }, [pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center">
                    <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
                    <p className="text-gray-500 font-medium">Chargement d'Ebrié Lagoon...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
