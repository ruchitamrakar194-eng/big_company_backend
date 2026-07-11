const fs = require('fs');
const content = fs.readFileSync('c:/Users/Saif16/Desktop/big_pos/big-pos frontend/src/pages/admin/CustomerManagementPage.tsx', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('title') || line.includes('Header') || line.includes('PageHeader') || line.includes('Button') || line.includes('breadcrumb') || line.includes('Breadcrumb')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
