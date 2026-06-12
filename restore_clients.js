const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf8');

const badTop = `"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">`;

const goodTop = `"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function ClientsPage() {
    const [activeTab, setActiveTab] = useState('all');
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

    return (
        <div className="flex h-screen overflow-hidden text-gray-800 bg-slate-50 font-sans">
            <aside className="w-64 bg-white shadow-xl flex flex-col hidden md:flex z-30 relative shrink-0">
                <div className="p-6 flex items-center justify-center border-b border-gray-100">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mr-3">
                        <i className="fa-solid fa-water"></i>
                    </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">`;

content = content.replace(badTop, goodTop);

fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
console.log('Fixed top');
