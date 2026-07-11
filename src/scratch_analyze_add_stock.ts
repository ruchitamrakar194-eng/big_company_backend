const fs = require('fs');
const content = fs.readFileSync('c:/Users/Saif16/Desktop/big_pos/big-pos frontend/src/pages/consumer/RewardsPage.tsx', 'utf-8');
const lines = content.split('\n');

let print = false;
lines.forEach((line, idx) => {
  if (line.includes('handleSendToMeter') || line.includes('handleSendToMeter =')) {
    print = true;
  }
  if (print) {
    console.log(`${idx + 1}: ${line}`);
    if (line.includes('} catch') || line.trim() === '};') {
      // let's print a few more lines then stop
      print = false;
    }
  }
});
