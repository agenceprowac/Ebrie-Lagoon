const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Quick and dirty fix for typical French unescaped entities in JSX text
    // Only replace quotes that are surrounded by letters (e.g. l'incident -> l&apos;incident)
    // Or quotes followed by a space (e.g. d' ajouter -> d&apos; ajouter)
    content = content.replace(/([a-zA-Z])'([a-zA-Z])/g, '$1&apos;$2');
    content = content.replace(/([a-zA-Z])' /g, '$1&apos; ');
    content = content.replace(/ '([a-zA-Z])/g, ' &apos;$1');
    
    // For common words
    content = content.replace(/l'([a-zA-Z])/gi, 'l&apos;$1');
    content = content.replace(/d'([a-zA-Z])/gi, 'd&apos;$1');
    content = content.replace(/qu'([a-zA-Z])/gi, 'qu&apos;$1');
    content = content.replace(/s'([a-zA-Z])/gi, 's&apos;$1');
    content = content.replace(/n'([a-zA-Z])/gi, 'n&apos;$1');
    content = content.replace(/c'([a-zA-Z])/gi, 'c&apos;$1');
    content = content.replace(/jusqu'([a-zA-Z])/gi, 'jusqu&apos;$1');
    content = content.replace(/aujourd'hui/gi, 'aujourd&apos;hui');
    
    fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            fixFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'src/app'));
console.log('Fixed entities');
