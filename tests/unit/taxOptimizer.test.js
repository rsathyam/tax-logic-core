import { describe, it, expect } from 'vitest';
import {
    analyzeTaxOptimizations,
    DIFFICULTY,
    CATEGORY
} from '../../src/optimizations/taxOptimizer.js';

describe('Tax Logic Core - Optimizer Orchestration', () => {

    it('should identify Standard Deduction optimization for low expenses', () => {
        const taxData = {
            filingStatus: 'single',
            deductionType: 'itemized', // Crucial: User is currently itemizing
            // Itemized expenses well below standard ($15,700)
            stateLocalTaxes: 2000,
            mortgageInterest: 0,
            charityCash: 500
        };

        const result = analyzeTaxOptimizations(taxData);

        // Should recommend switching to Standard
        const switchRec = result.optimizations.find(o => o.id === 'deduction-switch-to-standard');

        expect(switchRec).toBeDefined();
        expect(switchRec?.potentialSavings).toBeGreaterThan(0);
    });

    it('should recommend IRA contribution if not maxed out', () => {
        const taxData = {
            filingStatus: 'single',
            totalWages: 80000,
            iraDeduction: 0 // No contribution
        };

        const result = analyzeTaxOptimizations(taxData);
        // Correct ID from retirementOptimizer.js
        const iraRec = result.optimizations.find(o => o.id === 'retirement-ira');

        expect(iraRec).toBeDefined();
        expect(iraRec?.category).toBe(CATEGORY.RETIREMENT);
    });

    it('should return a summary with optimization count', () => {
        const taxData = {
            filingStatus: 'single',
            totalWages: 60000
        };

        const result = analyzeTaxOptimizations(taxData);

        expect(result.summary).toBeDefined();
        expect(typeof result.summary.totalCount).toBe('number');
        expect(typeof result.totalPotentialSavings).toBe('number');
    });

    it('should handle missing data gracefully', () => {
        const emptyData = {};
        const result = analyzeTaxOptimizations(emptyData);

        expect(result.optimizations).toBeInstanceOf(Array);
        // Relax check as some defaults might apply (like prompts)
        expect(typeof result.totalPotentialSavings).toBe('number');
    });
});
