
import { describe, it, expect } from 'vitest';
import { analyzeCryptoTaxOptimizations } from '../../src/optimizations/cryptoTaxOptimizer.js';
import { CATEGORY } from '../../src/optimizations/taxOptimizer.js';

describe('Crypto Tax Optimizer', () => {

    it('should recommend HIFO cost basis if using FIFO with gains', () => {
        const data = {
            hasCrypto: true,
            cryptoGains: 10000,
            cryptocurrency: {
                costBasisMethod: 'fifo',
                gains: 10000
            }
        };

        const result = analyzeCryptoTaxOptimizations(data);
        const basisOpt = result.find(o => o.id === 'crypto-cost-basis-method');

        expect(basisOpt).toBeDefined();
        expect(basisOpt.potentialSavings).toBeGreaterThan(0);
        expect(basisOpt.description).toContain('HIFO');
    });

    it('should NOT recommend HIFO if already using HIFO', () => {
        const data = {
            hasCrypto: true,
            cryptoGains: 10000,
            cryptocurrency: {
                costBasisMethod: 'hifo',
                gains: 10000
            }
        };

        const result = analyzeCryptoTaxOptimizations(data);
        const basisOpt = result.find(o => o.id === 'crypto-cost-basis-method');

        expect(basisOpt).toBeUndefined();
    });

    it('should recommend Loss Harvesting for losses (Wash Sale Exempt)', () => {
        const data = {
            hasCrypto: true,
            cryptoGains: 5000,
            cryptoLosses: 2000, // Losses exist
            cryptocurrency: {
                gains: 5000,
                losses: 2000
            }
        };

        const result = analyzeCryptoTaxOptimizations(data);
        const harvestOpt = result.find(o => o.id === 'crypto-tax-loss-harvesting');

        expect(harvestOpt).toBeDefined();
        expect(harvestOpt.description).toContain('wash sale rule does NOT apply');
    });

    it('should report Staking Income info', () => {
        const data = {
            hasCrypto: true,
            stakingIncome: 1200,
            cryptocurrency: {
                staking: 1200
            }
        };

        const result = analyzeCryptoTaxOptimizations(data);
        const stakingOpt = result.find(o => o.id === 'crypto-staking-mining-income');

        expect(stakingOpt).toBeDefined();
        expect(stakingOpt.category).toBe(CATEGORY.SELF_EMPLOYMENT); // Or appropriate category
        expect(stakingOpt.details.some(d => d.includes('$1,200'))).toBe(true);
    });

    it('should warn about Short-Term Gains', () => {
        const data = {
            hasCrypto: true,
            cryptocurrency: {
                shortTermGains: 5000 // High short term gains
            },
            totalWages: 100000 // Ensure some marginal rate
        };

        const result = analyzeCryptoTaxOptimizations(data);
        const stOpt = result.find(o => o.id === 'crypto-holding-period');

        expect(stOpt).toBeDefined();
        expect(stOpt.details.some(d => d.includes('Short-term crypto gains'))).toBe(true);
    });

});
