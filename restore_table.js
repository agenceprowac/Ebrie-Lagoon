const fs = require('fs');
let lines = fs.readFileSync('src/app/clients/page.tsx', 'utf8').split('\n');

const tableCode = `                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-4 font-medium">Client</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium text-center">Catégorie</th>
                                <th className="px-6 py-4 font-medium text-center">Réservations</th>
                                <th className="px-6 py-4 font-medium text-right">CA Total</th>
                                <th className="px-6 py-4 font-medium text-center">Dernière visite</th>
                                <th className="px-6 py-4 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-50">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Aucun client enregistré.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client: any) => (
                                    <tr key={client.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold mr-3 shadow-sm">
                                                    {client.nom ? client.nom.substring(0, 2).toUpperCase() : 'C'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{client.nom}</div>
                                                    <div className="text-xs text-gray-500">Ajouté le {new Date(client.created_at).toLocaleDateString('fr-FR')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-800"><i className="fa-solid fa-phone text-gray-400 w-4"></i> {client.telephone}</div>
                                            {client.email && <div className="text-gray-500 text-xs mt-1"><i className="fa-solid fa-envelope text-gray-400 w-4"></i> {client.email}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium border border-gray-200">Particulier</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold">-</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-800">
                                            - FCFA
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-500">
                                            -
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => setIsHistoryModalOpen(!isHistoryModalOpen)} className="px-3 py-1 bg-white border border-gray-200 shadow-sm text-blue-600 rounded hover:bg-blue-50 transition text-xs font-medium">Voir fiche</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Affichage de \`\${clients.length > 0 ? 1 : 0}\` à \`\${clients.length}\` sur \`\${clients.length}\` clients</span>`;

const startIdx = lines.findIndex(line => line.includes('<table className="w-full text-left border-collapse whitespace-nowrap">'));
const endIdx = lines.findIndex((line, i) => i > startIdx && line.includes('<div className="flex space-x-1">'));

if (startIdx !== -1 && endIdx !== -1) {
    lines.splice(startIdx, endIdx - startIdx, tableCode);
    fs.writeFileSync('src/app/clients/page.tsx', lines.join('\n'), 'utf8');
    console.log('Restored table successfully');
} else {
    console.log('Could not find table bounds');
}
