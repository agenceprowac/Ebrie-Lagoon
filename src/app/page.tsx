"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { supabase } from '@/utils/supabase';

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const revChartRef = useRef<HTMLCanvasElement>(null);
    const canalChartRef = useRef<HTMLCanvasElement>(null);

    const [chiffreAffaires, setChiffreAffaires] = useState(0);
    const [reservationsCount, setReservationsCount] = useState(0);
    const [incidentsCount, setIncidentsCount] = useState(0);
    const [recentReservations, setRecentReservations] = useState<any[]>([]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount).replace('XOF', 'FCFA');
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            const { data: finances } = await supabase.from('finances').select('total_ttc');
            if (finances) {
                const total = finances.reduce((acc, curr) => acc + (curr.total_ttc || 0), 0);
                setChiffreAffaires(total);
            }

            const { count: resCount } = await supabase.from('reservations').select('*', { count: 'exact', head: true });
            if (resCount !== null) setReservationsCount(resCount);

            const { count: incCount } = await supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('statut', 'En cours');
            if (incCount !== null) setIncidentsCount(incCount);

            const { data: recentRes } = await supabase.from('reservations')
                .select('numero_reference, clients(nom), date_prestation, montant_total, statut')
                .order('created_at', { ascending: false })
                .limit(5);
            if (recentRes) setRecentReservations(recentRes);
        };
        fetchDashboardData();

        let revChartInstance: Chart | null = null;
        let canalChartInstance: Chart | null = null;

        if (revChartRef.current) {
            const ctx = revChartRef.current.getContext('2d');
            if (ctx) {
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(37, 99, 235, 0.5)');
                gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

                revChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                        datasets: [{
                            label: 'Revenus (FCFA)',
                            data: [0, 0, 0, 0, 0, 0],
                            borderColor: '#2563eb',
                            backgroundColor: gradient,
                            borderWidth: 3,
                            pointBackgroundColor: '#fff',
                            pointBorderColor: '#2563eb',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }
        }

        if (canalChartRef.current) {
            const ctx = canalChartRef.current.getContext('2d');
            if (ctx) {
                canalChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['WhatsApp', 'Site Web', 'Téléphone', 'Partenaires'],
                        datasets: [{
                            data: [0, 0, 0, 0],
                            backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'],
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: {
                            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
                        }
                    }
                });
            }
        }

        return () => {
            if (revChartInstance) revChartInstance.destroy();
            if (canalChartInstance) canalChartInstance.destroy();
        };
    }, []);

    return (
        <div className="flex h-screen overflow-hidden text-gray-800 bg-slate-50 font-sans">
            {/* Sidebar */}
            {/* Overlay mobile */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={"w-64 bg-white shadow-xl flex flex-col z-50 fixed inset-y-0 left-0 transform " + (isSidebarOpen ? "translate-x-0" : "-translate-x-full") + " md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0"}>
                <button onClick={() => setIsSidebarOpen(false)} className="absolute right-4 top-4 md:hidden text-gray-400 hover:text-gray-600 z-50">
                    <i className="fa-solid fa-times text-xl"></i>
                </button>
                <div className="p-6 flex items-center justify-center border-b border-gray-100">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mr-3">
                        <i className="fa-solid fa-water"></i>
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                        Ebrié Lagoon
                    </h1>
                </div>
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <div className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Principal</div>
                    <Link href="/" className="sidebar-item active bg-blue-600 text-white flex items-center px-4 py-3 text-sm font-medium rounded-lg">
                        <i className="fa-solid fa-chart-pie w-6"></i> Tableau de bord
                    </Link>
                    <Link href="/reservations" className="sidebar-item text-gray-600 hover:bg-blue-50 hover:text-blue-700 flex items-center px-4 py-3 text-sm font-medium rounded-lg transition">
                        <i className="fa-solid fa-calendar-check w-6"></i> Réservations
                    </Link>
                    <Link href="/finances" className="sidebar-item text-gray-600 hover:bg-blue-50 hover:text-blue-700 flex items-center px-4 py-3 text-sm font-medium rounded-lg transition">
                        <i className="fa-solid fa-file-invoice-dollar w-6"></i> Finances & Devis
                    </Link>
                    <Link href="/flotte" className="sidebar-item text-gray-600 hover:bg-blue-50 hover:text-blue-700 flex items-center px-4 py-3 text-sm font-medium rounded-lg transition">
                        <i className="fa-solid fa-ship w-6"></i> Flotte & Opérations
                    </Link>
                    <Link href="/incidents" className="sidebar-item text-gray-600 hover:bg-blue-50 hover:text-blue-700 flex items-center px-4 py-3 text-sm font-medium rounded-lg transition">
                        <i className="fa-solid fa-triangle-exclamation w-6"></i> Incidents
                    </Link>
                    <Link href="/partenaires" className="sidebar-item text-gray-600 hover:bg-blue-50 hover:text-blue-700 flex items-center px-4 py-3 text-sm font-medium rounded-lg transition">
                        <i className="fa-solid fa-handshake w-6"></i> Partenaires
                    </Link>

                    <div className="px-2 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administration</div>
                    <Link href="/clients" className="sidebar-item text-gray-600 hover:bg-blue-50 hover:text-blue-700 flex items-center px-4 py-3 text-sm font-medium rounded-lg transition">
                        <i className="fa-solid fa-users w-6"></i> Clients
                    </Link>
                    <Link href="/parametres" className="sidebar-item text-gray-600 hover:bg-blue-50 hover:text-blue-700 flex items-center px-4 py-3 text-sm font-medium rounded-lg transition">
                        <i className="fa-solid fa-gear w-6"></i> Paramètres
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition">
                        <i className="fa-solid fa-sign-out-alt w-6"></i> Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition">
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>
                    <div className="hidden sm:flex items-center bg-gray-100 rounded-full px-4 py-2 w-72 md:w-96 focus-within:ring-2 focus-within:ring-blue-400 transition">
                            <i className="fa-solid fa-search text-gray-400"></i>
                            <input type="text" placeholder="Rechercher une réservation, un client..." className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
                        </div>
                </div>
                        <div className="flex items-center space-x-4">
                            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition">
                                <i className="fa-solid fa-bell text-xl"></i>
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <div className="flex items-center space-x-3 border-l pl-4 border-gray-200 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                                <img src="https://ui-avatars.com/api/?name=Lionel+Vithiano&background=0D8ABC&color=fff" alt="User" className="w-9 h-9 rounded-full shadow-sm" />
                                <div className="hidden md:block text-sm">
                                    <p className="font-semibold text-gray-700">M. Lionel Vithiano</p>
                                    <p className="text-xs text-gray-500">Administrateur</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-6 lg:p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Aperçu de l'Activité</h2>
                            <p className="text-sm text-gray-500">Statistiques du mois en cours (Juin 2026)</p>
                        </div>
                        <Link href="/reservations" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition transform hover:-translate-y-0.5 text-sm font-medium flex items-center">
                            <i className="fa-solid fa-plus mr-2"></i> Nouvelle Réservation
                        </Link>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {/* Card 1 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Chiffre d'Affaires</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(chiffreAffaires)}</h3>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <i className="fa-solid fa-arrow-trend-up"></i>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-green-500 font-medium">+12%</span>
                                <span className="text-gray-400 ml-2">vs mois précédent</span>
                            </div>
                        </div>
                        {/* Card 2 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Réservations</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{reservationsCount}</h3>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <i className="fa-solid fa-calendar-check"></i>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <span className="text-gray-400 font-medium">À jour</span>
                                <span className="text-gray-400 ml-2">en temps réel</span>
                            </div>
                        </div>
                        {/* Card 3 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Contrôles Validés</p>
                                    <h3 className="text-2xl font-bold text-gray-800">100%</h3>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <i className="fa-solid fa-clipboard-check"></i>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <span>Opérations conformes</span>
                            </div>
                        </div>
                        {/* Card 4 */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden">
                            {incidentsCount > 0 && <div className="absolute right-0 top-0 w-2 h-full bg-red-500"></div>}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Incidents Actifs</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{incidentsCount}</h3>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <Link href="/incidents" className="text-red-500 font-medium cursor-pointer hover:underline">Voir les détails <i className="fa-solid fa-arrow-right ml-1"></i></Link>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Revenue Chart */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution des Revenus</h3>
                            <div className="relative h-64 w-full">
                                <canvas ref={revChartRef}></canvas>
                            </div>
                        </div>
                        {/* Canal Chart */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Réservations par Canal</h3>
                            <div className="relative h-64 w-full flex items-center justify-center">
                                <canvas ref={canalChartRef}></canvas>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Dernières Réservations</h3>
                            <Link href="/reservations" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Tout voir</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-3 font-medium">N° Réservation</th>
                                        <th className="px-6 py-3 font-medium">Client</th>
                                        <th className="px-6 py-3 font-medium">Date Prestation</th>
                                        <th className="px-6 py-3 font-medium">Montant</th>
                                        <th className="px-6 py-3 font-medium">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-100">
                                    {recentReservations.length > 0 ? (
                                        recentReservations.map((res, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-900">{res.numero_reference}</td>
                                                <td className="px-6 py-4 text-gray-600">{res.clients?.nom || 'N/A'}</td>
                                                <td className="px-6 py-4 text-gray-600">{new Date(res.date_prestation).toLocaleDateString('fr-FR')}</td>
                                                <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(res.montant_total || 0)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 inline-block rounded-full text-xs font-semibold border ${res.statut === 'Confirmée' ? 'bg-green-100 text-green-700 border-green-200' : res.statut === 'Terminée' ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                                        {res.statut}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                Aucune réservation récente.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
