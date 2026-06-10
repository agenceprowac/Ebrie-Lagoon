const fs = require('fs');
const path = require('path');

const files = [
    'dashboard_prototype.html',
    'reservations_prototype.html',
    'finances_prototype.html',
    'flotte_prototype.html',
    'clients_prototype.html',
    'parametres_prototype.html'
];

const unifiedStyle = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Outfit', sans-serif; background-color: #f3f4f6; }
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); }
        .sidebar-item { transition: all 0.3s ease; border-radius: 0.5rem; }
        .sidebar-item:hover { background-color: #ebf5ff; color: #1d4ed8; transform: translateX(5px); }
        .sidebar-item.active { background-color: #2563eb; color: white; }
        
        /* Custom scrollbar for timeline */
        .timeline-scroll::-webkit-scrollbar {
            height: 6px;
        }
        .timeline-scroll::-webkit-scrollbar-thumb {
            background-color: #CBD5E1;
            border-radius: 4px;
        }
        
        /* Internal tabs */
        .tab-active {
            background-color: #F8FAFC;
            border-left: 3px solid #2563EB;
            color: #1E3A8A;
            font-weight: 600;
        }
    </style>
`;

const getSidebarHtml = (activePage) => `
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-xl flex flex-col hidden md:flex z-30 relative shrink-0">
        <div class="p-6 flex items-center justify-center border-b border-gray-100">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mr-3">
                <i class="fa-solid fa-water"></i>
            </div>
            <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Ebrié Lagoon
            </h1>
        </div>
        <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <div class="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Principal</div>
            <a href="dashboard_prototype.html" class="sidebar-item ${activePage === 'dashboard' ? 'active' : 'text-gray-600'} flex items-center px-4 py-3 text-sm font-medium">
                <i class="fa-solid fa-chart-pie w-6"></i> Tableau de bord
            </a>
            <a href="reservations_prototype.html" class="sidebar-item ${activePage === 'reservations' ? 'active' : 'text-gray-600'} flex items-center px-4 py-3 text-sm font-medium">
                <i class="fa-solid fa-calendar-check w-6"></i> Réservations
            </a>
            <a href="finances_prototype.html" class="sidebar-item ${activePage === 'finances' ? 'active' : 'text-gray-600'} flex items-center px-4 py-3 text-sm font-medium">
                <i class="fa-solid fa-file-invoice-dollar w-6"></i> Finances & Devis
            </a>
            <a href="flotte_prototype.html" class="sidebar-item ${activePage === 'flotte' ? 'active' : 'text-gray-600'} flex items-center px-4 py-3 text-sm font-medium">
                <i class="fa-solid fa-ship w-6"></i> Flotte & Opérations
            </a>
            <a href="incidents_prototype.html" class="sidebar-item ${activePage === 'incidents' ? 'active' : 'text-gray-600'} flex items-center px-4 py-3 text-sm font-medium">
                <i class="fa-solid fa-triangle-exclamation w-6"></i> Incidents
            </a>
            <a href="partenaires_prototype.html" class="sidebar-item ${activePage === 'partenaires' ? 'active' : 'text-gray-600'} flex items-center px-4 py-3 text-sm font-medium">
                <i class="fa-solid fa-handshake w-6"></i> Partenaires
            </a>
            
            <div class="px-2 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administration</div>
            <a href="clients_prototype.html" class="sidebar-item ${activePage === 'clients' ? 'active' : 'text-gray-600'} flex items-center px-4 py-3 text-sm font-medium">
                <i class="fa-solid fa-users w-6"></i> Clients
            </a>
            <a href="parametres_prototype.html" class="sidebar-item ${activePage === 'parametres' ? 'active' : 'text-gray-600'} flex items-center px-4 py-3 text-sm font-medium">
                <i class="fa-solid fa-gear w-6"></i> Paramètres
            </a>
        </nav>
        <div class="p-4 border-t border-gray-100">
            <button class="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition">
                <i class="fa-solid fa-sign-out-alt w-6"></i> Déconnexion
            </button>
        </div>
    </aside>
`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace Style
    const styleRegex = /<style>[\s\S]*?<\/style>/i;
    content = content.replace(styleRegex, unifiedStyle.trim());
    
    // Replace font-family Inter link with nothing if it exists (since we use Outfit now)
    content = content.replace(/<link href="https:\/\/fonts.googleapis.com\/css2\?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">/i, '');

    // Identify active page
    let activePage = file.split('_')[0];
    
    // Replace Sidebar
    const sidebarRegex = /<!-- Sidebar -->[\s\S]*?<\/aside>/i;
    content = content.replace(sidebarRegex, getSidebarHtml(activePage).trim());
    
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
});
