import sys

file_path = "src/app/parametres/page.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_1 = """import { useState, useEffect } from 'react';

export default function ParametresPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);


    // Set default tab on mount
    useEffect(() => {
        // Just setting a default if needed
        if (activeTab === 'all') {
            setActiveTab('users'); // Default for parametres
        }
    }, []);"""

new_1 = """import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

type User = {
    id: string;
    nom_complet: string;
    email: string;
    role: string;
    statut: boolean;
    last_login: string | null;
    created_at: string;
};

export default function ParametresPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
    
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    // Form states for new user
    const [newUserNom, setNewUserNom] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState('Pilote');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set default tab on mount and fetch users
    useEffect(() => {
        if (activeTab === 'all') {
            setActiveTab('users'); // Default for parametres
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        const { data, error } = await supabase
            .from('utilisateurs')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
        } else if (data) {
            setUsers(data as User[]);
        }
        setIsLoadingUsers(false);
    };

    const handleAddUser = async () => {
        if (!newUserNom || !newUserEmail) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setIsSubmitting(true);
        const { data, error } = await supabase
            .from('utilisateurs')
            .insert([
                {
                    nom_complet: newUserNom,
                    email: newUserEmail,
                    role: newUserRole,
                    statut: true
                }
            ])
            .select();

        setIsSubmitting(false);

        if (error) {
            console.error("Erreur lors de l'ajout:", error);
            alert("Erreur lors de l'ajout de l'utilisateur.");
        } else if (data) {
            setUsers([data[0] as User, ...users]);
            setIsNewUserModalOpen(false);
            setNewUserNom('');
            setNewUserEmail('');
            setNewUserRole('Pilote');
        }
    };"""

content = content.replace(old_1, new_1)

old_2 = """                                <tbody className="text-sm divide-y divide-gray-100">
                                    <tr className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img src="https://ui-avatars.com/api/?name=Lionel+Vithiano&background=0D8ABC&color=fff"
                                                    className="w-8 h-8 rounded-full mr-3" />
                                                <div>
                                                    <div className="font-bold text-gray-900">Lionel Vithiano</div>
                                                    <div className="text-xs text-gray-500">l.vithiano@ebrielagoon.com</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">Administrateur</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">Il y a 2 minutes</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-400">
                                            <button className="hover:text-blue-600 transition mx-1"><i
                                                    className="fa-solid fa-pen"></i></button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img src="https://ui-avatars.com/api/?name=Marc+Pilote&background=10B981&color=fff"
                                                    className="w-8 h-8 rounded-full mr-3" />
                                                <div>
                                                    <div className="font-bold text-gray-900">Marc Assouman</div>
                                                    <div className="text-xs text-gray-500">m.assouman@ebrielagoon.com</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Pilote
                                                / Staff</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">Hier, 18:30</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-400">
                                            <button className="hover:text-blue-600 transition mx-1"><i
                                                    className="fa-solid fa-pen"></i></button>
                                            <button className="hover:text-red-600 transition mx-1"><i
                                                    className="fa-solid fa-trash"></i></button>
                                        </td>
                                    </tr>
                                </tbody>"""

new_2 = """                                <tbody className="text-sm divide-y divide-gray-100">
                                    {isLoadingUsers ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Chargement des utilisateurs...</td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Aucun utilisateur trouvé.</td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nom_complet)}&background=0D8ABC&color=fff`}
                                                            className="w-8 h-8 rounded-full mr-3" />
                                                        <div>
                                                            <div className="font-bold text-gray-900">{user.nom_complet}</div>
                                                            <div className="text-xs text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                                                            user.role === 'Administrateur' ? 'bg-purple-100 text-purple-700' : 
                                                            user.role === 'Pilote' ? 'bg-blue-100 text-blue-700' : 
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>{user.role}</span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">
                                                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Jamais connecté'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${user.statut ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-400">
                                                    <button className="hover:text-blue-600 transition mx-1"><i
                                                            className="fa-solid fa-pen"></i></button>
                                                    <button className="hover:text-red-600 transition mx-1"><i
                                                            className="fa-solid fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>"""

content = content.replace(old_2, new_2)

old_3 = """            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nom Complet</label>
                    <input type="text" placeholder="Ex: Jean Dupont"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email (Identifiant)</label>
                    <input type="email" placeholder="jean@ebrielagoon.com"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rôle</label>
                    <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="admin">Administrateur</option>
                        <option value="commercial">Commercial / Vente</option>
                        <option value="pilote">Pilote / Staff Technique</option>
                    </select>
                </div>
                <div className="flex items-center mt-2">
                    <input type="checkbox" id="sendInvite" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        defaultChecked />
                    <label htmlFor="sendInvite" className="ml-2 text-sm text-gray-700">Envoyer un email d'invitation avec mot de
                        passe temporaire</label>
                </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                <button onClick={() => setIsNewUserModalOpen(!isNewUserModalOpen)}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                <button
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md">Ajouter</button>
            </div>"""

new_3 = """            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Nom Complet</label>
                    <input type="text" placeholder="Ex: Jean Dupont" value={newUserNom} onChange={(e) => setNewUserNom(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email (Identifiant)</label>
                    <input type="email" placeholder="jean@ebrielagoon.com" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rôle</label>
                    <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="Administrateur">Administrateur</option>
                        <option value="Commercial">Commercial / Vente</option>
                        <option value="Pilote">Pilote / Staff Technique</option>
                    </select>
                </div>
                <div className="flex items-center mt-2">
                    <input type="checkbox" id="sendInvite" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                        defaultChecked />
                    <label htmlFor="sendInvite" className="ml-2 text-sm text-gray-700">Envoyer un email d'invitation avec mot de
                        passe temporaire</label>
                </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                <button onClick={() => setIsNewUserModalOpen(false)} disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                <button onClick={handleAddUser} disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50">
                    {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
                </button>
            </div>"""

content = content.replace(old_3, new_3)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
