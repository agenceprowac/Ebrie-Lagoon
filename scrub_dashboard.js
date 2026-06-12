const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Charts
content = content.replace(`data: [1200000, 1900000, 1500000, 2200000, 2800000, 4520000],`, `data: [0, 0, 0, 0, 0, 0],`);
content = content.replace(`data: [45, 25, 20, 10],`, `data: [0, 0, 0, 0],`);

// 2. KPIs
content = content.replace(`<h3 className="text-2xl font-bold text-gray-800">4 520 000 FCFA</h3>`, `<h3 className="text-2xl font-bold text-gray-800">0 FCFA</h3>`);
content = content.replace(`<span className="text-green-500 font-medium"><i className="fa-solid fa-caret-up mr-1"></i>+12.5%</span>`, `<span className="text-gray-400 font-medium">-</span>`);

content = content.replace(`<h3 className="text-2xl font-bold text-gray-800">124</h3>`, `<h3 className="text-2xl font-bold text-gray-800">0</h3>`);
content = content.replace(`<span className="text-green-500 font-medium"><i className="fa-solid fa-caret-up mr-1"></i>+5</span>`, `<span className="text-gray-400 font-medium">0</span>`);

content = content.replace(`<h3 className="text-2xl font-bold text-gray-800">98%</h3>`, `<h3 className="text-2xl font-bold text-gray-800">0%</h3>`);
content = content.replace(`<span>Sur 45 sorties bateaux</span>`, `<span>Aucune sortie enregistrée</span>`);

content = content.replace(`<h3 className="text-2xl font-bold text-red-600">2</h3>`, `<h3 className="text-2xl font-bold text-gray-800">0</h3>`);

// 3. Table Rows
const tbodyStart = `<tbody className="text-sm divide-y divide-gray-100">`;
const tbodyEnd = `</tbody>`;
const startIndex = content.indexOf(tbodyStart);
const endIndex = content.indexOf(tbodyEnd) + tbodyEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
    const newTbody = `<tbody className="text-sm divide-y divide-gray-100">
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Aucune réservation récente.
                                        </td>
                                    </tr>
                                </tbody>`;
    content = content.substring(0, startIndex) + newTbody + content.substring(endIndex);
}

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log("Dashboard scrubbed!");
