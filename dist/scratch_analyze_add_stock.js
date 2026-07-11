const fs = require('fs');
const content = fs.readFileSync('c:/Users/Saif16/Desktop/big_pos/big_company_backend/src/controllers/adminController.ts', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (line.includes('lastSettlementDate')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
