const fs = require('fs');
const file = 'src/app/parametres/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// First replace the flex layout wrapper
content = content.replace(
    '<div className="flex flex-1 gap-6 overflow-hidden">',
    '<div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">'
);

// Second replace the sidebar container
content = content.replace(
    '<div className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-1 h-fit">',
    '<div className="w-full lg:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-2 lg:p-4 flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1 h-fit overflow-x-auto shrink-0 hide-scrollbar">'
);

// Add shrink-0, whitespace-nowrap and lg:w-full to each button
content = content.replace(/w-full text-left px-4 py-3/g, 'whitespace-nowrap shrink-0 lg:w-full text-left px-4 py-3');

// Change border-l-3 to lg:border-l-3 for activeTab logic to look good on mobile
content = content.replace(/border-l-3 border-transparent/g, 'lg:border-l-3 lg:border-transparent');

fs.writeFileSync(file, content);
console.log("Parametres layout fixed.");
