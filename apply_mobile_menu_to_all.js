const fs = require('fs');

const filesToUpdate = [
    'src/app/page.tsx',
    'src/app/clients/page.tsx',
    'src/app/finances/page.tsx',
    'src/app/flotte/page.tsx',
    'src/app/incidents/page.tsx',
    'src/app/parametres/page.tsx',
    'src/app/partenaires/page.tsx'
];

filesToUpdate.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Add useState for isSidebarOpen if missing
    if (!content.includes('isSidebarOpen')) {
        // Try replacing before the first useState
        if (content.includes('const [activeTab')) {
            content = content.replace(/const \[activeTab/, `const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n    const [activeTab`);
        } else if (content.includes('const [isEditMode')) { // Just another common state
            content = content.replace(/const \[isEditMode/, `const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n    const [isEditMode`);
        } else if (content.includes('const [users')) {
            content = content.replace(/const \[users/, `const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n    const [users`);
        } else {
             // Just find `export default function` and put it inside
             content = content.replace(/(export default function [^)]+\) {)/, `$1\n    const [isSidebarOpen, setIsSidebarOpen] = useState(false);`);
        }
    }

    // 2. Replace the aside tag
    content = content.replace(/<aside className="w-64[^>]*shrink-0">/, (match) => {
        if (match.includes('isSidebarOpen')) return match;
        return `{/* Overlay mobile */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={"w-64 bg-white shadow-xl flex flex-col z-50 fixed inset-y-0 left-0 transform " + (isSidebarOpen ? "translate-x-0" : "-translate-x-full") + " md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0"}>
                <button onClick={() => setIsSidebarOpen(false)} className="absolute right-4 top-4 md:hidden text-gray-400 hover:text-gray-600 z-50">
                    <i className="fa-solid fa-times text-xl"></i>
                </button>`;
    });

    // 3. Update the Header search bar area
    const searchBlockRegex = /(<div className="flex items-center bg-gray-100 rounded-full[^>]+>[\s\S]*?<input type="text"[^>]+>\s*<\/div>)/;
    if (searchBlockRegex.test(content) && !content.includes('isSidebarOpen(true)')) {
        content = content.replace(searchBlockRegex, (match) => {
            // Modify the match to include hidden sm:flex and md:w-96
            let newDiv = match.replace('className="flex items-center', 'className="hidden sm:flex items-center');
            newDiv = newDiv.replace('w-96', 'w-72 md:w-96');
            
            return `<div className="flex items-center space-x-3">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition">
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>
                    ${newDiv}
                </div>`;
        });
    }

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    } else {
        console.log(`No changes needed for ${file}`);
    }
});
console.log('Mobile menu applied successfully.');
