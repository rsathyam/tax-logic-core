
import { describe, it, expect } from 'vitest';
import { analyzeFilingStatusOptimizations, checkHOHEligibility } from '../../src/optimizations/filingStatusOptimizer.js';
import { CATEGORY } from '../../src/optimizations/taxOptimizer.js';
import { STANDARD_DEDUCTIONS_2025 } from '../../src/calculations/calculateTax.js';

describe('Filing Status Optimizer', () => {

    describe('analyzeSingleToHOH', () => {
        it('should recommend Head of Household if Single with qualifying child', () => {
            const data = {
                filingStatus: 'single',
                dependents: [
                    { firstName: 'Junior', relationship: 'child', qualifyingChild: true }
                ],
                totalWages: 60000
            };

            const result = analyzeFilingStatusOptimizations(data);
            const hohOpt = result.find(o => o.id === 'filing-single-to-hoh');

            expect(hohOpt).toBeDefined();
            expect(hohOpt.potentialSavings).toBeGreaterThan(0);
            expect(hohOpt.description).toContain('Head of Household');
        });

        it('should NOT recommend HOH if no qualifying dependents', () => {
            const data = {
                filingStatus: 'single',
                dependents: [], // No dependents
                totalWages: 60000
            };

            const result = analyzeFilingStatusOptimizations(data);
            const hohOpt = result.find(o => o.id === 'filing-single-to-hoh');

            expect(hohOpt).toBeUndefined();
        });
    });

    describe('analyzeMFJvsMFS', () => {
        // MFS is usually NOT better, so we test that it is correctly NOT recommended
        // unless specific conditions met.

        it('should usually NOT recommend MFS for typical married situations', () => {
            const data = {
                filingStatus: 'married',
                totalWages: 100000
            };
            // Default tax calc usually favors MFJ or is equal
            const result = analyzeFilingStatusOptimizations(data);
            const mfsOpt = result.find(o => o.id === 'filing-mfj-to-mfs');

            // Should be undefined unless our mocked calc engine produces weird results
            expect(mfsOpt).toBeUndefined();
        });

        // Harder to test "Success" case for MFS without elaborate setup of
        // income-based repayment or medical expense thresholds which requires
        // precise mocking of calculateTotalTax returns.
        // We can test the helper explicitly if needed, or rely on the optimizer 
        // logic that calculates savings.
    });

    describe('checkHOHEligibility Helper', () => {
        it('should return eligible for single with child', () => {
            const form = {
                filingStatus: 'single',
                dependents: [{ qualifyingChild: true, firstName: 'Kid' }]
            };
            const result = checkHOHEligibility(form);
            expect(result.eligible).toBe(true);
            expect(result.qualifyingPerson).toBe('Kid');
        });

        it('should return ineligible if married', () => {
            const form = {
                filingStatus: 'married',
                dependents: [{ qualifyingChild: true }]
            };
            const result = checkHOHEligibility(form);
            expect(result.eligible).toBe(false);
            expect(result.reason).toContain('married');
        });
    });

});
