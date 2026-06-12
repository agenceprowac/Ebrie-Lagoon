const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf8');

const targetModalStart = `    <div id="newClientModal" className={\`fixed inset-0 z-50 items-center justify-center p-4 \${isNewClientModalOpen ? 'flex' : 'hidden'}\`}>
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsNewClientModalOpen(!isNewClientModalOpen)}></div>
    </div>`;

const restoredModal = `    <div id="newClientModal" className={\`fixed inset-0 z-50 items-center justify-center p-4 \${isNewClientModalOpen ? 'flex' : 'hidden'}\`}>
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsNewClientModalOpen(!isNewClientModalOpen)}></div>
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all scale-100 opacity-100 duration-300 ease-in-out">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Ajouter un Client</h3>
                <button onClick={() => setIsNewClientModalOpen(!isNewClientModalOpen)} className="text-gray-400 hover:text-red-500 transition text-xl"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
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
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 rounded-b-2xl">
                <button onClick={() => setIsNewClientModalOpen(!isNewClientModalOpen)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition">Annuler</button>
                <button onClick={handleSaveClient} disabled={!nom || !telephone} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Enregistrer</button>
            </div>
        </div>
    </div>`;

content = content.replace(targetModalStart, restoredModal);

fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
console.log('Restored modal');
