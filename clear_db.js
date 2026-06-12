const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const envLines = envFile.split('\n');
const envVars = {};
for (const line of envLines) {
    if (line && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        envVars[key.trim()] = valueParts.join('=').trim().replace(/['"]/g, '');
    }
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

console.log("URL:", supabaseUrl ? "OK" : "Missing");
console.log("KEY:", supabaseKey ? "OK" : "Missing");

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDB() {
    console.log("Nettoyage de la base de données en cours...");
    try {
        const { error: resError } = await supabase.from('reservations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (resError) throw resError;
        console.log("✅ Réservations effacées.");

        const { error: financeError } = await supabase.from('finances').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (financeError) throw financeError;
        console.log("✅ Finances effacées.");

        const { error: incidentError } = await supabase.from('incidents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (incidentError) throw incidentError;
        console.log("✅ Incidents effacés.");

        const { error: clientError } = await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (clientError) throw clientError;
        console.log("✅ Clients effacés.");
        
        console.log("Nettoyage terminé avec succès !");
    } catch (e) {
        console.error("Erreur:", e);
    }
}

clearDB();
