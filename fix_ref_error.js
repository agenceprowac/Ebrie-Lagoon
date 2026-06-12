const fs = require('fs');

let content = fs.readFileSync('src/app/reservations/page.tsx', 'utf8');

// Supprimer filteredReservations du début
const target1 = `    const filteredReservations = initialReservations.filter(res => {
        const term = (searchTerm || "").toLowerCase();
        return res.client.toLowerCase().includes(term) || 
               res.phone.includes(term) || 
               res.id.toLowerCase().includes(term);
    });\n\n`;
content = content.replace(target1, '');

// L'ajouter après handleOpenDetails
const target2 = `    const handleOpenDetails = (reservation: any) => {
        setSelectedReservation(reservation);
        setIsDetailsModalOpen(true);
    };`;
const replacement2 = `    const handleOpenDetails = (reservation: any) => {
        setSelectedReservation(reservation);
        setIsDetailsModalOpen(true);
    };

    const filteredReservations = initialReservations.filter(res => {
        const term = (searchTerm || "").toLowerCase();
        return res.client.toLowerCase().includes(term) || 
               res.phone.includes(term) || 
               res.id.toLowerCase().includes(term);
    });`;
content = content.replace(target2, replacement2);

fs.writeFileSync('src/app/reservations/page.tsx', content, 'utf8');
console.log("Fixed ReferenceError");
