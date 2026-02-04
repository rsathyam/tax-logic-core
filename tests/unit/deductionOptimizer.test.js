
import { describe, it, expect } from 'vitest';
import { analyzeDeductionOptimizations } from '../../src/optimizations/deductionOptimizer.js';
import { STANDARD_DEDUCTIONS_2025 } from '../../src/calculations/calculateTax.js';
import { CATEGORY } from '../../src/optimizations/taxOptimizer.js';

describe('Deduction Optimizer', () => {

    describe('Itemized vs Standard', () => {
        it('should recommend switching to Itemized if deductions exceed Standard', () => {
            const data = {
                filingStatus: 'single',
                deductionType: 'standard',
                // Itemized deductions > 15,000 (Single Standard)
                medicalExpenses: 5000,
                // Only exceding 7.5% AGI counts, but optimizer sums raw inputs for check
                // Check implementation: it sums raw inputs.
                stateLocalTaxes: 8000,
                mortgageInterest: 10000,
                charityCash: 2000,
                // Total ~25k
                totalWages: 100000
            };

            const result = analyzeDeductionOptimizations(data);
            const opt = result.find(o => o.id === 'deduction-switch-to-itemized');

            expect(opt).toBeDefined();
            expect(opt.potentialSavings).toBeGreaterThan(0);
        });

        it('should recommend Standard if Itemized is selected but lower', () => {
            const data = {
                filingStatus: 'single',
                deductionType: 'itemized',
                stateLocalTaxes: 2000,
                mortgageInterest: 0,
                charityCash: 0,
                totalWages: 100000
            };

            const result = analyzeDeductionOptimizations(data);
            const opt = result.find(o => o.id === 'deduction-switch-to-standard');

            expect(opt).toBeDefined();
        });
    });

    describe('Charitable Bunching', () => {
        it('should recommend bunching if close to itemizing limit', () => {
            const standard = STANDARD_DEDUCTIONS_2025.single; // 15,000
            const data = {
                filingStatus: 'single',
                deductionType: 'standard',
                stateLocalTaxes: 10000, // SALT Cap
                mortgageInterest: 3000,
                // Total 13,000. Gap 2,000.
                charityCash: 2000,
                totalWages: 100000
            };

            const result = analyzeDeductionOptimizations(data);
            const opt = result.find(o => o.id === 'deduction-charitable-bunching');

            expect(opt).toBeDefined();
            expect(opt.description).toContain('Bundle two years');
        });
    });

    describe('Qualified Charitable Distribution (QCD)', () => {
        it('should recommend QCD for age 70.5+ with IRA distributions', () => {
            const data = {
                birthDate: '1950-01-01', // Age > 75
                taxableIra: 20000,
                charityCash: 5000,
                totalWages: 20000
            };

            const result = analyzeDeductionOptimizations(data);
            const opt = result.find(o => o.id === 'deduction-qcd');

            expect(opt).toBeDefined();
            expect(opt.potentialSavings).toBeGreaterThan(0);
        });

        it('should NOT recommend QCD if under age 70.5', () => {
            const data = {
                birthDate: '1980-01-01',
                taxableIra: 20000,
                charityCash: 5000
            };

            const result = analyzeDeductionOptimizations(data);
            const opt = result.find(o => o.id === 'deduction-qcd');

            expect(opt).toBeUndefined();
        });
    });

});
