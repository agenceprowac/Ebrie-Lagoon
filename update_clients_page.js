const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf8');

// Add imports
if (!content.includes("import { supabase }")) {
    content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { supabase } from '@/utils/supabase';");
}

// Add state variables inside ClientsPage
const stateVars = `    const [activeTab, setActiveTab] = useState('all');
    const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    
    // Nouveaux etats
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [nom, setNom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [telephoneSecondaire, setTelephoneSecondaire] = useState('');
    const [email, setEmail] = useState('');
    const [categorie, setCategorie] = useState('particulier');
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const fetchClients = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setClients(data || []);
        } catch (error: any) {
            console.error('Erreur fetch clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleSaveClient = async () => {
        if (!nom || !telephone) {
            setNotification({ message: 'Le nom et le téléphone principal sont obligatoires', type: 'error' });
            return;
        }

        try {
            const { error } = await supabase
                .from('clients')
                .insert([{ 
                    nom, 
                    telephone, 
                    email
                }]);

            if (error) throw error;

            setNotification({ message: 'Client ajouté avec succès !', type: 'success' });
            setIsNewClientModalOpen(false);
            
            // Reset form
            setNom('');
            setTelephone('');
            setTelephoneSecondaire('');
            setEmail('');
            setCategorie('particulier');
            
            fetchClients();
            
            setTimeout(() => setNotification(null), 3000);
        } catch (error: any) {
            console.error('Erreur save client:', error);
            setNotification({ message: 'Erreur: ' + error.message, type: 'error' });
            setTimeout(() => setNotification(null), 5000);
        }
    };
`;

content = content.replace(
    "    const [activeTab, setActiveTab] = useState('all');\n    const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);\n    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);",
    stateVars
);

// Add Notification UI below the header
content = content.replace(
    `        <div className="p-6 lg:p-8 space-y-6">`,
    `        {notification && (
            <div className={\`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white \${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}\`}>
                {notification.message}
            </div>
        )}
        <div className="p-6 lg:p-8 space-y-6">`
);

// Update table content
const oldTableBody = `                        <tbody className="text-sm divide-y divide-gray-50">
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    Aucun client enregistré.
                                </td>
                            </tr>
                        </tbody>`;

const newTableBody = `                        <tbody className="text-sm divide-y divide-gray-50">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Aucun client enregistré.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client: any) => (
                                    <tr key={client.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold mr-3 shadow-sm">
                                                    {client.nom.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{client.nom}</div>
                                                    <div className="text-xs text-gray-500">Ajouté le {new Date(client.created_at).toLocaleDateString('fr-FR')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-800"><i className="fa-solid fa-phone text-gray-400 w-4"></i> {client.telephone}</div>
                                            {client.email && <div className="text-gray-500 text-xs"><i className="fa-solid fa-envelope text-gray-400 w-4"></i> {client.email}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium border border-gray-200">Particulier</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold">-</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-800">
                                            - FCFA
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-500">
                                            -
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => setIsHistoryModalOpen(!isHistoryModalOpen)} className="px-3 py-1 bg-white border border-gray-200 shadow-sm text-blue-600 rounded hover:bg-blue-50 transition text-xs font-medium">Voir fiche</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>`;

content = content.replace(oldTableBody, newTableBody);

// Update Modal Inputs
const oldModalInputs = `                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nom Complet / Raison Sociale</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone Principal</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone Secondaire</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="particulier">Particulier</option>
                            <option value="entreprise">Entreprise / Corporate</option>
                            <option value="vip">VIP</option>
                        </select>
                    </div>`;

const newModalInputs = `                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nom Complet / Raison Sociale *</label>
                        <input type="text" value={nom} onChange={e => setNom(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone Principal *</label>
                        <input type="text" value={telephone} onChange={e => setTelephone(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone Secondaire</label>
                        <input type="text" value={telephoneSecondaire} onChange={e => setTelephoneSecondaire(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie</label>
                        <select value={categorie} onChange={e => setCategorie(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="particulier">Particulier</option>
                            <option value="entreprise">Entreprise / Corporate</option>
                            <option value="vip">VIP</option>
                        </select>
                    </div>`;

content = content.replace(oldModalInputs, newModalInputs);

// Connect the Save Button
const oldSaveButton = `<button className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md">Enregistrer</button>`;
const newSaveButton = `<button onClick={handleSaveClient} disabled={!nom || !telephone} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Enregistrer</button>`;

content = content.replace(oldSaveButton, newSaveButton);

// Dynamic KPIs Update
content = content.replace(
    `<h3 className="text-2xl font-bold text-gray-800">0</h3>`,
    `<h3 className="text-2xl font-bold text-gray-800">{clients.length}</h3>`
);

fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
console.log('Update clients/page.tsx complete');
