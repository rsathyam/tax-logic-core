/**
 * Retirement Optimizer
 * Analyzes 401(k), IRA, HSA contributions and retirement savings opportunities
 */

import { calculateTotalTax } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';

// 2025 Contribution Limits
const LIMITS_2025 = {
    traditional401k: 23500,
    catchUp401k50Plus: 7500,  // Age 50-59 and 64+
    catchUp401k60to63: 11250, // Super catch-up for 60-63
    traditionalIRA: 7000,
    catchUpIRA: 1000,
    hsa: {
        self: 4300,
        family: 8550,
        catchUp55Plus: 1000,
    },
    sepIRA: 69000,
    solo401k: {
        employeeMax: 23500,
        totalMax: 69000, // Including employer contributions
    },
    saversCreditAGI: {
        single: 38250,
        married: 76500,
        hoh: 57375,
    },
};

/**
 * Analyze all retirement optimization opportunities
 */
export function analyzeRetirementOptimizations(form) {
    const optimizations = [];

    // 401(k) contribution analysis
    const k401Opt = analyze401kContribution(form);
    if (k401Opt) {
        optimizations.push(k401Opt);
    }

    // Traditional IRA deduction
    const iraOpt = analyzeTraditionalIRA(form);
    if (iraOpt) {
        optimizations.push(iraOpt);
    }

    // HSA contribution
    const hsaOpt = analyzeHSAContribution(form);
    if (hsaOpt) {
        optimizations.push(hsaOpt);
    }

    // Spousal IRA
    const spousalOpt = analyzeSpousalIRA(form);
    if (spousalOpt) {
        optimizations.push(spousalOpt);
    }

    // Retirement Saver's Credit
    const saversOpt = analyzeSaversCredit(form);
    if (saversOpt) {
        optimizations.push(saversOpt);
    }

    // SEP-IRA for self-employed
    const sepOpt = analyzeSEPIRA(form);
    if (sepOpt) {
        optimizations.push(sepOpt);
    }

    // Backdoor Roth opportunity
    const backdoorOpt = analyzeBackdoorRoth(form);
    if (backdoorOpt) {
        optimizations.push(backdoorOpt);
    }

    // Roth conversion opportunity
    const conversionOpt = analyzeRothConversion(form);
    if (conversionOpt) {
        optimizations.push(conversionOpt);
    }

    return optimizations;
}

/**
 * Analyze 401(k) contribution opportunity
 */
function analyze401kContribution(form) {
    // Estimate current 401k from wages (assuming typical contribution rate)
    const wages = parseFloat(form.totalWages) || 0;
    const current401k = parseFloat(form.retirement401k) || 0;

    // If they have no wages, skip
    if (wages <= 0) return null;

    // Determine age and max contribution
    const age = calculateAge(form.birthDate);
    let maxContribution = LIMITS_2025.traditional401k;

    if (age >= 60 && age <= 63) {
        maxContribution += LIMITS_2025.catchUp401k60to63;
    } else if (age >= 50) {
        maxContribution += LIMITS_2025.catchUp401k50Plus;
    }

    // If they haven't entered 401k contributions, estimate or prompt
    const estimated401k = current401k || wages * 0.06; // Assume 6% default

    if (estimated401k < maxContribution) {
        const additionalContribution = maxContribution - estimated401k;
        const savings = additionalContribution * getMarginalRate(form);

        // Check if they can afford more (rough check: contribution < 50% of wages)
        const maxAffordable = wages * 0.50;

        return {
            id: 'retirement-401k-max',
            name: 'Maximize 401(k) Contribution',
            category: CATEGORY.RETIREMENT,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.EASY,
            description: `You can contribute up to $${maxContribution.toLocaleString()} to your 401(k) in 2025.`,
            details: [
                `Current/estimated contribution: $${estimated401k.toLocaleString()}`,
                `Maximum allowed: $${maxContribution.toLocaleString()}`,
                `Additional room: $${additionalContribution.toLocaleString()}`,
                age >= 60 && age <= 63
                    ? '🎉 You qualify for the super catch-up (ages 60-63)!'
                    : age >= 50
                        ? 'You qualify for the standard catch-up contribution'
                        : '',
            ].filter(Boolean),
            benefits: [
                'Reduces taxable income dollar-for-dollar',
                'Tax-deferred growth',
                'Many employers offer matching contributions',
                'Lowers AGI for other credit phase-outs',
            ],
            timeline: 'Before Dec 31',
        };
    }

    return null;
}

/**
 * Analyze Traditional IRA deduction opportunity
 */
function analyzeTraditionalIRA(form) {
    const currentTax = calculateTotalTax(form);
    const agi = currentTax.agi;
    const wages = parseFloat(form.totalWages) || 0;
    const filingStatus = form.filingStatus || 'single';
    const currentIRADeduction = parseFloat(form.iraDeduction) || 0;

    const age = calculateAge(form.birthDate);
    const maxContribution = LIMITS_2025.traditionalIRA + (age >= 50 ? LIMITS_2025.catchUpIRA : 0);

    // Check if they have earned income
    if (wages <= 0 && !form.hasScheduleC) return null;

    // Skip if already maxed
    if (currentIRADeduction >= maxContribution) return null;

    // Phase-out limits depend on whether covered by workplace plan
    // For simplicity, assume not covered (full deduction available)
    const additionalContribution = maxContribution - currentIRADeduction;
    const savings = additionalContribution * getMarginalRate(form);

    return {
        id: 'retirement-ira',
        name: 'Contribute to Traditional IRA',
        category: CATEGORY.RETIREMENT,
        potentialSavings: Math.round(savings),
        difficulty: DIFFICULTY.EASY,
        description: `You can deduct up to $${maxContribution.toLocaleString()} in Traditional IRA contributions.`,
        details: [
            `Maximum contribution: $${maxContribution.toLocaleString()}`,
            `Current deduction: $${currentIRADeduction.toLocaleString()}`,
            `Additional room: $${additionalContribution.toLocaleString()}`,
            age >= 50 ? 'Includes $1,000 catch-up contribution' : '',
        ].filter(Boolean),
        considerations: [
            'Deduction may be limited if covered by workplace retirement plan',
            'Single: Full deduction if AGI < $79,000 (partial up to $89,000)',
            'MFJ: Full deduction if AGI < $126,000 (partial up to $146,000)',
            'Contribution deadline: April 15, 2026 (for tax year 2025)',
        ],
        timeline: 'Before April 15, 2026',
    };
}

/**
 * Analyze HSA contribution opportunity
 */
function analyzeHSAContribution(form) {
    const currentHSA = parseFloat(form.hsaDeduction) || 0;
    const hsaCoverage = form.hsaCoverage || 'self'; // 'self' or 'family'
    const age = calculateAge(form.birthDate);

    let maxHSA = hsaCoverage === 'family' ? LIMITS_2025.hsa.family : LIMITS_2025.hsa.self;
    if (age >= 55) {
        maxHSA += LIMITS_2025.hsa.catchUp55Plus;
    }

    // Check if they have HDHP (required for HSA)
    const hasHDHP = form.hasHDHP !== false; // Assume eligible if not specified

    if (currentHSA < maxHSA && hasHDHP) {
        const additionalContribution = maxHSA - currentHSA;
        const savings = additionalContribution * getMarginalRate(form);

        return {
            id: 'retirement-hsa',
            name: 'Maximize HSA Contribution',
            category: CATEGORY.RETIREMENT,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.EASY,
            description: 'HSA offers triple tax advantage: deduction, growth, and tax-free withdrawals.',
            details: [
                `Current HSA contribution: $${currentHSA.toLocaleString()}`,
                `Maximum (${hsaCoverage}): $${maxHSA.toLocaleString()}`,
                `Additional room: $${additionalContribution.toLocaleString()}`,
                age >= 55 ? 'Includes $1,000 catch-up contribution' : '',
            ].filter(Boolean),
            benefits: [
                'Tax deduction for contributions',
                'Tax-free investment growth',
                'Tax-free withdrawals for medical expenses',
                'No "use it or lose it" - rolls over forever',
                'After 65, non-medical withdrawals taxed as income (like IRA)',
            ],
            requirements: [
                'Must have High Deductible Health Plan (HDHP)',
                'Cannot be enrolled in Medicare',
                'Cannot be claimed as dependent',
            ],
            timeline: 'Before April 15, 2026',
        };
    }

    return null;
}

/**
 * Analyze Spousal IRA opportunity
 */
function analyzeSpousalIRA(form) {
    const filingStatus = form.filingStatus;

    // Only for married couples
    if (filingStatus !== 'married') return null;

    // Check if there's earned income
    const wages = parseFloat(form.totalWages) || 0;
    if (wages <= 0) return null;

    // Assume spouse has no income (would need spouse income field)
    // For now, provide informational recommendation
    const age = calculateAge(form.spouseBirthDate || form.birthDate);
    const maxContribution = LIMITS_2025.traditionalIRA + (age >= 50 ? LIMITS_2025.catchUpIRA : 0);
    const savings = maxContribution * getMarginalRate(form);

    return {
        id: 'retirement-spousal-ira',
        name: 'Spousal IRA Contribution',
        category: CATEGORY.RETIREMENT,
        potentialSavings: Math.round(savings),
        difficulty: DIFFICULTY.EASY,
        description: 'A non-working spouse can contribute to an IRA based on the working spouse\'s income.',
        details: [
            `Maximum contribution: $${maxContribution.toLocaleString()}`,
            'Based on working spouse\'s earned income',
            'Reduces total household taxable income',
        ],
        requirements: [
            'Must file jointly',
            'Working spouse must have sufficient earned income',
            'Combined contributions cannot exceed total earned income',
        ],
        timeline: 'Before April 15, 2026',
    };
}

/**
 * Analyze Retirement Saver's Credit opportunity
 */
function analyzeSaversCredit(form) {
    const currentTax = calculateTotalTax(form);
    const agi = currentTax.agi;
    const filingStatus = form.filingStatus || 'single';

    let agiLimit;
    switch (filingStatus) {
        case 'married':
        case 'widow':
            agiLimit = LIMITS_2025.saversCreditAGI.married;
            break;
        case 'head':
            agiLimit = LIMITS_2025.saversCreditAGI.hoh;
            break;
        default:
            agiLimit = LIMITS_2025.saversCreditAGI.single;
    }

    // Skip if AGI too high
    if (agi > agiLimit) return null;

    // Check current retirement contributions
    const retirementContributions =
        (parseFloat(form.retirement401k) || 0) +
        (parseFloat(form.iraDeduction) || 0);

    // Credit is 10%, 20%, or 50% of up to $2,000 in contributions
    const maxCreditableContribution = 2000;
    const creditableAmount = Math.min(retirementContributions, maxCreditableContribution);

    // Determine credit rate based on AGI
    let creditRate;
    const thresholds = filingStatus === 'married'
        ? { high: 46000, mid: 50000 }
        : filingStatus === 'head'
            ? { high: 34500, mid: 37500 }
            : { high: 23000, mid: 25000 };

    if (agi <= thresholds.high) {
        creditRate = 0.50;
    } else if (agi <= thresholds.mid) {
        creditRate = 0.20;
    } else {
        creditRate = 0.10;
    }

    const potentialCredit = creditableAmount * creditRate;

    if (potentialCredit > 0) {
        return {
            id: 'retirement-savers-credit',
            name: 'Claim Retirement Saver\'s Credit',
            category: CATEGORY.CREDITS,
            potentialSavings: Math.round(potentialCredit),
            difficulty: DIFFICULTY.EASY,
            description: `You qualify for a ${creditRate * 100}% credit on retirement contributions (up to $2,000).`,
            details: [
                `Your AGI: $${agi.toLocaleString()}`,
                `AGI limit: $${agiLimit.toLocaleString()}`,
                `Credit rate: ${creditRate * 100}%`,
                `Maximum credit: $${(2000 * creditRate).toLocaleString()} per person`,
            ],
            benefits: [
                'Non-refundable credit reduces tax liability',
                'Stacks with deduction for retirement contributions',
                'Up to $1,000 credit per person ($2,000 MFJ)',
            ],
            timeline: 'This Return',
        };
    }

    return null;
}

/**
 * Analyze SEP-IRA for self-employed
 */
function analyzeSEPIRA(form) {
    if (!form.hasScheduleC) return null;

    const scheduleC = form.scheduleC || {};

    // Handle both PDF-extracted netProfit and manually entered grossReceipts/expenses
    let netProfit = 0;
    if (scheduleC.netProfit !== undefined && scheduleC.netProfit !== 0) {
        netProfit = parseFloat(scheduleC.netProfit) || 0;
    } else {
        const grossReceipts = parseFloat(scheduleC.grossReceipts) || 0;
        const expenses = parseFloat(scheduleC.expenses) || 0;
        netProfit = grossReceipts - expenses;
    }

    if (netProfit <= 0) return null;

    // SEP-IRA limit: 25% of net self-employment income (after SE tax deduction)
    const seDeduction = netProfit * 0.9235 * 0.153 * 0.5; // Rough SE tax deduction
    const netForSEP = netProfit - seDeduction;
    const maxSEP = Math.min(netForSEP * 0.25, LIMITS_2025.sepIRA);

    const currentSEP = parseFloat(form.selfEmployedSEPSimple) || 0;

    if (currentSEP < maxSEP) {
        const additionalContribution = maxSEP - currentSEP;
        const savings = additionalContribution * getMarginalRate(form);

        return {
            id: 'retirement-sep-ira',
            name: 'Maximize SEP-IRA Contribution',
            category: CATEGORY.RETIREMENT,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Self-employed individuals can contribute up to 25% of net self-employment income.',
            details: [
                `Net self-employment income: $${netProfit.toLocaleString()}`,
                `Maximum SEP contribution: $${maxSEP.toLocaleString()}`,
                `Current contribution: $${currentSEP.toLocaleString()}`,
                `Additional room: $${additionalContribution.toLocaleString()}`,
            ],
            benefits: [
                'High contribution limits (up to $69,000)',
                'Easy to set up and administer',
                'Deadline extends to tax filing deadline',
                'Flexible - no annual contribution required',
            ],
            timeline: 'Before Tax Filing Deadline',
        };
    }

    return null;
}

/**
 * Analyze Backdoor Roth opportunity
 */
function analyzeBackdoorRoth(form) {
    const currentTax = calculateTotalTax(form);
    const agi = currentTax.agi;
    const filingStatus = form.filingStatus || 'single';

    // Roth IRA phase-out limits (2025)
    const rothLimits = {
        single: { start: 150000, end: 165000 },
        married: { start: 236000, end: 246000 },
        marriedSeparate: { start: 0, end: 10000 },
        head: { start: 150000, end: 165000 },
    };

    const limits = rothLimits[filingStatus] || rothLimits.single;

    // Only suggest if income exceeds Roth limit
    if (agi < limits.end) return null;

    const maxIRA = LIMITS_2025.traditionalIRA + (calculateAge(form.birthDate) >= 50 ? LIMITS_2025.catchUpIRA : 0);

    return {
        id: 'retirement-backdoor-roth',
        name: 'Consider Backdoor Roth IRA',
        category: CATEGORY.RETIREMENT,
        potentialSavings: 0, // Long-term benefit, not immediate savings
        difficulty: DIFFICULTY.MEDIUM,
        description: 'Your income exceeds Roth IRA limits. Consider the "Backdoor Roth" strategy.',
        details: [
            `Your AGI: $${agi.toLocaleString()}`,
            `Roth IRA income limit: $${limits.end.toLocaleString()}`,
            `Maximum contribution: $${maxIRA.toLocaleString()}/year`,
        ],
        strategy: [
            '1. Contribute to non-deductible Traditional IRA',
            '2. Convert to Roth IRA (pay tax on any gains)',
            '3. Ensure no other pre-tax IRA balances (pro-rata rule)',
        ],
        benefits: [
            'Tax-free growth and withdrawals in retirement',
            'No required minimum distributions (RMDs)',
            'Pass to heirs tax-free',
        ],
        considerations: [
            'Pro-rata rule applies if you have existing IRA balances',
            'No immediate tax benefit',
            'Consult a tax professional',
        ],
        isLongTerm: true,
        timeline: 'Long-term Strategy',
    };
}

/**
 * Analyze Roth conversion opportunity
 */
function analyzeRothConversion(form) {
    const currentTax = calculateTotalTax(form);
    const taxableIncome = currentTax.taxableIncome;
    const filingStatus = form.filingStatus || 'single';

    // Check if they have Traditional IRA
    const iraDistributions = parseFloat(form.taxableIra) || 0;

    // Look for low-income years (opportunity to convert at lower rates)
    // Check if there's room in current bracket
    const brackets = {
        single: [
            { limit: 11925, rate: 0.10 },
            { limit: 48475, rate: 0.12 },
            { limit: 103350, rate: 0.22 },
            { limit: 197300, rate: 0.24 },
        ],
        married: [
            { limit: 23850, rate: 0.10 },
            { limit: 96950, rate: 0.12 },
            { limit: 206700, rate: 0.22 },
            { limit: 394600, rate: 0.24 },
        ],
    };

    const bracketList = brackets[filingStatus] || brackets.single;

    // Find current bracket and room to top
    for (let i = 0; i < bracketList.length - 1; i++) {
        if (taxableIncome < bracketList[i + 1].limit) {
            const roomInBracket = bracketList[i + 1].limit - taxableIncome;

            if (roomInBracket > 5000) {
                return {
                    id: 'retirement-roth-conversion',
                    name: 'Roth Conversion Opportunity',
                    category: CATEGORY.RETIREMENT,
                    potentialSavings: 0, // Long-term benefit
                    difficulty: DIFFICULTY.MEDIUM,
                    description: `You have room in the ${bracketList[i].rate * 100}% bracket for Roth conversion.`,
                    details: [
                        `Current taxable income: $${taxableIncome.toLocaleString()}`,
                        `Current bracket: ${bracketList[i].rate * 100}%`,
                        `Room before next bracket: $${roomInBracket.toLocaleString()}`,
                        'Convert Traditional IRA to Roth while in lower bracket',
                    ],
                    benefits: [
                        'Lock in current (potentially lower) tax rate',
                        'Tax-free growth going forward',
                        'Reduce future RMD obligations',
                        'Tax diversification in retirement',
                    ],
                    isLongTerm: true,
                    timeline: 'Before Dec 31',
                };
            }
            break;
        }
    }

    return null;
}

/**
 * Helper: Calculate age from birth date
 */
function calculateAge(birthDate) {
    if (!birthDate) return 40; // Default assumption

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
 * Helper: Estimate marginal tax rate
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
