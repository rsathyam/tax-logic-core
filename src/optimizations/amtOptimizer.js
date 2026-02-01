/**
 * AMT Optimizer
 * Analyzes Alternative Minimum Tax exposure and recommends mitigation strategies
 */

import { calculateTotalTax } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';
import { formatAuthorityForDisplay, TAX_AUTHORITY } from '../utils/taxAuthority.js';

// 2025 AMT Parameters
const AMT_2025 = {
    exemption: {
        single: 88100,
        married: 137000,
        marriedSeparate: 68500,
        head: 88100,
    },
    phaseOut: {
        single: 609350,
        married: 1218700,
        marriedSeparate: 609350,
        head: 609350,
    },
    rates: {
        lower: 0.26,
        higher: 0.28,
        threshold: 232600, // married: 232600, single: 116300
    },
    // Exemption phases out at 25 cents per dollar over phase-out threshold
    phaseOutRate: 0.25,
};

/**
 * Analyze AMT exposure and provide planning recommendations
 */
export function analyzeAMTOptimizations(form) {
    const optimizations = [];

    const currentTax = calculateTotalTax(form);
    const filingStatus = form.filingStatus || 'single';

    // Calculate AMT
    const amtResult = calculateAMT(form, currentTax, filingStatus);

    if (amtResult.amtExposure > 0) {
        // AMT applies - provide detailed analysis
        optimizations.push(createAMTExposureWarning(form, amtResult, filingStatus));
    } else if (amtResult.amtMargin < 20000) {
        // Close to AMT - provide warning
        optimizations.push(createAMTMarginalWarning(form, amtResult, filingStatus));
    }

    // Check for specific AMT triggers
    const triggerOpts = analyzeAMTTriggers(form, amtResult);
    optimizations.push(...triggerOpts);

    // AMT reduction strategies
    const strategyOpts = analyzeAMTStrategies(form, amtResult, filingStatus);
    optimizations.push(...strategyOpts);

    return optimizations.filter(opt => opt !== null);
}

/**
 * Calculate Alternative Minimum Tax
 */
function calculateAMT(form, currentTax, filingStatus) {
    const regularTaxableIncome = currentTax.taxableIncome;
    const regularTax = currentTax.regularTax || currentTax.incomeTax;

    // Start with taxable income and add back AMT preference items
    let amti = regularTaxableIncome;

    // 1. Add back SALT deduction (major AMT adjustment)
    const saltDeduction = Math.min(
        (parseFloat(form.stateLocalTaxes) || 0) + (parseFloat(form.realEstateTaxes) || 0),
        40000 // OBBBA cap
    );
    if (form.itemizedDeductions && saltDeduction > 0) {
        amti += saltDeduction;
    }

    // 2. Add back personal exemptions (N/A under current law)
    // const personalExemptions = 0; // TCJA suspended through 2025

    // 3. Add back miscellaneous itemized deductions (N/A under current law)
    // Already suspended by TCJA

    // 4. ISO (Incentive Stock Option) exercise spread
    const isoSpread = parseFloat(form.isoExerciseSpread) || 0;
    amti += isoSpread;

    // 5. Private activity bond interest
    const pabInterest = parseFloat(form.privateActivityBondInterest) || 0;
    amti += pabInterest;

    // 6. Depreciation adjustments (MACRS vs ADS)
    const depreciationAdjustment = parseFloat(form.amtDepreciationAdjustment) || 0;
    amti += depreciationAdjustment;

    // 7. Net operating loss differences
    // (Simplified - actual calculation more complex)

    // Calculate AMT exemption
    const exemption = calculateAMTExemption(amti, filingStatus);

    // Calculate tentative minimum tax
    const amtBase = Math.max(0, amti - exemption);
    const amtThreshold = filingStatus === 'marriedSeparate'
        ? AMT_2025.rates.threshold / 2
        : AMT_2025.rates.threshold;

    let tentativeMinimumTax;
    if (amtBase <= amtThreshold) {
        tentativeMinimumTax = amtBase * AMT_2025.rates.lower;
    } else {
        tentativeMinimumTax = (amtThreshold * AMT_2025.rates.lower) +
            ((amtBase - amtThreshold) * AMT_2025.rates.higher);
    }

    // AMT = tentative minimum tax - regular tax (if positive)
    const amtOwed = Math.max(0, tentativeMinimumTax - regularTax);

    return {
        amti,
        regularTaxableIncome,
        regularTax,
        exemption,
        tentativeMinimumTax,
        amtOwed,
        amtExposure: amtOwed,
        amtMargin: regularTax - tentativeMinimumTax, // Positive = safe from AMT
        adjustments: {
            salt: saltDeduction,
            isoSpread,
            pabInterest,
            depreciation: depreciationAdjustment,
        }
    };
}

/**
 * Calculate AMT exemption with phase-out
 */
function calculateAMTExemption(amti, filingStatus) {
    const baseExemption = AMT_2025.exemption[filingStatus] || AMT_2025.exemption.single;
    const phaseOutStart = AMT_2025.phaseOut[filingStatus] || AMT_2025.phaseOut.single;

    if (amti <= phaseOutStart) {
        return baseExemption;
    }

    const excessIncome = amti - phaseOutStart;
    const reduction = excessIncome * AMT_2025.phaseOutRate;

    return Math.max(0, baseExemption - reduction);
}

/**
 * Create AMT exposure warning
 */
function createAMTExposureWarning(form, amtResult, filingStatus) {
    const authority = formatAuthorityForDisplay('amt');

    return {
        id: 'amt-exposure',
        name: 'Alternative Minimum Tax Applies',
        category: CATEGORY.INCOME_TIMING,
        potentialSavings: 0,
        difficulty: DIFFICULTY.HARD,
        description: `You owe ${formatCurrency(amtResult.amtOwed)} in AMT above your regular tax.`,
        details: [
            `Regular taxable income: ${formatCurrency(amtResult.regularTaxableIncome)}`,
            `AMT income (AMTI): ${formatCurrency(amtResult.amti)}`,
            `AMT exemption: ${formatCurrency(amtResult.exemption)}`,
            `Regular tax: ${formatCurrency(amtResult.regularTax)}`,
            `Tentative minimum tax: ${formatCurrency(amtResult.tentativeMinimumTax)}`,
            `AMT owed: ${formatCurrency(amtResult.amtOwed)}`,
        ],
        amtAdjustments: [
            amtResult.adjustments.salt > 0 ? `SALT add-back: ${formatCurrency(amtResult.adjustments.salt)}` : null,
            amtResult.adjustments.isoSpread > 0 ? `ISO spread: ${formatCurrency(amtResult.adjustments.isoSpread)}` : null,
            amtResult.adjustments.pabInterest > 0 ? `Private activity bonds: ${formatCurrency(amtResult.adjustments.pabInterest)}` : null,
        ].filter(Boolean),
        strategies: [
            'Consider deferring income to reduce AMTI',
            'Review ISO exercise timing to spread across years',
            'Municipal bonds from your state may be AMT-exempt',
            'Accelerate deductions that are allowed for AMT',
        ],
        authority: authority,
        auditRisk: 'LOW',
        timeline: 'This Return',
        formImpact: ['Form 6251'],
    };
}

/**
 * Create marginal AMT warning
 */
function createAMTMarginalWarning(form, amtResult, filingStatus) {
    return {
        id: 'amt-marginal-warning',
        name: 'AMT Margin Warning',
        category: CATEGORY.INCOME_TIMING,
        potentialSavings: 0,
        difficulty: DIFFICULTY.MEDIUM,
        description: `You're ${formatCurrency(Math.abs(amtResult.amtMargin))} away from triggering AMT.`,
        details: [
            'Small changes in income or deductions could trigger AMT',
            'Consider impact before exercising ISOs or selling assets',
            'SALT deduction is a major AMT trigger',
        ],
        recommendations: [
            'Run Form 6251 worksheets before major financial decisions',
            'Consider timing of ISO exercises across tax years',
            'Private activity municipal bonds add to AMTI',
        ],
        isInformational: true,
        timeline: 'Tax Planning',
    };
}

/**
 * Analyze specific AMT triggers
 */
function analyzeAMTTriggers(form, amtResult) {
    const triggers = [];

    // ISO Exercise trigger
    if (amtResult.adjustments.isoSpread > 50000) {
        triggers.push({
            id: 'amt-iso-trigger',
            name: 'ISO Exercise Triggering AMT',
            category: CATEGORY.CAPITAL_GAINS,
            potentialSavings: 0,
            difficulty: DIFFICULTY.HARD,
            description: 'Your ISO exercises are adding significantly to AMT income.',
            details: [
                `ISO bargain element: ${formatCurrency(amtResult.adjustments.isoSpread)}`,
                'ISO spread is added to AMTI in year of exercise',
                'No tax impact for regular tax until shares are sold',
            ],
            strategies: [
                'Spread ISO exercises across multiple years',
                'Exercise only enough to use AMT exemption',
                'Consider same-day sale to avoid AMT on exercise',
                'Review AMT credit carryforward from prior years',
            ],
            timeline: 'Future Planning',
        });
    }

    // High SALT trigger
    if (amtResult.adjustments.salt > 30000) {
        triggers.push({
            id: 'amt-salt-trigger',
            name: 'High SALT Deduction Contributing to AMT',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: 0,
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Your state/local tax deduction is a major factor in your AMT.',
            details: [
                `SALT deduction: ${formatCurrency(amtResult.adjustments.salt)}`,
                'SALT is fully added back for AMT calculation',
                'Consider PTET election for pass-through entities',
            ],
            strategies: [
                'Evaluate pass-through entity tax (PTET) election',
                'Consider relocating to lower-tax state',
                'Maximize above-the-line deductions (reduce both)',
            ],
            timeline: 'Tax Planning',
        });
    }

    return triggers;
}

/**
 * Analyze AMT reduction strategies
 */
function analyzeAMTStrategies(form, amtResult, filingStatus) {
    const strategies = [];

    // Only suggest if AMT is an issue
    if (amtResult.amtExposure <= 0 && amtResult.amtMargin > 50000) {
        return strategies;
    }

    // Strategy 1: Maximize retirement contributions
    const has401k = form.has401k || parseFloat(form.retirement401k) > 0;
    if (!has401k || (parseFloat(form.retirement401k) || 0) < 23500) {
        strategies.push({
            id: 'amt-strategy-401k',
            name: 'Maximize 401(k) to Reduce AMT',
            category: CATEGORY.RETIREMENT,
            potentialSavings: Math.round(23500 * 0.26), // AMT rate savings
            difficulty: DIFFICULTY.EASY,
            description: '401(k) contributions reduce both regular tax AND AMT income.',
            details: [
                '2025 limit: $23,500 ($31,000 if 50+)',
                'Pre-tax contributions reduce AGI',
                'AGI reduction lowers AMTI directly',
            ],
            timeline: 'This Year',
        });
    }

    // Strategy 2: HSA contributions
    const hasHSA = parseFloat(form.hsaContributions) > 0;
    if (!hasHSA) {
        strategies.push({
            id: 'amt-strategy-hsa',
            name: 'Contribute to HSA to Reduce AMT',
            category: CATEGORY.RETIREMENT,
            potentialSavings: Math.round(4300 * 0.26),
            difficulty: DIFFICULTY.EASY,
            description: 'HSA contributions reduce both regular and AMT income.',
            details: [
                '2025 limit: $4,300 individual, $8,550 family',
                'Above-the-line deduction',
                'Triple tax advantage: deductible, grows tax-free, tax-free withdrawals',
            ],
            timeline: 'This Year',
        });
    }

    // Strategy 3: Charitable giving
    strategies.push({
        id: 'amt-strategy-charity',
        name: 'Charitable Giving Helps With AMT',
        category: CATEGORY.DEDUCTIONS,
        potentialSavings: 0,
        difficulty: DIFFICULTY.EASY,
        description: 'Charitable contributions are deductible for BOTH regular tax and AMT.',
        details: [
            'Unlike SALT, charitable deductions are allowed for AMT',
            'Consider bunching contributions in AMT years',
            'Donate appreciated stock for additional benefit',
        ],
        isInformational: true,
        timeline: 'Tax Planning',
    });

    return strategies;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
