const fs = require('fs');

let content = fs.readFileSync('src/app/reservations/page.tsx', 'utf8');

// 1. Add Supabase import
if (!content.includes(`import { supabase }`)) {
    content = content.replace(`import { useState, useEffect } from 'react';`, 
`import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';`);
}

// 2. Remove initialReservations
const initResStart = `const initialReservations = [`;
const initResEnd = `];`;
const s1 = content.indexOf(initResStart);
if (s1 !== -1) {
    const e1 = content.indexOf(initResEnd, s1) + initResEnd.length;
    content = content.substring(0, s1) + content.substring(e1);
}

// 3. Update States
const stateTarget = `    // Nouveaux états UX
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReservation, setSelectedReservation] = useState<any>(null);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
    
    // États Formulaire de création
    const [clientName, setClientName] = useState('');
    const [packPrice, setPackPrice] = useState(0);
    const [optionsPrice, setOptionsPrice] = useState(0);
    const [totalMontant, setTotalMontant] = useState(0);`;

// Replace existing state block (adjusting for previous types)
const oldStateStart = `    // Nouveaux états UX`;
const oldStateEnd = `    const [totalMontant, setTotalMontant] = useState(0);`;
const s2 = content.indexOf(oldStateStart);
const e2 = content.indexOf(oldStateEnd, s2) + oldStateEnd.length;

if (s2 !== -1 && e2 !== -1) {
    const newStateStr = `    // Supabase Data
    const [reservations, setReservations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Nouveaux états UX
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReservation, setSelectedReservation] = useState<any>(null);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
    
    // États Formulaire de création
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [datePrestation, setDatePrestation] = useState('');
    const [heureDebut, setHeureDebut] = useState('');
    const [nbPersonnes, setNbPersonnes] = useState(1);
    
    const [packPrice, setPackPrice] = useState(0);
    const [packType, setPackType] = useState('');
    const [optionsPrice, setOptionsPrice] = useState(0);
    const [optionsList, setOptionsList] = useState<any>({});
    const [totalMontant, setTotalMontant] = useState(0);`;
    
    content = content.substring(0, s2) + newStateStr + content.substring(e2);
}

// 4. Update Effects and Handlers
const effectStart = `    useEffect(() => {
        setTotalMontant(packPrice + optionsPrice);
    }, [packPrice, optionsPrice]);`;

const s3 = content.indexOf(effectStart);
if (s3 !== -1) {
    const e3 = s3 + effectStart.length;
    
    const newEffectsStr = `    useEffect(() => {
        setTotalMontant(packPrice + optionsPrice);
    }, [packPrice, optionsPrice]);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('reservations')
                .select(\`
                    *,
                    clients (nom, telephone, email)
                \`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Format data for the table
            const formatted = data.map(r => ({
                id: r.numero_reference,
                date: new Date(r.created_at).toLocaleDateString('fr-FR'),
                client: r.clients?.nom || 'Inconnu',
                phone: r.clients?.telephone || '',
                icon: 'phone',
                iconColor: 'text-gray-400',
                email: r.clients?.email || '',
                prestDate: new Date(r.date_prestation).toLocaleDateString('fr-FR'),
                prestDetails: \`\${r.heure_debut?.substring(0,5) || ''} • \${r.nb_personnes} Pax\`,
                bateau: r.type_prestation,
                statut: r.statut,
                statutColor: r.statut === 'Confirmée' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200',
                total: r.montant_total?.toLocaleString() + ' FCFA',
                solde: \`Solde: \${(r.montant_total - (r.acompte || 0)).toLocaleString()}\`,
                soldeColor: 'text-red-500'
            }));
            
            setReservations(formatted);
        } catch (error: any) {
            console.error('Erreur fetch reservations:', error);
            setNotification({ message: 'Erreur lors du chargement des données', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveReservation = async () => {
        try {
            // 1. Create Client
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .insert([{ nom: clientName, telephone: clientPhone }])
                .select()
                .single();
                
            if (clientError) throw clientError;

            // 2. Create Reservation
            const refNumber = 'RES-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            
            const { error: resError } = await supabase
                .from('reservations')
                .insert([{
                    numero_reference: refNumber,
                    client_id: clientData.id,
                    date_prestation: datePrestation,
                    heure_debut: heureDebut,
                    heure_fin: heureDebut, // Simplification pour la maquette
                    type_prestation: packType || 'Standard',
                    nb_personnes: nbPersonnes,
                    montant_total: totalMontant,
                    options: optionsList
                }]);

            if (resError) throw resError;

            // Success
            setNotification({ message: 'Réservation enregistrée avec succès !', type: 'success' });
            setIsReservationModalOpen(false);
            
            // Reset form
            setClientName('');
            setClientPhone('');
            setDatePrestation('');
            setHeureDebut('');
            setNbPersonnes(1);
            setPackPrice(0);
            
            // Refresh data
            fetchReservations();
            
            setTimeout(() => setNotification(null), 3000);
        } catch (error: any) {
            console.error('Erreur save reservation:', error);
            setNotification({ message: 'Erreur lors de la sauvegarde: ' + error.message, type: 'error' });
            setTimeout(() => setNotification(null), 5000);
        }
    };`;
    
    content = content.substring(0, s3) + newEffectsStr + content.substring(e3);
}

// 5. Update Option Change handler to save optionsList and packType
content = content.replace(`        if (e.target.checked) {
            setOptionsPrice(prev => prev + price);
        } else {
            setOptionsPrice(prev => prev - price);
        }`,
`        const optionName = e.target.parentElement.innerText.trim();
        if (e.target.checked) {
            setOptionsPrice(prev => prev + price);
            setOptionsList((prev:any) => ({...prev, [optionName]: true}));
        } else {
            setOptionsPrice(prev => prev - price);
            const newList = {...optionsList};
            delete newList[optionName];
            setOptionsList(newList);
        }`);

content = content.replace(`setPackPrice(parseInt(opt.getAttribute('data-price') || '0'));`,
`setPackPrice(parseInt(opt.getAttribute('data-price') || '0'));\n                                setPackType(opt.innerText);`);


// 6. Update Filter target
content = content.replace(`const filteredReservations = initialReservations.filter`, `const filteredReservations = reservations.filter`);


// 7. Update form UI inputs
content = content.replace(`<input type="text" value={clientName}`, `<input type="text" value={clientName} required`);

// Client phone
const contactLabel = `<label className="block text-sm font-medium text-gray-700 mb-1">Contact (Email/Tél) *</label>
                            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />`;
content = content.replace(contactLabel, 
`<label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                            <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />`);

// Date and Time and Pax
content = content.replace(`<input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />`,
`<input type="date" value={datePrestation} onChange={e => setDatePrestation(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />`);

content = content.replace(`<input type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />`,
`<input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />`);

content = content.replace(`<input type="number" min="1" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />`,
`<input type="number" min="1" value={nbPersonnes} onChange={e => setNbPersonnes(parseInt(e.target.value))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />`);

// 8. Update Submit button
const oldSubmit = `<button disabled={packPrice === 0 || clientName.trim() === ''} onClick={() => { setNotification({ message: 'Réservation enregistrée avec succès !', type: 'success' }); setIsReservationModalOpen(false); setClientName(''); setPackPrice(0); setTimeout(() => setNotification(null), 3000); }} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Enregistrer la réservation</button>`;
const newSubmit = `<button disabled={packPrice === 0 || clientName.trim() === '' || clientPhone.trim() === '' || datePrestation === '' || heureDebut === ''} onClick={handleSaveReservation} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Enregistrer la réservation</button>`;

if (content.includes(oldSubmit)) {
    content = content.replace(oldSubmit, newSubmit);
} else {
    // regex fallback
    content = content.replace(/<button disabled=\{packPrice === 0 \|\| clientName\.trim\(\) === ''\}.*?Enregistrer la réservation<\/button>/, newSubmit);
}


// Add loading indicator to table
const tbodyStartIdx = content.indexOf(`<tbody id="reservationsTableBody"`);
const closeTbodyIdx = content.indexOf(`</tbody>`, tbodyStartIdx);
if (tbodyStartIdx !== -1) {
    const tableInside = content.substring(tbodyStartIdx, closeTbodyIdx + 8);
    const newTableInside = tableInside.replace(`{filteredReservations.map((res, idx) => (`, 
`{isLoading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Chargement des réservations...
                                    </td>
                                </tr>
                            )}
                            {!isLoading && filteredReservations.map((res, idx) => (`);
    
    content = content.replace(tableInside, newTableInside.replace(`{filteredReservations.length === 0 && (`, `{!isLoading && filteredReservations.length === 0 && (`));
}

// Write file
fs.writeFileSync('src/app/reservations/page.tsx', content, 'utf8');
console.log("Supabase logic injected!");
