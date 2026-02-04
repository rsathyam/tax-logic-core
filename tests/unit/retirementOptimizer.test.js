
import { describe, it, expect } from 'vitest';
import { analyzeRetirementOptimizations } from '../../src/optimizations/retirementOptimizer.js';
import { CATEGORY } from '../../src/optimizations/taxOptimizer.js';

describe('Retirement Optimizer', () => {

    describe('401(k) Contributions', () => {
        it('should recommend maximizing 401(k) if under limit', () => {
            const data = {
                totalWages: 100000,
                retirement401k: 5000, // Well under 23,500 limit
                birthDate: '1980-01-01'
            };

            const result = analyzeRetirementOptimizations(data);
            const opt = result.find(o => o.id === 'retirement-401k-max');

            expect(opt).toBeDefined();
            expect(opt.potentialSavings).toBeGreaterThan(0);
            expect(opt.details.some(d => d.includes('Additional room'))).toBe(true);
        });

        it('should NOT recommend if already maxed (or close/unknown logic handled)', () => {
            const data = {
                totalWages: 100000,
                retirement401k: 23500, // Max for 2025
                birthDate: '1980-01-01'
            };

            const result = analyzeRetirementOptimizations(data);
            const opt = result.find(o => o.id === 'retirement-401k-max');

            expect(opt).toBeUndefined();
        });
    });

    describe('Backdoor Roth', () => {
        it('should recommend Backdoor Roth for high earners', () => {
            const data = {
                filingStatus: 'single',
                // AGI must > 165,000 for single to likely trigger need?
                // Logic checks if AGI > limit.end
                totalWages: 250000,
                birthDate: '1980-01-01'
            };

            const result = analyzeRetirementOptimizations(data);
            const opt = result.find(o => o.id === 'retirement-backdoor-roth');

            expect(opt).toBeDefined();
            expect(opt.description).toContain('Backdoor Roth');
        });
    });

    describe('HSA Contribution', () => {
        it('should recommend HSA if eligible (HDHP) and under limit', () => {
            const data = {
                hasHDHP: true,
                hsaDeduction: 1000, // Under limit
                hsaCoverage: 'self',
                totalWages: 60000
            };

            const result = analyzeRetirementOptimizations(data);
            const opt = result.find(o => o.id === 'retirement-hsa');

            expect(opt).toBeDefined();
            expect(opt.potentialSavings).toBeGreaterThan(0);
        });

        it('should NOT recommend HSA if not eligible (no HDHP)', () => {
            const data = {
                hasHDHP: false, // Explicitly false
                hsaDeduction: 0,
                totalWages: 60000
            };

            const result = analyzeRetirementOptimizations(data);
            const opt = result.find(o => o.id === 'retirement-hsa');

            expect(opt).toBeUndefined();
        });
    });

});
