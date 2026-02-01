/**
 * Tax Logic Core - Optimizations
 * Tax Optimization Strategies with IRS Citations
 */

// Main orchestrator
export {
    analyzeTaxOptimizations,
    runWhatIfScenario,
    getOptimizationsByCategory,
    getOptimizationsByDifficulty,
    formatCurrency,
    calculateEffectiveRate,
    DIFFICULTY,
    CATEGORY,
} from './taxOptimizer.js';

// Individual optimizers
export { analyzeFilingStatusOptimizations } from './filingStatusOptimizer.js';
export { analyzeDeductionOptimizations } from './deductionOptimizer.js';
export { analyzeRetirementOptimizations } from './retirementOptimizer.js';
export { analyzeCreditsOptimizations } from './creditsOptimizer.js';
export { analyzeSelfEmploymentOptimizations } from './selfEmploymentOptimizer.js';
export { analyzeCapitalGainsOptimizations } from './capitalGainsOptimizer.js';
export { analyzeStateOptimizations } from './stateOptimizer.js';

// New 2025 optimizers
export {
    analyzeAugustaRuleOptimization,
    analyzeAugustaRuleScenarios,
    validateAugustaRuleCompliance,
} from './augustaRuleOptimizer.js';

export { analyzeK1Optimizations } from './k1Optimizer.js';
export { analyzeAMTOptimizations } from './amtOptimizer.js';

// Crypto tax handling
export {
    analyzeCryptoTaxOptimizations,
    COST_BASIS_METHODS,
} from './cryptoTaxOptimizer.js';

// Real estate professional status
export { analyzeRealEstateProfessionalOptimizations } from './realEstateProfessionalOptimizer.js';

// International tax
export { analyzeInternationalTaxOptimizations } from './internationalTaxOptimizer.js';

// State PTET (SALT workaround)
export {
    analyzeStatePTETOptimizations,
    STATE_PTET_PROGRAMS,
    TX_MARGIN_TAX,
} from './statePTETOptimizer.js';
