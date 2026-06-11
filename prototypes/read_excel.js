const xlsx = require('xlsx');

const workbook = xlsx.readFile('FICHES_FORMULAIRES_OPERATIONNELS_SUIVI_NUMERIQUE.xlsx');

for (const sheetName of workbook.SheetNames) {
    console.log(`\n=== Sheet: ${sheetName} ===`);
    const sheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    // Print first 5 rows
    for (let i = 0; i < Math.min(5, json.length); i++) {
        console.log(json[i]);
    }
}
