import * as XLSX from 'xlsx';

// Create template data
const templateData = [
  ['name', 'age (optionnel)', 'gender'], // Header row
  ['Jean Dupont', 25, 'MALE'],
  ['Marie Martin', '', 'FEMALE'], // Age left blank on purpose
  ['Pierre Durand', 45, 'MALE'],
  ['Sophie Leroy', 28, 'FEMALE']
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet(templateData);

// Set column widths
worksheet['!cols'] = [
  { wch: 15 }, // name column
  { wch: 5 },  // age column
  { wch: 8 }   // gender column
];

// Add to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

// Write file
XLSX.writeFile(workbook, 'public/import-template.xlsx');

console.log('Excel template generated: public/import-template.xlsx');
