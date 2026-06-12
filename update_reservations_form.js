const fs = require('fs');
let content = fs.readFileSync('src/app/reservations/page.tsx', 'utf8');

// 1. Add states
content = content.replace(
    "const [clientName, setClientName] = useState('');",
    "const [clientsList, setClientsList] = useState<any[]>([]);\n    const [clientId, setClientId] = useState('');\n    const [clientName, setClientName] = useState('');"
);

// 2. Add fetchClients inside useEffect
content = content.replace(
    "fetchReservations();",
    "fetchReservations();\n        fetchClients();"
);

// Add the fetchClients function right before fetchReservations
content = content.replace(
    "const fetchReservations = async () => {",
    "const fetchClients = async () => {\n        const { data } = await supabase.from('clients').select('id, nom, telephone');\n        if (data) setClientsList(data);\n    };\n\n    const fetchReservations = async () => {"
);

// 3. Update handleSaveReservation logic
const oldSaveLogic = `        try {
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
                    client_id: clientData.id,`;

const newSaveLogic = `        try {
            let finalClientId = clientId;
            // 1. Create Client if not exists
            if (!finalClientId) {
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .insert([{ nom: clientName, telephone: clientPhone }])
                    .select()
                    .single();
                    
                if (clientError) throw clientError;
                finalClientId = clientData.id;
            }

            // 2. Create Reservation
            const refNumber = 'RES-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            
            const { error: resError } = await supabase
                .from('reservations')
                .insert([{
                    numero_reference: refNumber,
                    client_id: finalClientId,`;

content = content.replace(oldSaveLogic, newSaveLogic);

// 4. Reset clientId in form reset
content = content.replace(
    "setClientName('');",
    "setClientName('');\n            setClientId('');"
);

// 5. Update the client inputs in the modal
const oldInputs = `                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client / Raison sociale *</label>
                            <input type="text" value={clientName} required onChange={(e) => setClientName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone / WhatsApp *</label>
                            <input type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>`;

const newInputs = `                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client / Raison sociale *</label>
                            <input 
                                type="text" 
                                list="clients-datalist" 
                                value={clientName} 
                                required 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setClientName(val);
                                    const existing = clientsList.find(c => c.nom === val);
                                    if (existing) {
                                        setClientId(existing.id);
                                        setClientPhone(existing.telephone || '');
                                    } else {
                                        setClientId('');
                                    }
                                }} 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="Tapez pour chercher ou créer un client"
                            />
                            <datalist id="clients-datalist">
                                {clientsList.map(c => <option key={c.id} value={c.nom}>{c.telephone}</option>)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone / WhatsApp *</label>
                            <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>`;

content = content.replace(oldInputs, newInputs);

fs.writeFileSync('src/app/reservations/page.tsx', content, 'utf8');
console.log("update complete");
