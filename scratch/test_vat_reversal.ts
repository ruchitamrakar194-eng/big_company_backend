import { reverseVATCalculation } from '../src/utils/pricingReversalUtils';

console.log("=== Testing VAT Reversal Calculations ===");

// Test 1: Standard 18% VAT (Type B)
// Input: 1,416 RWF
// Expected: Base: 1,200 RWF, VAT: 216 RWF
const resB = reverseVATCalculation(1416, 'B');
console.log("Type B (1,416 RWF):", resB);
if (resB.cleanBaseCost === 1200 && resB.vatAmount === 216) {
  console.log("✅ Type B Reversal Passed!");
} else {
  console.error("❌ Type B Reversal Failed!");
}

// Test 2: Compounded Excise 10% + 18% VAT (Type D)
// Input: 1,558 RWF
// Expected: Base: 1,200 RWF, Excise: 120 RWF, VAT: 238 RWF (Rounded)
const resD = reverseVATCalculation(1558, 'D');
console.log("Type D (1,558 RWF):", resD);
if (resD.cleanBaseCost === 1200 && resD.exciseAmount === 120 && resD.vatAmount === 238) {
  console.log("✅ Type D Reversal Passed!");
} else {
  console.error("❌ Type D Reversal Failed!");
}
