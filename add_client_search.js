const fs = require('fs');
let content = fs.readFileSync('src/app/reservations/page.tsx', 'utf8');

// 1. Add state
const stateMarker = `    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);`;
const newState = `    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isClientSearchModalOpen, setIsClientSearchModalOpen] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState('');`;

content = content.replace(stateMarker, newState);

// 2. Replace Client Info inputs
const oldClientInfo = `                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b pb-2"><i className="fa-solid fa-user mr-2"></i>Informations Client</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Client / Raison Sociale *</label>
                            <input type="text" value={clientName} required onChange={(e) => setClientName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone / WhatsApp *</label>
                            <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>`;

const newClientInfo = `                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 border-b pb-2 flex justify-between items-center">
                        <span><i className="fa-solid fa-user mr-2"></i>Informations Client</span>
                        {clientId && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Client existant</span>}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Client / Raison Sociale *</label>
                            <div className="flex space-x-2">
                                <input type="text" value={clientName} onDoubleClick={() => setIsClientSearchModalOpen(true)} required onChange={(e) => {setClientName(e.target.value); setClientId('');}} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Double-cliquez ou cherchez" />
                                <button type="button" onClick={() => setIsClientSearchModalOpen(true)} className="bg-gray-100 border border-gray-300 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200 transition"><i className="fa-solid fa-search"></i></button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone / WhatsApp *</label>
                            <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>`;

content = content.replace(oldClientInfo, newClientInfo);

// 3. Add Client Search Modal at the end of the file before </main> or just before the last </div>
const modalCode = `
    {/* Client Search Modal */}
    <div className={\`fixed inset-0 z-[60] items-center justify-center p-4 \${isClientSearchModalOpen ? 'flex' : 'hidden'}\`}>
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsClientSearchModalOpen(false)}></div>
        <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                <h3 className="text-lg font-bold text-gray-800">Rechercher un Client</h3>
                <button onClick={() => setIsClientSearchModalOpen(false)} className="text-gray-400 hover:text-red-500 transition text-xl"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <i className="fa-solid fa-search absolute left-3 top-3 text-gray-400"></i>
                    <input 
                        type="text" 
                        value={clientSearchTerm}
                        onChange={(e) => setClientSearchTerm(e.target.value)}
                        placeholder="Rechercher par nom ou téléphone..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {clientsList.filter((c:any) => c.nom.toLowerCase().includes(clientSearchTerm.toLowerCase()) || c.telephone.includes(clientSearchTerm)).length === 0 ? (
                    <div className="p-6 text-center text-gray-500">Aucun client trouvé.</div>
                ) : (
                    clientsList.filter((c:any) => c.nom.toLowerCase().includes(clientSearchTerm.toLowerCase()) || c.telephone.includes(clientSearchTerm)).map((client: any) => (
                        <div 
                            key={client.id} 
                            onClick={() => {
                                setClientId(client.id);
                                setClientName(client.nom);
                                setClientPhone(client.telephone);
                                setIsClientSearchModalOpen(false);
                            }}
                            className="p-3 hover:bg-blue-50 border-b border-gray-50 cursor-pointer rounded transition flex justify-between items-center"
                        >
                            <div>
                                <div className="font-bold text-gray-800">{client.nom}</div>
                                <div className="text-sm text-gray-500"><i className="fa-solid fa-phone mr-1 text-gray-400"></i>{client.telephone}</div>
                            </div>
                            <button className="text-blue-600 text-sm font-medium bg-white border border-blue-200 px-3 py-1 rounded hover:bg-blue-100">Sélectionner</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
`;

// Insert the modal code right before the last closing `</div>` which is before `);`
// Wait, the file ends with:
//         </div>
//     );
// }

const endMarker = `        </div>\n    );\n}`;
content = content.replace(endMarker, modalCode + endMarker);

fs.writeFileSync('src/app/reservations/page.tsx', content, 'utf8');
console.log("Updated reservations to include client search modal.");
