const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf8');

const target = `    // Set default tab on mount
    useEffect(() => {
        // Just setting a default if needed
        if (activeTab === 'all') {
            setActiveTab('users'); // Default for parametres
        }
    }, []);`;

const replacement = `    const [clients, setClients] = useState<any[]>([]);
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
    };`;

content = content.replace(target, replacement);

fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
console.log('Update complete');
