// Export PDF
export function exportPDF() {
    const table = document.getElementById('presenceTable');
    if (!table) return alert("Tableau introuvable");

    // Créer le PDF avec jsPDF fourni par le CDN
    const doc = new window.jspdf.jsPDF();

    // Récupérer les headers et les données du tableau
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText);
    const data = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
        Array.from(tr.querySelectorAll('td')).map(td => td.innerText)
    );

    // Générer le tableau dans le PDF
    doc.autoTable({
        head: [headers],
        body: data,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 10 }
    });

    // Sauvegarder le fichier
    doc.save("Presences.pdf");
}

// Export Excel
export function exportExcel() {
    const table = document.getElementById('presenceTable');
    if (!table) return alert("Tableau introuvable");

    // Créer le fichier Excel avec SheetJS
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, "Présences");

    // Télécharger le fichier
    XLSX.writeFile(wb, "Presences.xlsx");
}
