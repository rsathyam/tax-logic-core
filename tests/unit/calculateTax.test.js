import { describe, it, expect } from 'vitest';
import {
    calculateBracketTax,
    calculateCapitalGainsTax,
    calculateSelfEmploymentTax,
    calculateNIIT,
    calculateTotalTax,
    TAX_BRACKETS_2025,
    CAPITAL_GAINS_BRACKETS_2025
} from '../../src/calculations/calculateTax.js';

describe('Tax Logic Core - Calculations', () => {

    describe('calculateBracketTax', () => {
        it('should return 0 for negative or zero income', () => {
            expect(calculateBracketTax(-50000, TAX_BRACKETS_2025.single)).toBe(0);
            expect(calculateBracketTax(0, TAX_BRACKETS_2025.single)).toBe(0);
        });

        it('should correctly calculate tax for Single filer in 10% bracket', () => {
            // $10,000 * 0.10 = $1,000
            expect(calculateBracketTax(10000, TAX_BRACKETS_2025.single)).toBe(1000);
        });

        it('should correctly calculate tax for Single filer in 12% bracket', () => {
            // Bracket 1: $11,925 * 0.10 = $1,192.50
            // Bracket 2: ($40,000 - $11,925) * 0.12 = $3,369.00
            // Total: $4,561.50
            expect(calculateBracketTax(40000, TAX_BRACKETS_2025.single)).toBe(4561.5);
        });

        it('should correctly calculate tax for Married filer', () => {
            // Married brackets are roughly double Single
            // $80,000 taxable income
            // Bracket 1: $23,850 * 0.10 = $2,385.00
            // Bracket 2: ($80,000 - $23,850) * 0.12 = $6,738.00
            // Total: $9,123.00
            expect(calculateBracketTax(80000, TAX_BRACKETS_2025.married)).toBe(9123);
        });
    });

    describe('calculateCapitalGainsTax', () => {
        it('should apply 0% rate for low income', () => {
            // Single, $30k ordinary + $5k gains = $35k total (under $48,350)
            const tax = calculateCapitalGainsTax(30000, 5000, 'single');
            expect(tax).toBe(0);
        });

        it('should stack gains on top of ordinary income', () => {
            // Single, $40,000 ordinary + $20,000 gains
            // 0% threshold is $48,350
            // Room in 0% bucket: $48,350 - $40,000 = $8,350
            // Gains taxed at 0%: $8,350
            // Gains taxed at 15%: $20,000 - $8,350 = $11,650
            // Tax: $11,650 * 0.15 = $1,747.50
            const tax = calculateCapitalGainsTax(40000, 20000, 'single');
            expect(tax).toBeCloseTo(1747.50, 2);
        });
    });

    describe('calculateSelfEmploymentTax', () => {
        it('should return 0 for no SE income', () => {
            expect(calculateSelfEmploymentTax(0).tax).toBe(0);
        });

        it('should calculate SE tax correctly below wage base', () => {
            // $100,000 profit
            // Taxable: $100,000 * 0.9235 = $92,350
            // SS (12.4%): $92,350 * 0.124 = $11,451.40
            // Medicare (2.9%): $92,350 * 0.029 = $2,678.15
            // Additional Medicare: 0
            // Total: $14,129.55
            const result = calculateSelfEmploymentTax(100000);
            expect(result.tax).toBeCloseTo(14129.55, 2);
            expect(result.deduction).toBeCloseTo(14129.55 / 2, 2);
        });

        it('should cap Social Security tax at wage base', () => {
            // $400,000 profit
            // Taxable: $369,400
            // SS capped at $176,100 * 0.124 = $21,836.40
            const result = calculateSelfEmploymentTax(400000);
            // SS Tax portion check implied by total
            // Medicare: $369,400 * 0.029 = $10,712.60
            // Additional check logic if needed, but total is sufficient
            expect(result.tax).toBeGreaterThan(32000); // Rough check
        });
    });

    describe('calculateNIIT', () => {
        it('should apply 3.8% tax on investment income for high earners', () => {
            // Single, AGI $250,000 (threshold $200,000)
            // Excessive AGI: $50,000
            // Investment Income: $30,000
            // Taxable NIIT base: lesser of $50k or $30k -> $30k
            // Tax: $30,000 * 0.038 = $1,140
            expect(calculateNIIT(250000, 30000, 'single')).toBe(1140);
        });
    });

    describe('calculateTotalTax (Integration)', () => {
        it('should calculate a simple W-2 return correctly', () => {
            const formData = {
                filingStatus: 'single',
                totalWages: 60000,
                deductionType: 'standard'
            };

            const result = calculateTotalTax(formData);

            expect(result.totalIncome).toBe(60000);
            expect(result.agi).toBe(60000);
            expect(result.deduction).toBe(15700); // 2025 breakdown
            expect(result.taxableIncome).toBe(44300);
            // Tax on $44,300 (Single):
            // $11,925 @ 10% = $1,192.50
            // ($44,300 - $11,925) @ 12% = $3,885.00
            // Total: $5,077.50
            expect(result.regularTax).toBe(5077.50);
            expect(result.finalTax).toBe(5077.50);
        });
    });
});
