const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf8');

// Add State
const stateMarker = `    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);`;
const newState = `    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [clientReservations, setClientReservations] = useState<any[]>([]);
    const [clientStats, setClientStats] = useState({ totalRes: 0, ca: 0 });`;

if (!content.includes('const [selectedClient')) {
    content = content.replace(stateMarker, newState);
}

// Add Function
const functionMarker = `    const fetchClients = async () => {`;
const newFunction = `    const handleViewClient = async (client: any) => {
        setSelectedClient(client);
        setIsHistoryModalOpen(true);
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('client_id', client.id)
            .order('date_prestation', { ascending: false });
        
        if (data) {
            setClientReservations(data);
            const totalCa = data.reduce((sum, res) => sum + (res.montant_total || 0), 0);
            setClientStats({ totalRes: data.length, ca: totalCa });
        } else {
            setClientReservations([]);
            setClientStats({ totalRes: 0, ca: 0 });
        }
    };

    const fetchClients = async () => {`;

if (!content.includes('const handleViewClient')) {
    content = content.replace(functionMarker, newFunction);
}

// Update button
const oldButton = `<button onClick={() => setIsHistoryModalOpen(!isHistoryModalOpen)} className="px-3 py-1 bg-white border border-gray-200 shadow-sm text-blue-600 rounded hover:bg-blue-50 transition text-xs font-medium">Voir fiche</button>`;
const newButton = `<button onClick={() => handleViewClient(client)} className="px-3 py-1 bg-white border border-gray-200 shadow-sm text-blue-600 rounded hover:bg-blue-50 transition text-xs font-medium">Voir fiche</button>`;
content = content.replace(oldButton, newButton);

// Update modal
const startIdx = content.indexOf('<div id="historyModal"');
const endIdx = content.indexOf('</div>\n    </div>\n\n    \n\n        </div>\n    );\n}');

if (startIdx !== -1 && endIdx !== -1) {
    const modalContent = content.substring(startIdx, endIdx);
    
    const newModalContent = `<div id="historyModal" className={\`fixed inset-0 z-50 items-center justify-center p-4 \${isHistoryModalOpen ? 'flex' : 'hidden'}\`}>
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsHistoryModalOpen(false)}></div>
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out max-h-[90vh]">
            {selectedClient && (
                <>
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-lg mr-4 shadow-sm">
                                {selectedClient.nom ? selectedClient.nom.substring(0, 2).toUpperCase() : 'C'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{selectedClient.nom}</h3>
                                <p className="text-sm text-gray-500">Particulier • {selectedClient.telephone}</p>
                            </div>
                        </div>
                        <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-red-500 transition text-2xl"><i className="fa-solid fa-times"></i></button>
                    </div>
                    <div className="p-6 overflow-y-auto bg-white flex-1 space-y-6">
                        
                        <div className="flex bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex-1 text-center border-r border-blue-200">
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Total Réservations</p>
                                <p className="text-2xl font-bold text-gray-800">{clientStats.totalRes}</p>
                            </div>
                            <div className="flex-1 text-center border-r border-blue-200">
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">CA Généré</p>
                                <p className="text-2xl font-bold text-gray-800">{clientStats.ca.toLocaleString()} FCFA</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Dernière activité</p>
                                <p className="text-xl font-bold text-gray-800 mt-1">
                                    {clientReservations.length > 0 ? new Date(clientReservations[0].date_prestation).toLocaleDateString('fr-FR') : '-'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center"><i className="fa-solid fa-clock-rotate-left mr-2 text-gray-400"></i> Historique des Prestations</h4>
                            <div className="space-y-4">
                                {clientReservations.length === 0 ? (
                                    <div className="text-gray-500 text-center py-4 border border-gray-100 rounded-lg">Aucune réservation pour le moment.</div>
                                ) : (
                                    clientReservations.map((res: any) => (
                                        <div key={res.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition bg-gray-50/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold mr-2">{res.numero_reference}</span>
                                                    <span className="font-bold text-gray-800">{res.type_prestation}</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-800">{(res.montant_total || 0).toLocaleString()} FCFA</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-sm text-gray-500">
                                                    <p><i className="fa-regular fa-calendar mr-1"></i> {new Date(res.date_prestation).toLocaleDateString('fr-FR')} à {res.heure_debut?.substring(0,5)}</p>
                                                    <p><i className="fa-solid fa-users mr-1"></i> {res.nb_personnes} personnes</p>
                                                </div>
                                                <div className="space-x-2">
                                                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold">{res.statut || 'En attente'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium"><i className="fa-solid fa-pen mr-1"></i> Éditer profil</button>
                        <button onClick={() => setIsHistoryModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition">Fermer</button>
                    </div>
                </>
            )}
        </div>`;
    content = content.replace(modalContent, newModalContent);
    fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
    console.log("Updated history modal with real data bindings");
} else {
    console.log("Could not locate history modal");
}
