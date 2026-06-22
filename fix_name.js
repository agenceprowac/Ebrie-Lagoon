const fs = require('fs');
const path = require('path');

const targetStr = '<p className="font-semibold text-gray-700">M. Lionel Vithiano</p>';
const replacementStr = '<p className="font-semibold text-gray-700">{currentUserName}</p>';

const anchorStr = 'const [isSidebarOpen, setIsSidebarOpen] = useState(false);';
const injectStr = `const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentUserName, setCurrentUserName] = useState('Chargement...');

    useEffect(() => {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
            try {
                setCurrentUserName(JSON.parse(currentUserStr).name);
            } catch (e) {
                setCurrentUserName('Administrateur');
            }
        } else {
            setCurrentUserName('Administrateur');
        }
    }, []);`;

const dirsToScan = [
    'c:\\Users\\HP\\.gemini\\FORMULAIRES_OPERATIONNELS_SUIVI_NUMERIQUE\\src\\app'
];

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            if (content.includes(targetStr)) {
                content = content.replace(new RegExp(targetStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacementStr);
                modified = true;
            }
            
            if (modified && content.includes(anchorStr) && !content.includes("const [currentUserName, setCurrentUserName] = useState('Chargement...');")) {
                content = content.replace(anchorStr, injectStr);
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Modified: ' + fullPath);
            }
        }
    }
}

scanDir(dirsToScan[0]);
console.log('Done.');
