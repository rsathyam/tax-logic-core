
import { describe, it, expect } from 'vitest';
import { analyzeCreditsOptimizations } from '../../src/optimizations/creditsOptimizer.js';
import { CATEGORY } from '../../src/optimizations/taxOptimizer.js';

describe('Credits Optimizer', () => {

    describe('Energy Credits', () => {
        it('should recommend Residential Clean Energy credit for solar expenses', () => {
            const data = {
                solarExpenses: 10000,
                totalWages: 80000
            };

            const result = analyzeCreditsOptimizations(data);
            const opt = result.find(o => o.id === 'credit-residential-energy');

            expect(opt).toBeDefined();
            expect(opt.potentialSavings).toBe(3000); // 30% of 10,000
        });

        it('should recommend Home Improvement credit for heat pumps', () => {
            const data = {
                heatPumpExpenses: 5000,
                totalWages: 80000
            };

            const result = analyzeCreditsOptimizations(data);
            const opt = result.find(o => o.id === 'credit-home-improvement');

            expect(opt).toBeDefined();
            // Cap for heat pump is 2000
            // Calc: min(5000*0.3=1500, 3200 total cap)
            // Wait, per src: potentialCredit = min( (home*0.3 + heat*0.3), 3200 )
            // But heat pump specific cap is mentioned in text, not logic? 
            // Logic: if ((home>0 || heat>0) && cred<1000) -> push.
            // Check logic implementation...
            expect(opt.potentialSavings).toBe(1500);
        });
    });

    describe('New 2025 OBBBA Deductions', () => {
        it('should recommend Tips Deduction', () => {
            const data = {
                // Single filer under phaseout start (150k)
                filingStatus: 'single',
                totalWages: 50000,
                tipIncome: 5000
            };

            const result = analyzeCreditsOptimizations(data);
            const opt = result.find(o => o.id === 'credit-tips-deduction');

            expect(opt).toBeDefined();
            expect(opt.name).toContain('Tips Deduction');
        });

        it('should recommend Overtime Deduction', () => {
            const data = {
                filingStatus: 'single',
                totalWages: 50000,
                overtimeIncome: 2000
            };

            const result = analyzeCreditsOptimizations(data);
            const opt = result.find(o => o.id === 'credit-overtime-deduction');

            expect(opt).toBeDefined();
            expect(opt.name).toContain('Overtime Deduction');
        });

        it('should recommend Auto Loan Interest Deduction (US Made)', () => {
            const data = {
                totalWages: 60000,
                autoLoanInterest: 1500
            };

            const result = analyzeCreditsOptimizations(data);
            const opt = result.find(o => o.id === 'credit-auto-loan-deduction');

            expect(opt).toBeDefined();
            expect(opt.name).toContain('Auto Loan');
        });

        it('should recommend Senior Bonus for age 65+', () => {
            const data = {
                birthDate: '1955-01-01', // Age > 65
                totalWages: 40000
            };

            const result = analyzeCreditsOptimizations(data);
            const opt = result.find(o => o.id === 'credit-senior-bonus');

            expect(opt).toBeDefined();
            expect(opt.name).toContain('Senior Bonus');
        });
    });

});
