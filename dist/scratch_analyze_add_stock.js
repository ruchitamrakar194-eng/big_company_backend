const fs = require('fs');
const content = fs.readFileSync('c:/Users/Saif16/Desktop/big_pos/big-pos frontend/src/pages/retailer/AddStockPage.tsx', 'utf-8');
const lines = content.split('\n');
const start = 115;
const end = 145;
for (let i = start; i <= end; i++) {
    console.log(`${i}: ${lines[i - 1]}`);
}
