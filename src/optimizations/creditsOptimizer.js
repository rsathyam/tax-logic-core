/**
 * Credits Optimizer
 * Analyzes eligibility for CTC, EITC, education credits, and 2025 new deductions
 */

import { calculateTotalTax } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';

// 2025 Credit Limits and Thresholds
const CREDITS_2025 = {
    ctc: {
        maxPerChild: 2200, // Increased by OBBBA
        refundableMax: 1700,
        phaseoutStart: { single: 200000, married: 400000 },
        phaseoutRate: 50, // $50 reduction per $1,000 over threshold
    },
    otherDependents: 500,
    eitc: {
        maxCredit: { 0: 649, 1: 4328, 2: 7152, 3: 8046 },
        incomeLimit: {
            single: { 0: 18591, 1: 49084, 2: 55768, 3: 59899 },
            married: { 0: 25511, 1: 56004, 2: 62688, 3: 66819 },
        },
        investmentIncomeLimit: 11950,
    },
    education: {
        aotc: { max: 2500, refundable: 1000 },
        llc: { max: 2000 },
    },
    childCare: {
        maxExpenses: { one: 3000, twoPlus: 6000 },
        maxCredit: 2100,
    },
    // New 2025 deductions from OBBBA
    newDeductions2025: {
        tips: { max: 25000 },
        overtime: { max: 12500 },
        autoLoan: { max: 10000 },
        seniorBonus: { max: 6000, ageRequirement: 65 },
    },
};

/**
 * Analyze all credit optimization opportunities
 */
export function analyzeCreditsOptimizations(form) {
    const optimizations = [];

    // Child Tax Credit
    const ctcOpt = analyzeChildTaxCredit(form);
    if (ctcOpt) {
        optimizations.push(ctcOpt);
    }

    // EITC analysis
    const eitcOpt = analyzeEarnedIncomeCredit(form);
    if (eitcOpt) {
        optimizations.push(eitcOpt);
    }

    // Education credits
    const eduOpts = analyzeEducationCredits(form);
    optimizations.push(...eduOpts);

    // Child and Dependent Care Credit
    const careOpt = analyzeChildCareCredit(form);
    if (careOpt) {
        optimizations.push(careOpt);
    }

    // 2025 New Deductions (OBBBA)
    const newOpts = analyzeNew2025Deductions(form);
    optimizations.push(...newOpts);

    // Energy Credits (IRA)
    const energyOpts = analyzeEnergyCredits(form);
    optimizations.push(...energyOpts);

    return optimizations;
}

/**
 * Analyze Energy Credits (IRA) - Solar, Heat Pumps, etc.
 */
function analyzeEnergyCredits(form) {
    const optimizations = [];
    const currentCredits = parseFloat(form.energyCredits) || 0;

    // 1. Residential Clean Energy Credit (Solar/Battery) - 30% unlimited
    const solarExpenses = parseFloat(form.solarExpenses) || 0;
    if (solarExpenses > 0) {
        const potentialCredit = solarExpenses * 0.30;
        if (currentCredits < potentialCredit) {
            optimizations.push({
                id: 'credit-residential-energy',
                name: 'Residential Clean Energy Credit (Solar/Battery)',
                category: CATEGORY.CREDITS,
                potentialSavings: Math.round(potentialCredit),
                difficulty: DIFFICULTY.MEDIUM,
                description: 'Get a 30% tax credit for solar, wind, geothermal, or battery storage.',
                details: [
                    `Qualified expenses: $${solarExpenses.toLocaleString()}`,
                    `Credit rate: 30%`,
                    `Potential credit: $${potentialCredit.toLocaleString()}`,
                    'No annual dollar limit for this credit',
                ],
                timeline: 'This Return',
            });
        }
    }

    // 2. Energy Efficient Home Improvement Credit - 30% up to $3,200
    const homeImprovementExpenses = parseFloat(form.homeImprovementExpenses) || 0;
    const heatPumpExpenses = parseFloat(form.heatPumpExpenses) || 0;

    // Check general limit ($1,200) vs Heat Pump limit ($2,000)
    // Simplified optimization check
    if ((homeImprovementExpenses > 0 || heatPumpExpenses > 0) && currentCredits < 1000) {
        const potentialCredit = Math.min(
            (homeImprovementExpenses * 0.30) + (heatPumpExpenses * 0.30),
            3200
        );

        optimizations.push({
            id: 'credit-home-improvement',
            name: 'Energy Efficient Home Improvement Credit',
            category: CATEGORY.CREDITS,
            potentialSavings: Math.round(potentialCredit),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Credit up to $3,200 for heat pumps, windows, doors, and insulation.',
            details: [
                `Heat pump expenses: $${heatPumpExpenses.toLocaleString()}`,
                `Other efficiency expenses: $${homeImprovementExpenses.toLocaleString()}`,
                `Potential credit: $${potentialCredit.toLocaleString()}`,
                '30% of cost, subject to annual caps ($1,200 general, $2,000 heat pumps)',
            ],
            timeline: 'This Return',
        });
    }

    return optimizations;
}

/**
 * Analyze new 2025 deductions from OBBBA
 */
function analyzeNew2025Deductions(form) {
    const optimizations = [];
    const currentTax = calculateTotalTax(form);
    const agi = currentTax.agi;
    const filingStatus = form.filingStatus || 'single';

    // Calculate OBBBA Phase-out Percentage
    // Single: $150k - $400k
    // MFJ: $300k - $550k
    const getPhaseOutPct = (income) => {
        const limits = filingStatus === 'married'
            ? { start: 300000, end: 550000 }
            : { start: 150000, end: 400000 };

        if (income <= limits.start) return 1.0;
        if (income >= limits.end) return 0.0;
        return 1.0 - ((income - limits.start) / (limits.end - limits.start));
    };

    const phaseOutPct = getPhaseOutPct(agi);

    // 1. Tips Deduction (up to $25,000)
    const tipIncome = parseFloat(form.tipIncome) || 0;
    if (tipIncome > 0 && phaseOutPct > 0) {
        let tipsDeduction = Math.min(tipIncome, CREDITS_2025.newDeductions2025.tips.max);
        tipsDeduction = tipsDeduction * phaseOutPct;

        const savings = tipsDeduction * getMarginalRate(form);

        optimizations.push({
            id: 'credit-tips-deduction',
            name: 'Claim Qualified Tips Deduction (New 2025)',
            category: CATEGORY.CREDITS,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.EASY,
            description: 'New for 2025: Deduct up to $25,000 in qualified tip income.',
            details: [
                `Your tip income: $${tipIncome.toLocaleString()}`,
                `Deduction available: $${Math.round(tipsDeduction).toLocaleString()}`,
                phaseOutPct < 1.0
                    ? `Reduced by income phase-out (${Math.round((1 - phaseOutPct) * 100)}%)`
                    : 'Full deduction (No phase-out)',
                'Above-the-line deduction reduces AGI',
            ],
            isNew2025: true,
            timeline: 'This Return',
        });
    }

    // 2. Overtime Deduction (up to $12,500)
    const overtimeIncome = parseFloat(form.overtimeIncome) || 0;
    if (overtimeIncome > 0 && phaseOutPct > 0) {
        let overtimeDeduction = Math.min(overtimeIncome, CREDITS_2025.newDeductions2025.overtime.max);
        overtimeDeduction = overtimeDeduction * phaseOutPct;

        const savings = overtimeDeduction * getMarginalRate(form);

        optimizations.push({
            id: 'credit-overtime-deduction',
            name: 'Claim Qualified Overtime Deduction (New 2025)',
            category: CATEGORY.CREDITS,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.EASY,
            description: 'New for 2025: Deduct up to $12,500 in qualified overtime pay.',
            details: [
                `Your overtime income: $${overtimeIncome.toLocaleString()}`,
                `Deduction available: $${Math.round(overtimeDeduction).toLocaleString()}`,
                phaseOutPct < 1.0
                    ? `Reduced by income phase-out (${Math.round((1 - phaseOutPct) * 100)}%)`
                    : 'Full deduction (No phase-out)',
                'Above-the-line deduction reduces AGI',
            ],
            isNew2025: true,
            timeline: 'This Return',
        });
    }

    // 3. Auto Loan Interest Deduction (up to $10,000)
    const autoLoanInterest = parseFloat(form.autoLoanInterest) || 0;
    if (autoLoanInterest > 0) {
        const autoDeduction = Math.min(autoLoanInterest, CREDITS_2025.newDeductions2025.autoLoan.max);
        const savings = autoDeduction * getMarginalRate(form);

        optimizations.push({
            id: 'credit-auto-loan-deduction',
            name: 'Claim Auto Loan Interest Deduction (New 2025)',
            category: CATEGORY.CREDITS,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.EASY,
            description: 'New for 2025: Deduct up to $10,000 in auto loan interest for U.S.-made vehicles.',
            details: [
                `Auto loan interest paid: $${autoLoanInterest.toLocaleString()}`,
                `Deduction available: $${autoDeduction.toLocaleString()}`,
                'Vehicle must be manufactured in the United States',
            ],
            requirements: [
                'Vehicle must be assembled in the U.S.',
                'Above-the-line deduction',
            ],
            isNew2025: true,
            timeline: 'This Return',
        });
    }

    // 4. Senior Bonus Deduction (up to $6,000 for 65+)
    const age = calculateAge(form.birthDate);
    if (age >= 65) {
        const seniorBonus = CREDITS_2025.newDeductions2025.seniorBonus.max;
        const savings = seniorBonus * getMarginalRate(form);

        // Check if already claimed
        if (!form.seniorBonusClaimed) {
            optimizations.push({
                id: 'credit-senior-bonus',
                name: 'Claim Senior Bonus Deduction (New 2025)',
                category: CATEGORY.CREDITS,
                potentialSavings: Math.round(savings),
                difficulty: DIFFICULTY.EASY,
                description: 'New for 2025: Additional $6,000 deduction for taxpayers 65+.',
                details: [
                    `Your age: ${age}`,
                    `Bonus deduction: $${seniorBonus.toLocaleString()}`,
                    'Stacks with standard deduction age 65+ increase',
                ],
                isNew2025: true,
                timeline: 'This Return',
            });
        }
    }

    return optimizations;
}

/**
 * Estimate EITC (simplified calculation)
 */
function estimateEITC(earnedIncome, children, status) {
    const maxCredit = CREDITS_2025.eitc.maxCredit[children];
    const incomeLimit = CREDITS_2025.eitc.incomeLimit[status][children];

    // Phase-in and phase-out rates vary by number of children
    const rates = {
        0: { phaseIn: 0.0765, phaseOut: 0.0765 },
        1: { phaseIn: 0.34, phaseOut: 0.1598 },
        2: { phaseIn: 0.40, phaseOut: 0.2106 },
        3: { phaseIn: 0.45, phaseOut: 0.2106 },
    };

    const rate = rates[children];

    // Simplified: if income is moderate, assume near-max credit
    if (earnedIncome < incomeLimit * 0.7) {
        return Math.min(earnedIncome * rate.phaseIn, maxCredit);
    }

    // Phase-out calculation
    const phaseOutStart = status === 'married'
        ? { 0: 9800, 1: 21560, 2: 21560, 3: 21560 }[children]
        : { 0: 9800, 1: 12880, 2: 12880, 3: 12880 }[children];

    if (earnedIncome > phaseOutStart) {
        const reduction = (earnedIncome - phaseOutStart) * rate.phaseOut;
        return Math.max(0, maxCredit - reduction);
    }

    return maxCredit;
}

/**
 * Helper: Calculate age
 */
function calculateAge(birthDate) {
    if (!birthDate) return 40;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

/**
 * Helper: Estimate marginal rate
 */
function getMarginalRate(form) {
    const currentTax = calculateTotalTax(form);
    const taxableIncome = currentTax.taxableIncome;

    if (taxableIncome > 626350) return 0.37;
    if (taxableIncome > 250525) return 0.35;
    if (taxableIncome > 197300) return 0.32;
    if (taxableIncome > 103350) return 0.24;
    if (taxableIncome > 48475) return 0.22;
    if (taxableIncome > 11925) return 0.12;
    return 0.10;
}

/**
 * Analyze Child Tax Credit
 */
function analyzeChildTaxCredit(form) {
    // Placeholder implementation
    return null;
}

/**
 * Analyze Earned Income Tax Credit
 */
function analyzeEarnedIncomeCredit(form) {
    // Placeholder implementation
    return null;
}

/**
 * Analyze Education Credits
 */
function analyzeEducationCredits(form) {
    // Placeholder implementation
    return [];
}

/**
 * Analyze Child and Dependent Care Credit
 */
function analyzeChildCareCredit(form) {
    // Placeholder implementation
    return null;
}
