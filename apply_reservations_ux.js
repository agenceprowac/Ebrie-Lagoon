const fs = require('fs');

let content = fs.readFileSync('src/app/reservations/page.tsx', 'utf8');

// Normalize line endings to \n to avoid matching issues
content = content.replace(/\r\n/g, '\n');

// 1. Data and State
const dataReplacement = `const initialReservations = [
    { id: 'RES-2026-068', date: '10/06/2026', client: 'Koffi Armand', phone: '07 07 12 34 56', icon: 'whatsapp', iconColor: 'text-green-500', email: '', prestDate: '12 Juin 2026', prestDetails: '14:00 (3h) • 15 Pax', bateau: 'Catamaran "Lagune Express"', statut: 'Confirmée', statutColor: 'bg-green-100 text-green-700 border-green-200', total: '150 000', solde: 'Solde: 0', soldeColor: 'text-green-600' },
    { id: 'RES-2026-069', date: '11/06/2026', client: 'Sylla Fatou', phone: '01 02 03 04 05', icon: 'phone', iconColor: 'text-gray-400', email: '', prestDate: '15 Juin 2026', prestDetails: '09:30 (Demi-journée) • 5 Pax', bateau: 'Speedboat "Rapide"', statut: 'Attente Acompte', statutColor: 'bg-yellow-100 text-yellow-700 border-yellow-200', total: '85 000', solde: 'Solde: 85 000', soldeColor: 'text-red-500' },
    { id: 'RES-2026-070', date: '11/06/2026', client: 'Entreprise Tiemoko', phone: '', icon: 'envelope', iconColor: 'text-gray-400', email: 'contact@tiemoko.ci', prestDate: '20 Juin 2026', prestDetails: '10:00 (Journée) • 40 Pax', bateau: 'Yacht "VIP Ebrié"', statut: 'Brouillon', statutColor: 'bg-blue-100 text-blue-700 border-blue-200', total: '450 000', solde: 'Acompte: 150 000', soldeColor: 'text-orange-500' },
    { id: 'RES-2026-071', date: '12/06/2026', client: 'Aka Serge', phone: '05 05 05 05 05', icon: 'phone', iconColor: 'text-gray-400', email: '', prestDate: '22 Juin 2026', prestDetails: '', bateau: 'Catamaran "Lagune Express"', statut: 'Confirmée', statutColor: 'bg-green-100 text-green-700 border-green-200', total: '200 000', solde: '', soldeColor: '' },
    { id: 'RES-2026-072', date: '12/06/2026', client: 'Traoré Ismael', phone: '01 01 01 01 01', icon: 'phone', iconColor: 'text-gray-400', email: '', prestDate: '23 Juin 2026', prestDetails: '', bateau: 'Speedboat "Rapide"', statut: 'Terminée', statutColor: 'bg-gray-100 text-gray-700 border-gray-200', total: '120 000', solde: '', soldeColor: '' },
    { id: 'RES-2026-073', date: '13/06/2026', client: 'Tourisme CI', phone: '', icon: 'envelope', iconColor: 'text-gray-400', email: 'contact@tourisme.ci', prestDate: '25 Juin 2026', prestDetails: '', bateau: 'Yacht "VIP Ebrié"', statut: 'Confirmée', statutColor: 'bg-green-100 text-green-700 border-green-200', total: '1 500 000', solde: '', soldeColor: '' },
    { id: 'RES-2026-074', date: '13/06/2026', client: 'Bamba Ali', phone: '07 88 99 00 11', icon: 'phone', iconColor: 'text-gray-400', email: '', prestDate: '26 Juin 2026', prestDetails: '', bateau: 'Catamaran "Lagune Express"', statut: 'Annulée', statutColor: 'bg-red-100 text-red-700 border-red-200', total: '150 000', solde: '', soldeColor: '' },
    { id: 'RES-2026-075', date: '14/06/2026', client: 'Diomandé Eric', phone: '05 66 77 88 99', icon: 'phone', iconColor: 'text-gray-400', email: '', prestDate: '28 Juin 2026', prestDetails: '', bateau: 'Speedboat "Rapide"', statut: 'Attente Acompte', statutColor: 'bg-yellow-100 text-yellow-700 border-yellow-200', total: '90 000', solde: '', soldeColor: '' },
    { id: 'RES-2026-076', date: '14/06/2026', client: 'Kouamé Yves', phone: '01 23 45 67 89', icon: 'phone', iconColor: 'text-gray-400', email: '', prestDate: '29 Juin 2026', prestDetails: '', bateau: 'Catamaran "Lagune Express"', statut: 'Confirmée', statutColor: 'bg-green-100 text-green-700 border-green-200', total: '180 000', solde: '', soldeColor: '' },
    { id: 'RES-2026-077', date: '15/06/2026', client: 'Soro Naminata', phone: '07 11 22 33 44', icon: 'phone', iconColor: 'text-gray-400', email: '', prestDate: '30 Juin 2026', prestDetails: '', bateau: 'Speedboat "Rapide"', statut: 'Brouillon', statutColor: 'bg-blue-100 text-blue-700 border-blue-200', total: '85 000', solde: '', soldeColor: '' },
    { id: 'RES-2026-078', date: '16/06/2026', client: 'Yao Patrick', phone: '05 99 88 77 66', icon: 'phone', iconColor: 'text-gray-400', email: '', prestDate: '02 Juil 2026', prestDetails: '', bateau: 'Yacht "VIP Ebrié"', statut: 'Confirmée', statutColor: 'bg-green-100 text-green-700 border-green-200', total: '600 000', solde: '', soldeColor: '' }
];

export default function ReservationsPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Nouveaux états UX
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReservation, setSelectedReservation] = useState<any>(null);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
    
    // États Formulaire de création
    const [clientName, setClientName] = useState('');
    const [packPrice, setPackPrice] = useState(0);
    const [optionsPrice, setOptionsPrice] = useState(0);
    const [totalMontant, setTotalMontant] = useState(0);

    useEffect(() => {
        setTotalMontant(packPrice + optionsPrice);
    }, [packPrice, optionsPrice]);

    const handleActionPlaceholder = (actionName: string) => {
        setNotification({ message: \`Fonctionnalité "\${actionName}" en cours de développement.\`, type: 'info' });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleOptionChange = (e: any) => {
        const price = parseInt(e.target.dataset.price) || 0;
        if (e.target.checked) {
            setOptionsPrice(prev => prev + price);
        } else {
            setOptionsPrice(prev => prev - price);
        }
    };

    const handleOpenDetails = (reservation: any) => {
        setSelectedReservation(reservation);
        setIsDetailsModalOpen(true);
    };

    const filteredReservations = initialReservations.filter(res => {
        const term = (searchTerm || "").toLowerCase();
        return res.client.toLowerCase().includes(term) || 
               res.phone.includes(term) || 
               res.id.toLowerCase().includes(term);
    });`;

const searchStr = `export default function ReservationsPage() {\n    const [activeTab, setActiveTab] = useState('all');\n    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);\n    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);`;
content = content.replace(searchStr, dataReplacement);


// 2. Sidebar mobile
content = content.replace(`<aside className="w-64 bg-white shadow-xl flex flex-col hidden md:flex z-30 relative shrink-0">`, 
`{/* Overlay mobile */}
    {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
    )}
    <aside className={"w-64 bg-white shadow-xl flex flex-col z-50 fixed inset-y-0 left-0 transform " + (isSidebarOpen ? "translate-x-0" : "-translate-x-full") + " md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0"}>
        <button onClick={() => setIsSidebarOpen(false)} className="absolute right-4 top-4 md:hidden text-gray-400 hover:text-gray-600 z-50">
            <i className="fa-solid fa-times text-xl"></i>
        </button>`);

// 3. Header mobile menu button
content = content.replace(`<div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-blue-400 transition">
                    <i className="fa-solid fa-search text-gray-400"></i>
                    <input type="text" placeholder="Rechercher une réservation (N°, Nom, Téléphone)..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
                </div>`,
`<div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition">
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>
                    <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-72 md:w-96 focus-within:ring-2 focus-within:ring-blue-400 transition">
                        <i className="fa-solid fa-search text-gray-400"></i>
                        <input type="text" placeholder="Recherche rapide..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
                    </div>
                </div>`);

// 4. Search input
content = content.replace(`<input type="text" id="searchInput"  placeholder="Ex: Armand, 0707..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />`,
`<input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} id="searchInput" placeholder="Ex: Armand, 0707..." className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />`);

// 5. Table Body replacement
const tbodyStart = `<tbody id="reservationsTableBody"`;
const tbodyEnd = `</tbody>`;
const startIndex = content.indexOf(tbodyStart);
const endIndex = content.indexOf(tbodyEnd) + tbodyEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
    const tbodyReplacement = `<tbody id="reservationsTableBody" className="text-sm divide-y divide-gray-100">
                            {filteredReservations.map((res, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50 transition">
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-gray-900">{res.id}</span>
                                    {res.date && <div className="text-xs text-gray-400 mt-0.5">Créé le {res.date}</div>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-800">{res.client}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {res.phone && <><i className={"fa-solid fa-" + res.icon + " " + res.iconColor + " mr-1"}></i>{res.phone}</>}
                                        {res.email && <><i className={"fa-solid fa-" + res.icon + " " + res.iconColor + " mr-1"}></i>{res.email}</>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-gray-800"><i className="fa-regular fa-calendar mr-1"></i>{res.prestDate}</div>
                                    {res.prestDetails && <div className="text-xs text-gray-500 mt-0.5"><i className="fa-regular fa-clock mr-1"></i>{res.prestDetails}</div>}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{res.bateau}</td>
                                <td className="px-6 py-4">
                                    <span className={"px-3 py-1 rounded-full text-xs font-semibold border " + res.statutColor}>{res.statut}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="font-bold text-gray-800">{res.total}</div>
                                    {res.solde && <div className={"text-xs mt-0.5 " + res.soldeColor}>{res.solde}</div>}
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => handleOpenDetails(res)} className="text-blue-500 hover:text-blue-700 transition" title="Voir détails"><i className="fa-solid fa-eye"></i></button>
                                    <button onClick={() => handleActionPlaceholder("Modifier")} className="text-gray-400 hover:text-gray-600 transition" title="Modifier"><i className="fa-solid fa-pen"></i></button>
                                    <button onClick={() => handleActionPlaceholder("Paiement")} className="text-gray-400 hover:text-green-600 transition" title="Paiement"><i className="fa-solid fa-money-bill"></i></button>
                                </td>
                            </tr>
                            ))}
                            {filteredReservations.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Aucune réservation trouvée pour "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>`;
    content = content.substring(0, startIndex) + tbodyReplacement + content.substring(endIndex);
}

// 6. Form elements
content = content.replace(`<input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />`,
`<input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />`);

// select pack - ONLY first one!
const selectPackStart = `<select id="resPack"`;
const selectPackEnd = `</select>`;
const spStartIdx = content.indexOf(selectPackStart);
const spEndIdx = content.indexOf(selectPackEnd, spStartIdx) + selectPackEnd.length;
if (spStartIdx !== -1) {
    const selectPackReplacement = `<select id="resPack" onChange={(e) => {
                                const opt = e.target.options[e.target.selectedIndex];
                                setPackPrice(parseInt(opt.getAttribute('data-price') || '0'));
                            }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50">
                                <option value="" data-price="0">-- Choisir un pack --</option>
                                <option value="mariage" data-price="800000">Demande en mariage Premium (800 000 FCFA)</option>
                                <option value="anniversaire" data-price="600000">Anniversaire Premium (600 000 FCFA)</option>
                                <option value="corporate" data-price="1000000">Corporate Premium (1 000 000 FCFA)</option>
                            </select>`;
    content = content.substring(0, spStartIdx) + selectPackReplacement + content.substring(spEndIdx);
}

content = content.replace(`<input type="number" id="resMontant" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 bg-gray-100 cursor-not-allowed" readOnly placeholder="0" />`,
`<input type="number" id="resMontant" value={totalMontant} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 bg-gray-100 cursor-not-allowed" readOnly placeholder="0" />`);

content = content.replace(`<input type="checkbox" id="opt_deco" defaultValue="deco_romantique" data-price="50000"  className="mr-2" />`, `<input type="checkbox" onChange={handleOptionChange} data-price="50000" className="mr-2" />`);
content = content.replace(`<input type="checkbox" id="opt_photo" defaultValue="photo" data-price="100000"  className="mr-2" />`, `<input type="checkbox" onChange={handleOptionChange} data-price="100000" className="mr-2" />`);
content = content.replace(`<input type="checkbox" id="opt_dj" defaultValue="dj" data-price="200000"  className="mr-2" />`, `<input type="checkbox" onChange={handleOptionChange} data-price="200000" className="mr-2" />`);

content = content.replace(`<button className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md">Enregistrer la réservation</button>`,
`<button disabled={packPrice === 0 || clientName.trim() === ''} onClick={() => { setNotification({ message: 'Réservation enregistrée avec succès !', type: 'success' }); setIsReservationModalOpen(false); setClientName(''); setPackPrice(0); setTimeout(() => setNotification(null), 3000); }} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Enregistrer la réservation</button>`);

// 7. Details modal
content = content.replace(`<h3 className="text-lg font-bold text-gray-800">Détails de la Réservation <span className="text-blue-600">RES-2026-068</span></h3>`,
`<h3 className="text-lg font-bold text-gray-800">Détails de la Réservation <span className="text-blue-600">{selectedReservation?.id || 'RES-2026-068'}</span></h3>`);

content = content.replace(`<p className="font-medium text-gray-800">Koffi Armand</p>\n                        <p className="text-sm text-gray-500"><i className="fa-brands fa-whatsapp text-green-500 mr-1"></i>07 07 12 34 56</p>`,
`<p className="font-medium text-gray-800">{selectedReservation?.client || 'Koffi Armand'}</p>\n                        <p className="text-sm text-gray-500"><i className={"fa-solid fa-" + (selectedReservation?.icon || 'whatsapp') + " " + (selectedReservation?.iconColor || 'text-green-500') + " mr-1"}></i>{selectedReservation?.phone || selectedReservation?.email || '07 07 12 34 56'}</p>`);

content = content.replace(`<p className="font-medium text-gray-800">Catamaran "Lagune Express"</p>\n                        <p className="text-sm text-gray-500"><i className="fa-regular fa-clock mr-1"></i>12 Juin 2026, 14:00 (3h)</p>`,
`<p className="font-medium text-gray-800">{selectedReservation?.bateau || 'Catamaran "Lagune Express"'}</p>\n                        <p className="text-sm text-gray-500"><i className="fa-regular fa-clock mr-1"></i>{selectedReservation?.prestDate}, {selectedReservation?.prestDetails}</p>`);

content = content.replace(`<p className="font-medium text-gray-800">Total : 150 000 FCFA</p>\n                        <p className="text-sm text-green-600 font-medium">Solde restant : 0 FCFA</p>`,
`<p className="font-medium text-gray-800">Total : {selectedReservation?.total || '150 000'} FCFA</p>\n                        <p className={"text-sm font-medium " + (selectedReservation?.soldeColor || 'text-green-600')}>{selectedReservation?.solde || 'Solde restant : 0 FCFA'}</p>`);

// 8. Toast notification
content = content.replace(`        </div>\n    );\n}`,
`        {/* Toast Notification */}
        {notification && (
            <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300">
                <div className={\`flex items-center px-6 py-4 rounded-xl shadow-2xl border \${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'}\`}>
                    <div className={\`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 \${notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}\`}>
                        <i className={\`fa-solid \${notification.type === 'success' ? 'fa-check' : 'fa-info'}\`}></i>
                    </div>
                    <p className="font-semibold text-sm">{notification.message}</p>
                    <button onClick={() => setNotification(null)} className="ml-6 text-gray-400 hover:text-gray-600 transition">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
            </div>
        )}

        </div>
    );
}`);

fs.writeFileSync('src/app/reservations/page.tsx', content, 'utf8');
console.log("Done flawlessly!");
