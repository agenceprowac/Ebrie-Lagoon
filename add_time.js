const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\HP\\.gemini\\FORMULAIRES_OPERATIONNELS_SUIVI_NUMERIQUE\\src\\app';

function replaceInFile(filePath, searchRegex, replaceFunc) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (searchRegex.test(content)) {
        content = content.replace(searchRegex, replaceFunc);
        fs.writeFileSync(filePath, content);
        console.log(`Modified ${filePath}`);
    }
}

// 1. Reservations
replaceInFile(
    path.join(dir, 'reservations/page.tsx'),
    /\{res\.raw\?\.updated_by_name \|\| res\.raw\?\.created_by_name \|\| 'Système'\}/g,
    () => `<div><div className="font-medium text-gray-700">{res.raw?.updated_by_name || res.raw?.created_by_name || 'Système'}</div><div className="text-[10px] mt-0.5">{new Date(res.raw?.updated_at || res.raw?.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</div></div>`
);

// 2. Finances
replaceInFile(
    path.join(dir, 'finances/page.tsx'),
    /\{\(doc as any\)\.updated_by_name \|\| \(doc as any\)\.created_by_name \|\| 'Système'\}/g,
    () => `<div><div className="font-medium text-gray-700">{(doc as any).updated_by_name || (doc as any).created_by_name || 'Système'}</div><div className="text-[10px] mt-0.5">{new Date((doc as any).updated_at || (doc as any).created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</div></div>`
);

// 3. Incidents (inc and rec)
replaceInFile(
    path.join(dir, 'incidents/page.tsx'),
    /\{\(inc as any\)\.updated_by_name \|\| \(inc as any\)\.created_by_name \|\| 'Système'\}/g,
    () => `<div><div className="font-medium text-gray-700">{(inc as any).updated_by_name || (inc as any).created_by_name || 'Système'}</div><div className="text-[10px] mt-0.5">{new Date((inc as any).updated_at || (inc as any).created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</div></div>`
);
replaceInFile(
    path.join(dir, 'incidents/page.tsx'),
    /\{\(rec as any\)\.updated_by_name \|\| \(rec as any\)\.created_by_name \|\| 'Système'\}/g,
    () => `<div><div className="font-medium text-gray-700">{(rec as any).updated_by_name || (rec as any).created_by_name || 'Système'}</div><div className="text-[10px] mt-0.5">{new Date((rec as any).updated_at || (rec as any).created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</div></div>`
);

// 4. Flotte
replaceInFile(
    path.join(dir, 'flotte/page.tsx'),
    /\{\(navire as any\)\.updated_by_name \|\| \(navire as any\)\.created_by_name \|\| 'Système'\}/g,
    () => `<span><span className="block">{(navire as any).updated_by_name || (navire as any).created_by_name || 'Système'}</span><span className="block text-[10px] text-gray-500 font-normal mt-0.5">{new Date((navire as any).updated_at || (navire as any).created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span></span>`
);

// 5. Update payload - updated_at: new Date().toISOString()
function injectUpdatedAt(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const target = /updated_by_name:\s*currentUserName/g;
    if (target.test(content)) {
        content = content.replace(target, "updated_by_name: currentUserName,\n                        updated_at: new Date().toISOString()");
        fs.writeFileSync(filePath, content);
        console.log(`Injected updated_at in ${filePath}`);
    }
}

injectUpdatedAt(path.join(dir, 'reservations/page.tsx'));
injectUpdatedAt(path.join(dir, 'finances/page.tsx'));
injectUpdatedAt(path.join(dir, 'incidents/page.tsx'));
injectUpdatedAt(path.join(dir, 'flotte/page.tsx'));

console.log('Done.');
