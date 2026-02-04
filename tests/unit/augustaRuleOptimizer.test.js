import { describe, it, expect } from 'vitest';
import {
    analyzeAugustaRuleOptimization,
    validateAugustaRuleCompliance
} from '../../src/optimizations/augustaRuleOptimizer.js';

describe('Augusta Rule Optimizer', () => {

    describe('analyzeAugustaRuleOptimization', () => {
        it('should recommend Augusta Rule for homeowners with business income', () => {
            const data = {
                // Business owner scenarios
                hasScheduleC: true,
                scheduleC: { netProfit: 50000 },
                // Homeowner - use correct property
                ownsHome: true,
                // Has not used it yet
                augustaRuleDays: 0
            };

            const result = analyzeAugustaRuleOptimization(data);
            const rec = result.find(o => o.id === 'augusta-rule-14-day-rental');

            expect(rec).toBeDefined();
            expect(rec.potentialSavings).toBeGreaterThan(0);
        });

        it('should return a prompt if user rents their home', () => {
            const data = {
                hasScheduleC: true,
                ownsHome: false // Explicitly false
            };

            const result = analyzeAugustaRuleOptimization(data);
            const prompt = result.find(o => o.id === 'augusta-rule-opportunity');
            expect(prompt).toBeDefined();
        });

        it('should return empty array if already used > 14 days', () => {
            const data = {
                hasScheduleC: true,
                ownsHome: true, // Correct property
                augustaRuleDays: 15
            };

            const rec = analyzeAugustaRuleOptimization(data);
            expect(rec).toEqual([]);
        });
    });

    describe('validateAugustaRuleCompliance', () => {
        it('should return valid for correct usage', () => {
            const usage = {
                augustaRuleDays: 10,
                augustaRuleIncome: 10000,
                augustaRuleBusinessPurpose: 'Board Meeting'
            };

            const result = validateAugustaRuleCompliance(usage);
            expect(result.isValid).toBe(true);
        });

        it('should flag overuse (15+ days)', () => {
            const usage = {
                augustaRuleDays: 15, // Limit is 14
                augustaRuleIncome: 5000
            };

            const result = validateAugustaRuleCompliance(usage);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].message).toContain('14 days');
        });
    });
});
