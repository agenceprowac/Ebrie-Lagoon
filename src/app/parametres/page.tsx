
"use client";
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';

type AppRole = {
    id: string;
    name: string;
    permissions: string[];
    isSystem: boolean;
};

export const defaultRoles: AppRole[] = [
    { id: 'admin', name: 'Administrateur', permissions: ['tableau_de_bord', 'reservations', 'finances', 'flotte', 'incidents', 'partenaires', 'clients', 'parametres'], isSystem: true },
    { id: 'commercial', name: 'Commercial / Vente', permissions: ['tableau_de_bord', 'reservations', 'finances', 'clients', 'partenaires'], isSystem: false },
    { id: 'pilote', name: 'Pilote / Staff Technique', permissions: ['tableau_de_bord', 'flotte', 'incidents'], isSystem: false },
];

type AppUser = {
  id: string;
  name: string;
  email: string;
  pseudo: string;
  password?: string;
  roleId: string;
  lastLogin: string;
  status: 'actif' | 'inactif';
};

const defaultUsers: AppUser[] = [
    { id: '1', name: 'Lionel Vithiano', pseudo: 'Admin', password: 'admin123', email: 'l.vithiano@ebrielagoon.com', roleId: 'admin', lastLogin: 'Il y a 2 minutes', status: 'actif' },
    { id: '2', name: 'Marc Assouman', pseudo: 'Marc', password: 'password', email: 'm.assouman@ebrielagoon.com', roleId: 'pilote', lastLogin: 'Hier, 18:30', status: 'actif' }
];

export default function ParametresPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentUserName, setCurrentUserName] = useState('Chargement...');

    useEffect(() => {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
            try {
                setCurrentUserName(JSON.parse(currentUserStr).name);
            } catch (e) {
                setCurrentUserName('Administrateur');
            }
        } else {
            setCurrentUserName('Administrateur');
        }
    }, []);
    const [activeTab, setActiveTab] = useState('all');
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [isSavingSociete, setIsSavingSociete] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    const [users, setUsers] = useState<AppUser[]>([]);
    const [editingUser, setEditingUser] = useState<AppUser | null>(null);
    const [userForm, setUserForm] = useState({ name: '', email: '', pseudo: '', password: '', role: 'admin' });

    const [roles, setRoles] = useState<AppRole[]>([]);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<AppRole | null>(null);
    const [roleForm, setRoleForm] = useState({ name: '', permissions: [] as string[] });

    const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, message: string, onConfirm: () => void}>({isOpen: false, message: '', onConfirm: () => {}});
    const [addItemModal, setAddItemModal] = useState<{isOpen: boolean, type: 'pack' | 'option', name: string, price: string}>({isOpen: false, type: 'pack', name: '', price: ''});

    const [packs, setPacks] = useState([
        { id: '1', name: 'Demande en mariage Premium', price: 800000 },
        { id: '2', name: 'Anniversaire Premium', price: 600000 },
        { id: '3', name: 'Corporate Premium', price: 1000000 }
    ]);
    const [options, setOptions] = useState([
        { id: '1', name: 'Décoration romantique', price: 50000 },
        { id: '2', name: 'Photographe', price: 100000 },
        { id: '3', name: 'DJ professionnel', price: 200000 }
    ]);

    useEffect(() => {
        const savedUsers = localStorage.getItem('ebrie_users');
        if (savedUsers) {
            setUsers(JSON.parse(savedUsers));
        } else {
            setUsers(defaultUsers);
        }
        
        const savedRoles = localStorage.getItem('ebrie_roles');
        if (savedRoles) {
            setRoles(JSON.parse(savedRoles));
        } else {
            setRoles(defaultRoles);
        }

        const savedPacks = localStorage.getItem('ebrie_packs');
        if (savedPacks) setPacks(JSON.parse(savedPacks));

        const savedOptions = localStorage.getItem('ebrie_options');
        if (savedOptions) setOptions(JSON.parse(savedOptions));
    }, []);

    const handleSaveTarifs = () => {
        localStorage.setItem('ebrie_packs', JSON.stringify(packs));
        localStorage.setItem('ebrie_options', JSON.stringify(options));
        setNotification({ message: 'Tarifs sauvegardés avec succès !', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
    };

    const requestConfirm = (message: string, onConfirm: () => void) => {
        setConfirmModal({isOpen: true, message, onConfirm});
    };

    const handleAddPack = () => {
        setAddItemModal({isOpen: true, type: 'pack', name: '', price: ''});
    };

    const handleUpdatePackPrice = (id: string, priceStr: string) => {
        const price = parseInt(priceStr.replace(/\D/g, ''), 10) || 0;
        setPacks(packs.map(p => p.id === id ? { ...p, price } : p));
    };

    const handleDeletePack = (id: string) => {
        requestConfirm('Voulez-vous vraiment supprimer ce pack ?', () => {
            setPacks(packs.filter(p => p.id !== id));
            setConfirmModal(prev => ({...prev, isOpen: false}));
        });
    };

    const handleAddOption = () => {
        setAddItemModal({isOpen: true, type: 'option', name: '', price: ''});
    };

    const handleUpdateOptionPrice = (id: string, priceStr: string) => {
        const price = parseInt(priceStr.replace(/\D/g, ''), 10) || 0;
        setOptions(options.map(o => o.id === id ? { ...o, price } : o));
    };

    const handleDeleteOption = (id: string) => {
        requestConfirm('Voulez-vous vraiment supprimer cette option ?', () => {
            setOptions(options.filter(o => o.id !== id));
            setConfirmModal(prev => ({...prev, isOpen: false}));
        });
    };

    const handleSaveItem = () => {
        const price = parseInt(addItemModal.price.replace(/\D/g, ''), 10);
        if (isNaN(price) || !addItemModal.name) return;
        
        if (addItemModal.type === 'pack') {
            setPacks([...packs, { id: Math.random().toString(), name: addItemModal.name, price }]);
        } else {
            setOptions([...options, { id: Math.random().toString(), name: addItemModal.name, price }]);
        }
        setAddItemModal({...addItemModal, isOpen: false});
    };

    const handleSaveUser = () => {
        if (!userForm.name || !userForm.pseudo || !userForm.password) return;
        let updatedUsers;

        if (editingUser) {
            updatedUsers = users.map(u => u.id === editingUser.id ? { ...u, name: userForm.name, email: userForm.email, pseudo: userForm.pseudo, password: userForm.password, roleId: userForm.role } : u);
            setNotification({ message: 'Utilisateur modifié avec succès !', type: 'success' });
        } else {
            const newUser: AppUser = {
                id: Math.random().toString(36).substring(2, 9),
                name: userForm.name,
                email: userForm.email,
                pseudo: userForm.pseudo,
                password: userForm.password,
                roleId: userForm.role,
                lastLogin: 'Jamais',
                status: 'actif'
            };
            updatedUsers = [...users, newUser];
            setNotification({ message: 'Utilisateur ajouté avec succès !', type: 'success' });
        }
        
        setUsers(updatedUsers);
        localStorage.setItem('ebrie_users', JSON.stringify(updatedUsers));
        setIsNewUserModalOpen(false);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDeleteUser = (id: string) => {
        requestConfirm('Voulez-vous vraiment supprimer cet utilisateur ?', () => {
            const updatedUsers = users.filter(u => u.id !== id);
            setUsers(updatedUsers);
            localStorage.setItem('ebrie_users', JSON.stringify(updatedUsers));
            setNotification({ message: 'Utilisateur supprimé avec succès !', type: 'success' });
            setTimeout(() => setNotification(null), 3000);
            setConfirmModal(prev => ({...prev, isOpen: false}));
        });
    };

    const openAddUser = () => {
        setEditingUser(null);
        setUserForm({ name: '', email: '', pseudo: '', password: '', role: 'admin' });
        setIsNewUserModalOpen(true);
    };

    const openEditUser = (u: AppUser) => {
        setEditingUser(u);
        setUserForm({ 
            name: u.name, 
            email: u.email, 
            pseudo: u.pseudo || '',
            password: u.password || '',
            role: u.roleId 
        });
        setIsNewUserModalOpen(true);
    };

    const handleSaveRole = () => {
        if (!roleForm.name) return;
        let updatedRoles;
        if (editingRole) {
            updatedRoles = roles.map(r => r.id === editingRole.id ? { ...r, name: roleForm.name, permissions: roleForm.permissions } : r);
            setNotification({ message: 'Rôle modifié avec succès !', type: 'success' });
        } else {
            const newRole: AppRole = {
                id: Math.random().toString(36).substring(2, 9),
                name: roleForm.name,
                permissions: roleForm.permissions,
                isSystem: false
            };
            updatedRoles = [...roles, newRole];
            setNotification({ message: 'Rôle ajouté avec succès !', type: 'success' });
        }
        setRoles(updatedRoles);
        localStorage.setItem('ebrie_roles', JSON.stringify(updatedRoles));
        setIsRoleModalOpen(false);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleDeleteRole = (id: string) => {
        requestConfirm('Voulez-vous vraiment supprimer ce rôle ?', () => {
            const updatedRoles = roles.filter(r => r.id !== id);
            setRoles(updatedRoles);
            localStorage.setItem('ebrie_roles', JSON.stringify(updatedRoles));
            setNotification({ message: 'Rôle supprimé avec succès !', type: 'success' });
            setTimeout(() => setNotification(null), 3000);
            setConfirmModal(prev => ({...prev, isOpen: false}));
        });
    };

    const openAddRole = () => {
        setEditingRole(null);
        setRoleForm({ name: '', permissions: [] });
        setIsRoleModalOpen(true);
    };

    const openEditRole = (r: AppRole) => {
        setEditingRole(r);
        setRoleForm({ name: r.name, permissions: [...r.permissions] });
        setIsRoleModalOpen(true);
    };

    const togglePermission = (permId: string) => {
        setRoleForm(prev => {
            if (prev.permissions.includes(permId)) {
                return { ...prev, permissions: prev.permissions.filter(p => p !== permId) };
            } else {
                return { ...prev, permissions: [...prev.permissions, permId] };
            }
        });
    };

    const handleSaveSocieteInfo = async () => {
        setIsSavingSociete(true);
        // Simulation of an API call or database save
        setTimeout(() => {
            setIsSavingSociete(false);
            setNotification({ message: 'Informations de la société enregistrées avec succès !', type: 'success' });
            setTimeout(() => setNotification(null), 3000);
        }, 800);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                setLogoUrl(base64);
                localStorage.setItem('ebrie_logo', base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                setSignatureUrl(base64);
                localStorage.setItem('ebrie_sig', base64);
            };
            reader.readAsDataURL(file);
        }
    };

    // Set default tab on mount
    useEffect(() => {
        // Just setting a default if needed
        if (activeTab === 'all') {
            setActiveTab('users'); // Default for parametres
        }
        
        // Load stored settings
        const storedLogo = localStorage.getItem('ebrie_logo');
        if (storedLogo) setLogoUrl(storedLogo);
        
        const storedSig = localStorage.getItem('ebrie_sig');
        if (storedSig) setSignatureUrl(storedSig);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden text-gray-800 bg-slate-50 font-sans">
            

    
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

    
    <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 relative">
        
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
            <div className="flex items-center justify-between px-6 py-4">
                <div
                    className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-blue-400 transition opacity-0">
                    
                    <i className="fa-solid fa-search text-gray-400"></i>
                    <input type="text" className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
                </div>
                <div className="flex items-center space-x-4">
                    <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
                        <i className="fa-solid fa-bell text-xl"></i>
                        <span
                            className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div
                        className="flex items-center space-x-3 border-l pl-4 border-gray-200 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                        <img src="https://ui-avatars.com/api/?name=Lionel+Vithiano&background=0D8ABC&color=fff"
                            alt="User" className="w-9 h-9 rounded-full shadow-sm" />
                        <div className="hidden md:block text-sm">
                            <p className="font-semibold text-gray-700">{currentUserName}</p>
                            <p className="text-xs text-gray-500">Administrateur</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {notification.message}
            </div>
        )}
    <div id="roleModal" className={`fixed inset-0 z-50 items-center justify-center p-4 ${isRoleModalOpen ? 'flex' : 'hidden'}`}>
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsRoleModalOpen(false)}></div>
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">{editingRole ? 'Modifier le rôle' : 'Ajouter un rôle'}</h3>
                <button onClick={() => setIsRoleModalOpen(false)}
                    className="text-gray-400 hover:text-red-500 transition text-xl"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nom du Rôle</label>
                    <input type="text" value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} placeholder="Ex: Superviseur Flotte"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" 
                        disabled={editingRole?.isSystem} />
                    {editingRole?.isSystem && <p className="text-xs text-red-500 mt-1">Le nom de ce rôle système ne peut pas être modifié.</p>}
                </div>
                
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Modules Autorisés</label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'tableau_de_bord', label: 'Tableau de bord', icon: 'fa-chart-pie' },
                            { id: 'reservations', label: 'Réservations', icon: 'fa-calendar-check' },
                            { id: 'finances', label: 'Finances & Devis', icon: 'fa-file-invoice-dollar' },
                            { id: 'flotte', label: 'Flotte & Opérations', icon: 'fa-ship' },
                            { id: 'incidents', label: 'Incidents', icon: 'fa-triangle-exclamation' },
                            { id: 'partenaires', label: 'Partenaires', icon: 'fa-handshake' },
                            { id: 'clients', label: 'Clients', icon: 'fa-users' },
                            { id: 'parametres', label: 'Paramètres', icon: 'fa-cog' }
                        ].map(mod => (
                            <label key={mod.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200 transition">
                                <input type="checkbox" 
                                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                                    checked={roleForm.permissions.includes(mod.id)}
                                    onChange={() => togglePermission(mod.id)}
                                />
                                <span className="text-sm text-gray-700 flex items-center">
                                    <i className={`fa-solid ${mod.icon} w-5 text-center text-gray-400 mr-1`}></i>
                                    {mod.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                <button onClick={() => setIsRoleModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                <button onClick={handleSaveRole}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition shadow-md">{editingRole ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
        </div>
    </div>

        
        <div className="p-6 lg:p-8 flex-1 flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Paramètres de l'Application</h2>
                <p className="text-sm text-gray-500">Configurez votre environnement, vos utilisateurs et vos tarifs</p>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">

                
                <div className="w-full lg:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-2 lg:p-4 flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 h-fit overflow-x-auto shrink-0 hide-scrollbar">
                    <button id="btn-tab-societe" onClick={() => setActiveTab('societe')}
                        className={`whitespace-nowrap shrink-0 lg:w-full text-left px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition lg:border-l-3 lg:border-transparent ${activeTab === 'societe' ? 'tab-active' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <i className="fa-solid fa-building mr-2 w-4"></i> Informations Société
                    </button>
                    <button id="btn-tab-users" onClick={() => setActiveTab('users')}
                        className={`whitespace-nowrap shrink-0 lg:w-full text-left px-4 py-3 rounded-lg text-sm transition ${activeTab === 'users' ? 'tab-active' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <i className="fa-solid fa-users-gear mr-2 w-4"></i> Utilisateurs & Rôles
                    </button>
                    <button id="btn-tab-tarifs" onClick={() => setActiveTab('tarifs')}
                        className={`whitespace-nowrap shrink-0 lg:w-full text-left px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition lg:border-l-3 lg:border-transparent ${activeTab === 'tarifs' ? 'tab-active' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <i className="fa-solid fa-tags mr-2 w-4"></i> Tarification & Packs
                    </button>
                    <button id="btn-tab-pdf" onClick={() => setActiveTab('pdf')}
                        className={`whitespace-nowrap shrink-0 lg:w-full text-left px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition lg:border-l-3 lg:border-transparent ${activeTab === 'pdf' ? 'tab-active' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <i className="fa-solid fa-file-invoice mr-2 w-4"></i> Modèles PDF
                    </button>
                    <button id="btn-tab-notifications" onClick={() => setActiveTab('notifications')}
                        className={`whitespace-nowrap shrink-0 lg:w-full text-left px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition lg:border-l-3 lg:border-transparent ${activeTab === 'notifications' ? 'tab-active' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <i className="fa-solid fa-bell mr-2 w-4"></i> Notifications
                    </button>
                </div>

                
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto relative">

                    
                    <div id="tab-societe" className={`p-6 md:p-8  ${activeTab === 'societe' ? 'block' : 'hidden'}`}>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Informations de la Société</h3>
                            <p className="text-sm text-gray-500">Ces informations apparaîtront sur vos devis et factures.
                            </p>
                        </div>

                        <div className="space-y-6 max-w-3xl">
                            
                            <div className="flex items-center space-x-6 border-b border-gray-100 pb-6">
                                <div
                                    className="w-24 h-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo de la société" className="w-full h-full object-cover" />
                                    ) : (
                                        <i className="fa-solid fa-image text-gray-400 text-2xl"></i>
                                    )}
                                </div>
                                <div>
                                    <input 
                                        type="file" 
                                        accept="image/png, image/jpeg" 
                                        className="hidden" 
                                        ref={logoInputRef} 
                                        onChange={handleLogoUpload} 
                                    />
                                    <button
                                        onClick={() => logoInputRef.current?.click()}
                                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
                                        <i className="fa-solid fa-upload mr-2"></i> Télécharger le Logo
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">Format recommandé: PNG ou JPG, max 2MB.
                                        500x500px.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Raison Sociale *</label>
                                    <input type="text" defaultValue="Ebrié Lagoon CI"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Registre de Commerce
                                        (RCCM)</label>
                                    <input type="text" defaultValue="CI-ABJ-2023-B-12345"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Compte Contribuable
                                        (CC)</label>
                                    <input type="text" defaultValue="1234567 A"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>

                                <div className="col-span-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">
                                        Coordonnées</h4>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Adresse Complète</label>
                                    <input type="text" defaultValue="Abidjan, Marcory Zone 4, Rue Pierre et Marie Curie"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone
                                        Principal</label>
                                    <input type="text" defaultValue="+225 07 00 11 22 33"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email de Contact</label>
                                    <input type="email" defaultValue="contact@ebrielagoon.com"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>

                                <div className="col-span-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">
                                        Informations Bancaires</h4>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Détails Bancaires (RIB,
                                        IBAN, Nom de la banque)</label>
                                    <textarea rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={`Banque: Ecobank CI
Titulaire: Ebrié Lagoon CI
RIB: CI059 01001 12345678901 23`} />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={handleSaveSocieteInfo}
                                    disabled={isSavingSociete}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md transition text-sm font-medium disabled:opacity-70 flex items-center">
                                    {isSavingSociete ? (
                                        <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Enregistrement...</>
                                    ) : (
                                        'Enregistrer les informations'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    
                    <div id="tab-pdf" className={`p-6 md:p-8  ${activeTab === 'pdf' ? 'block' : 'hidden'}`}>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Personnalisation des Documents PDF</h3>
                            <p className="text-sm text-gray-500">Gérez le design visuel de vos devis et factures.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur
                                        Principale</label>
                                    <div className="flex items-center space-x-3">
                                        <input type="color" defaultValue="#2563EB"
                                            className="w-10 h-10 p-1 rounded border border-gray-300 cursor-pointer" />
                                        <span className="text-sm text-gray-600">#2563EB (Bleu Ebrié Lagoon)</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pied de page
                                        (Footer)</label>
                                    <textarea rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={`Ebrié Lagoon CI au capital de 1 000 000 FCFA - RCCM: CI-ABJ-2023-B-12345 - CC: 1234567 A
Siège social : Abidjan, Marcory Zone 4`} />
                                    <p className="text-xs text-gray-500 mt-1">Apparaît en bas de chaque page du PDF.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mentions légales de
                                        facturation</label>
                                    <textarea rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={`En cas de retard de paiement, une pénalité de 3% par mois sera appliquée.
Validité du devis : 15 jours.`} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Signature & Cachet par
                                        défaut</label>
                                    <input 
                                        type="file" 
                                        accept="image/png" 
                                        className="hidden" 
                                        ref={signatureInputRef} 
                                        onChange={handleSignatureUpload} 
                                    />
                                    <div
                                        onClick={() => signatureInputRef.current?.click()}
                                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition overflow-hidden">
                                        {signatureUrl ? (
                                            <img src={signatureUrl} alt="Signature par défaut" className="max-h-full max-w-full object-contain p-2" />
                                        ) : (
                                            <div className="text-center">
                                                <i className="fa-solid fa-signature text-gray-400 text-2xl mb-2"></i>
                                                <p className="text-xs text-gray-500">Cliquer pour uploader une image PNG
                                                    transparente</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md transition text-sm font-medium">
                                        Sauvegarder le modèle
                                    </button>
                                </div>
                            </div>

                            
                            <div
                                className="bg-gray-100 rounded-xl p-4 flex items-center justify-center border border-gray-200 min-h-[500px]">
                                <div className="bg-white shadow-xl w-full max-w-sm aspect-[1/1.4] p-6 text-[10px] relative">
                                    
                                    <div className="flex justify-between border-b-2 border-blue-600 pb-4 mb-4">
                                        <div
                                            className={`w-16 h-8 flex items-center justify-center text-gray-400 ${!logoUrl ? 'bg-gray-200' : ''}`}>
                                            {logoUrl ? <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" /> : 'LOGO'}
                                        </div>
                                        <div className="text-right">
                                            <h1 className="text-sm font-bold text-blue-600">FACTURE N° FAC-001</h1>
                                            <p className="text-gray-500">Date: 10/06/2026</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mb-6">
                                        <div>
                                            <p className="font-bold">Ebrié Lagoon CI</p>
                                            <p className="text-gray-500">Zone 4, Abidjan</p>
                                        </div>
                                        <div className="text-right bg-gray-50 p-2 rounded">
                                            <p className="font-bold">Facturé à:</p>
                                            <p className="text-gray-700">Koffi Armand</p>
                                            <p className="text-gray-500">07 07 12 34 56</p>
                                        </div>
                                    </div>
                                    <table className="w-full mb-6"><tbody>
<tr className="bg-blue-50 text-blue-800 font-bold">
                                            <th className="text-left p-1">Désignation</th>
                                            <th className="text-right p-1">Total</th>
                                        </tr>
                                        <tr>
                                            <td className="p-1 border-b text-gray-600">Pack Mariage</td>
                                            <td className="text-right p-1 border-b font-medium">800 000</td>
                                        </tr>
                                    
</tbody></table>
                                    <div
                                        className="absolute bottom-6 left-6 right-6 text-center text-gray-400 border-t pt-2">
                                        Ebrié Lagoon CI - RCCM: CI-ABJ-2023-B-12345
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div id="tab-users" className={`p-6 md:p-8  ${activeTab === 'users' ? 'block' : 'hidden'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Utilisateurs & Rôles</h3>
                                <p className="text-sm text-gray-500">Gérez les accès à la plateforme Ebrié Lagoon</p>
                            </div>
                            <button onClick={openAddUser}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center">
                                <i className="fa-solid fa-plus mr-2"></i> Ajouter un compte
                            </button>
                        </div>

                        
                        <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr
                                        className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                        <th className="px-6 py-4 font-medium">Utilisateur</th>
                                        <th className="px-6 py-4 font-medium">Rôle</th>
                                        <th className="px-6 py-4 font-medium">Dernière connexion</th>
                                        <th className="px-6 py-4 font-medium text-center">Statut</th>
                                        <th className="px-6 py-4 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`}
                                                        className="w-8 h-8 rounded-full mr-3" />
                                                    <div>
                                                        <div className="font-bold text-gray-900">{user.name}</div>
                                                        <div className="text-xs text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded text-xs font-semibold ${user.roleId === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {roles.find(r => r.id === user.roleId)?.name || 'Inconnu'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">{user.lastLogin}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`w-2.5 h-2.5 rounded-full inline-block ${user.status === 'actif' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-400">
                                                <button onClick={() => openEditUser(user)} className="hover:text-blue-600 transition mx-1"><i className="fa-solid fa-pen"></i></button>
                                                {user.name !== 'Lionel Vithiano' && (
                                                    <button onClick={() => handleDeleteUser(user.id)} className="hover:text-red-600 transition mx-1"><i className="fa-solid fa-trash"></i></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <hr className="border-gray-200 my-8" />
                        
                        <div className="flex justify-between items-center mb-6 mt-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Gestion des Rôles</h3>
                                <p className="text-sm text-gray-500">Configurez les permissions d'accès</p>
                            </div>
                            <button onClick={openAddRole}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center">
                                <i className="fa-solid fa-shield-halved mr-2"></i> Ajouter un rôle
                            </button>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden mb-8">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                                        <th className="px-6 py-4 font-medium">Nom du Rôle</th>
                                        <th className="px-6 py-4 font-medium">Modules Autorisés</th>
                                        <th className="px-6 py-4 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {roles.map((role) => (
                                        <tr key={role.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-bold text-gray-900">{role.name} {role.isSystem && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Système</span>}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.map(p => (
                                                        <span key={p} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded border border-gray-200">{p}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-400">
                                                <button onClick={() => openEditRole(role)} className="hover:text-blue-600 transition mx-1"><i className="fa-solid fa-pen"></i></button>
                                                {!role.isSystem && (
                                                    <button onClick={() => handleDeleteRole(role.id)} className="hover:text-red-600 transition mx-1"><i className="fa-solid fa-trash"></i></button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    
                    <div id="tab-tarifs" className={`p-6 md:p-8  ${activeTab === 'tarifs' ? 'block' : 'hidden'}`}>
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-gray-800">Catalogue des Tarifs (Aperçu)</h3>
                            <p className="text-sm text-gray-500">Modifier les prix de base utilisés dans le générateur de
                                devis</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="border border-gray-200 rounded-xl p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-700"><i
                                            className="fa-solid fa-box mr-2 text-blue-500"></i>Packs Principaux</h4>
                                    <button onClick={handleAddPack} className="text-blue-600 text-xs font-semibold hover:underline">+
                                        Ajouter</button>
                                </div>
                                <div className="space-y-3">
                                    {packs.map(pack => (
                                        <div key={pack.id} className="flex items-center justify-between text-sm group">
                                            <span className="text-gray-800 font-medium flex-1">{pack.name}</span>
                                            <div className="flex items-center space-x-2">
                                                <input type="text" value={pack.price.toLocaleString()} onChange={(e) => handleUpdatePackPrice(pack.id, e.target.value)}
                                                    className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                                                <button onClick={() => handleDeletePack(pack.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><i className="fa-solid fa-times"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            
                            <div className="border border-gray-200 rounded-xl p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-700"><i
                                            className="fa-solid fa-layer-group mr-2 text-orange-500"></i>Options
                                        Additionnelles</h4>
                                    <button onClick={handleAddOption} className="text-blue-600 text-xs font-semibold hover:underline">+
                                        Ajouter</button>
                                </div>
                                <div className="space-y-3">
                                    {options.map(option => (
                                        <div key={option.id} className="flex items-center justify-between text-sm group">
                                            <span className="text-gray-800 font-medium flex-1">{option.name}</span>
                                            <div className="flex items-center space-x-2">
                                                <input type="text" value={option.price.toLocaleString()} onChange={(e) => handleUpdateOptionPrice(option.id, e.target.value)}
                                                    className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                                                <button onClick={() => handleDeleteOption(option.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><i className="fa-solid fa-times"></i></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={handleSaveTarifs}
                                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg shadow transition text-sm font-medium">
                                Sauvegarder les tarifs
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </main>

    
    <div id="newUserModal" className={`fixed inset-0 z-50 items-center justify-center p-4 ${isNewUserModalOpen ? 'flex' : 'hidden'}`}>
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsNewUserModalOpen(!isNewUserModalOpen)}></div>
        <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">{editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un Utilisateur'}</h3>
                <button onClick={() => setIsNewUserModalOpen(false)}
                    className="text-gray-400 hover:text-red-500 transition text-xl"><i
                        className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nom Complet</label>
                    <input type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} placeholder="Ex: Jean Dupont"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pseudo</label>
                    <input type="text" value={userForm.pseudo} onChange={e => setUserForm({...userForm, pseudo: e.target.value})} placeholder="Ex: JDupont"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mot de passe</label>
                    <input type="text" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} placeholder="Mot de passe"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} placeholder="jean@ebrielagoon.com"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rôle</label>
                    <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
                {!editingUser && (
                    <div className="flex items-center mt-2">
                        <input type="checkbox" id="sendInvite" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                            defaultChecked />
                        <label htmlFor="sendInvite" className="ml-2 text-sm text-gray-700">Envoyer un email d'invitation avec mot de
                            passe temporaire</label>
                    </div>
                )}
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                <button onClick={() => setIsNewUserModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                <button onClick={handleSaveUser}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md">{editingUser ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
        </div>
    </div>

    

    <div id="confirmModal" className={`fixed inset-0 z-[60] items-center justify-center p-4 ${confirmModal.isOpen ? 'flex' : 'hidden'}`}>
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))}></div>
        <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl flex flex-col p-6 text-center transform transition-all scale-100 opacity-100 duration-300">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmation</h3>
            <p className="text-sm text-gray-500 mb-6">{confirmModal.message}</p>
            <div className="flex justify-center space-x-3">
                <button onClick={() => setConfirmModal(prev => ({...prev, isOpen: false}))}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Annuler</button>
                <button onClick={confirmModal.onConfirm}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition shadow-md">Confirmer</button>
            </div>
        </div>
    </div>

    <div id="addItemModal" className={`fixed inset-0 z-[60] items-center justify-center p-4 ${addItemModal.isOpen ? 'flex' : 'hidden'}`}>
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setAddItemModal(prev => ({...prev, isOpen: false}))}></div>
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Ajouter un{addItemModal.type === 'pack' ? ' pack' : 'e option'}</h3>
                <button onClick={() => setAddItemModal(prev => ({...prev, isOpen: false}))}
                    className="text-gray-400 hover:text-red-500 transition text-xl"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nom {addItemModal.type === 'pack' ? 'du pack' : 'de l\'option'}</label>
                    <input type="text" value={addItemModal.name} onChange={e => setAddItemModal({...addItemModal, name: e.target.value})} placeholder="Ex: Décoration Florale"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Prix (CFA)</label>
                    <input type="text" value={addItemModal.price} onChange={e => setAddItemModal({...addItemModal, price: e.target.value.replace(/\D/g, '')})} placeholder="Ex: 50000"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                <button onClick={() => setAddItemModal(prev => ({...prev, isOpen: false}))}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                <button onClick={handleSaveItem}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md">Enregistrer</button>
            </div>
        </div>
    </div>

        </div>
    );
}
