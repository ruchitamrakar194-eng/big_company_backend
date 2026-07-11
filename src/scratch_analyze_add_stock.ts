const fs = require('fs');
const content = fs.readFileSync('c:/Users/Saif16/Desktop/big_pos/big-pos frontend/src/pages/admin/ProductListingPage.tsx', 'utf-8'); // wait, the file is ProductListingPage.tsx or CustomerListingPage.tsx?
// Let's check files in c:/Users/Saif16/Desktop/big_pos/big-pos frontend/src/pages/admin
const dir = fs.readdirSync('c:/Users/Saif16/Desktop/big_pos/big-pos frontend/src/pages/admin');
console.log('Files in admin page dir:', dir);
