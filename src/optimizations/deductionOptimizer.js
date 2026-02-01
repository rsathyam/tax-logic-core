/**
 * Deduction Optimizer
 * Analyzes itemized vs standard deduction, SALT cap, charitable bunching, and more
 */

import { calculateTotalTax, calculateTaxWithOverrides, STANDARD_DEDUCTIONS_2025 } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';

// 2025 SALT cap (increased from $10K to $40K by OBBBA)
const SALT_CAP_2025 = 40000;
const SALT_CAP_MFS = 20000;

// QCD age requirement
const QCD_AGE_REQUIREMENT = 70.5;
const QCD_MAX_2025 = 108000;

/**
 * Analyze all deduction optimization opportunities
 */
export function analyzeDeductionOptimizations(form) {
    const optimizations = [];

    // Itemized vs Standard comparison
    const itemizedOpt = analyzeItemizedVsStandard(form);
    if (itemizedOpt) {
        optimizations.push(itemizedOpt);
    }

    // SALT optimization (new $40K cap)
    const saltOpt = analyzeSALTOptimization(form);
    if (saltOpt) {
        optimizations.push(saltOpt);
    }

    // Charitable bunching strategy
    const charityOpt = analyzeCharitableBunching(form);
    if (charityOpt) {
        optimizations.push(charityOpt);
    }

    // QCD for 70.5+ taxpayers
    const qcdOpt = analyzeQCDOpportunity(form);
    if (qcdOpt) {
        optimizations.push(qcdOpt);
    }

    // Appreciated asset donation
    const appreciatedAssetOpt = analyzeAppreciatedAssetDonation(form);
    if (appreciatedAssetOpt) {
        optimizations.push(appreciatedAssetOpt);
    }

    // Medical expense timing
    const medicalOpt = analyzeMedicalExpenseTiming(form);
    if (medicalOpt) {
        optimizations.push(medicalOpt);
    }

    // Above-the-line deductions
    const atlOpts = analyzeAboveTheLineDeductions(form);
    optimizations.push(...atlOpts);

    return optimizations;
}

/**
 * Analyze Itemized vs Standard deduction
 */
function analyzeItemizedVsStandard(form) {
    const filingStatus = form.filingStatus || 'single';
    const standardDeduction = STANDARD_DEDUCTIONS_2025[filingStatus] || STANDARD_DEDUCTIONS_2025.single;

    // Calculate current itemized total
    const saltCap = filingStatus === 'marriedSeparate' ? SALT_CAP_MFS : SALT_CAP_2025;
    const actualSalt = Math.min(
        (parseFloat(form.stateLocalTaxes) || 0) + (parseFloat(form.realEstateTaxes) || 0),
        saltCap
    );

    const itemizedTotal =
        (parseFloat(form.medicalExpenses) || 0) +
        actualSalt +
        (parseFloat(form.mortgageInterest) || 0) +
        (parseFloat(form.charityCash) || 0) +
        (parseFloat(form.charityNonCash) || 0) +
        (parseFloat(form.casualtyLosses) || 0) +
        (parseFloat(form.otherItemized) || 0);

    const currentDeductionType = form.deductionType || 'standard';

    // If currently itemizing but standard is better
    if (currentDeductionType === 'itemized' && standardDeduction > itemizedTotal) {
        const savings = (standardDeduction - itemizedTotal) * getMarginalRate(form);

        return {
            id: 'deduction-switch-to-standard',
            name: 'Switch to Standard Deduction',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.EASY,
            description: 'The standard deduction exceeds your itemized deductions.',
            details: [
                `Your itemized deductions: $${itemizedTotal.toLocaleString()}`,
                `Standard deduction: $${standardDeduction.toLocaleString()}`,
                `Additional deduction: $${(standardDeduction - itemizedTotal).toLocaleString()}`,
            ],
            formOverrides: { deductionType: 'standard' },
            timeline: 'This Return',
        };
    }

    // If currently taking standard but itemizing is better
    if (currentDeductionType !== 'itemized' && itemizedTotal > standardDeduction) {
        const savings = (itemizedTotal - standardDeduction) * getMarginalRate(form);

        return {
            id: 'deduction-switch-to-itemized',
            name: 'Switch to Itemized Deductions',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.EASY,
            description: 'Your itemized deductions exceed the standard deduction.',
            details: [
                `Your itemized deductions: $${itemizedTotal.toLocaleString()}`,
                `Standard deduction: $${standardDeduction.toLocaleString()}`,
                `Additional deduction: $${(itemizedTotal - standardDeduction).toLocaleString()}`,
            ],
            formOverrides: { deductionType: 'itemized' },
            timeline: 'This Return',
        };
    }

    return null;
}

/**
 * Analyze SALT optimization with new $40K cap
 */
function analyzeSALTOptimization(form) {
    const filingStatus = form.filingStatus || 'single';
    const saltCap = filingStatus === 'marriedSeparate' ? SALT_CAP_MFS : SALT_CAP_2025;

    const stateLocalTaxes = parseFloat(form.stateLocalTaxes) || 0;
    const realEstateTaxes = parseFloat(form.realEstateTaxes) || 0;
    const totalSALT = stateLocalTaxes + realEstateTaxes;

    // Check if they're hitting the cap
    if (totalSALT > saltCap) {
        const lostDeduction = totalSALT - saltCap;
        const lostTaxBenefit = lostDeduction * getMarginalRate(form);

        return {
            id: 'deduction-salt-cap-hit',
            name: 'SALT Cap Limiting Your Deduction',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: 0, // Informational
            difficulty: DIFFICULTY.HARD,
            description: `Your SALT deduction is capped at $${saltCap.toLocaleString()} (2025 increased limit)`,
            details: [
                `Total SALT paid: $${totalSALT.toLocaleString()}`,
                `Deduction allowed: $${saltCap.toLocaleString()}`,
                `Lost deduction: $${lostDeduction.toLocaleString()}`,
                `Approximate lost tax benefit: $${lostTaxBenefit.toLocaleString()}`,
            ],
            strategies: [
                'Consider Pass-Through Entity Tax (PTET) election if you have business income',
                'Review property tax assessment for potential protest',
                'Time major property purchases to spread tax payments',
                'Consider Donor Advised Fund for charitable giving to maximize itemized deductions',
            ],
            isInformational: true,
            timeline: 'Future Planning',
        };
    }

    // Check if they're missing SALT deduction opportunity
    if (totalSALT > 0 && form.deductionType !== 'itemized') {
        const standardDeduction = STANDARD_DEDUCTIONS_2025[filingStatus] || STANDARD_DEDUCTIONS_2025.single;
        const itemizedTotal = calculateItemizedTotal(form);

        if (itemizedTotal + totalSALT > standardDeduction) {
            return {
                id: 'deduction-maximize-salt',
                name: 'SALT Deduction Opportunity',
                category: CATEGORY.DEDUCTIONS,
                potentialSavings: Math.round((itemizedTotal + totalSALT - standardDeduction) * getMarginalRate(form)),
                difficulty: DIFFICULTY.EASY,
                description: 'Including SALT in your itemized deductions may benefit you.',
                details: [
                    `SALT paid: $${totalSALT.toLocaleString()}`,
                    `New 2025 SALT cap: $${saltCap.toLocaleString()}`,
                    'Consider itemizing with SALT included',
                ],
                timeline: 'This Return',
            };
        }
    }

    return null;
}

/**
 * Analyze charitable bunching strategy
 */
function analyzeCharitableBunching(form) {
    const filingStatus = form.filingStatus || 'single';
    const standardDeduction = STANDARD_DEDUCTIONS_2025[filingStatus] || STANDARD_DEDUCTIONS_2025.single;

    const charityCash = parseFloat(form.charityCash) || 0;
    const charityNonCash = parseFloat(form.charityNonCash) || 0;
    const totalCharity = charityCash + charityNonCash;

    // Calculate itemized total without charity
    const saltCap = filingStatus === 'marriedSeparate' ? SALT_CAP_MFS : SALT_CAP_2025;
    const actualSalt = Math.min(
        (parseFloat(form.stateLocalTaxes) || 0) + (parseFloat(form.realEstateTaxes) || 0),
        saltCap
    );
    const otherItemized = (parseFloat(form.medicalExpenses) || 0) +
        actualSalt +
        (parseFloat(form.mortgageInterest) || 0) +
        (parseFloat(form.casualtyLosses) || 0) +
        (parseFloat(form.otherItemized) || 0);

    // Check if they're near the itemization threshold
    const gap = standardDeduction - otherItemized;

    if (gap > 0 && gap < 10000 && totalCharity > 0) {
        const bunchedAmount = totalCharity * 2; // Two years of giving
        const bunchedSavings = totalCharity * getMarginalRate(form);

        return {
            id: 'deduction-charitable-bunching',
            name: 'Consider Charitable Bunching Strategy',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: Math.round(bunchedSavings),
            difficulty: DIFFICULTY.MEDIUM,
            description: "Bundle two years of charitable giving into one year to exceed the standard deduction.",
            details: [
                `Current charity: $${totalCharity.toLocaleString()}`,
                `Other itemized deductions: $${otherItemized.toLocaleString()}`,
                `Standard deduction: $${standardDeduction.toLocaleString()}`,
                `Gap to itemization: $${gap.toLocaleString()}`,
            ],
            strategy: [
                'Give 2 years worth of donations in one year',
                'Itemize in the "bunching" year, take standard deduction the next',
                'Consider a Donor Advised Fund (DAF) for timing flexibility',
                'You donate to DAF now, grant to charities over time',
            ],
            timeline: 'Current/Next Year',
        };
    }

    return null;
}

/**
 * Analyze QCD opportunity for 70.5+ taxpayers
 */
function analyzeQCDOpportunity(form) {
    // Check if taxpayer is 70.5 or older
    const birthDate = form.birthDate;
    if (!birthDate) return null;

    const age = calculateAge(birthDate);
    if (age < QCD_AGE_REQUIREMENT) return null;

    // Check if they have IRA distributions
    const iraDistributions = parseFloat(form.taxableIra) || 0;
    if (iraDistributions <= 0) return null;

    // Check if they're making charitable donations
    const charitableGiving = (parseFloat(form.charityCash) || 0) + (parseFloat(form.charityNonCash) || 0);
    if (charitableGiving <= 0) return null;

    // Calculate potential QCD benefit
    const qcdAmount = Math.min(iraDistributions, charitableGiving, QCD_MAX_2025);
    const savings = qcdAmount * getMarginalRate(form);

    return {
        id: 'deduction-qcd',
        name: 'Qualified Charitable Distribution (QCD)',
        category: CATEGORY.DEDUCTIONS,
        potentialSavings: Math.round(savings),
        difficulty: DIFFICULTY.MEDIUM,
        description: 'Donate directly from your IRA to charity to reduce taxable income.',
        details: [
            `IRA distributions: $${iraDistributions.toLocaleString()}`,
            `Current charitable giving: $${charitableGiving.toLocaleString()}`,
            `Potential QCD amount: $${qcdAmount.toLocaleString()}`,
            `Maximum QCD for 2025: $${QCD_MAX_2025.toLocaleString()}`,
        ],
        benefits: [
            'Reduces taxable income (better than itemized deduction)',
            'Counts toward Required Minimum Distribution (RMD)',
            'Reduces AGI (may lower Medicare premiums, SS taxation)',
            'Works even if you take the standard deduction',
        ],
        requirements: [
            'Must be 70½ or older',
            'Must transfer directly from IRA to qualified charity',
            'Does not apply to 401(k) or other employer plans',
            'Charity must be 501(c)(3) organization',
        ],
        timeline: 'This Return (if done before Dec 31)',
    };
}

/**
 * Analyze appreciated asset donation opportunity
 */
function analyzeAppreciatedAssetDonation(form) {
    // Check for long-term capital gains (indicates appreciated assets)
    const longTermGains = form.hasScheduleD
        ? parseFloat(form.scheduleD?.longTermGain) || 0
        : 0;

    // Check for charitable giving
    const charityCash = parseFloat(form.charityCash) || 0;

    if (longTermGains > 1000 && charityCash > 0) {
        // Estimate: if they donated appreciated stock instead of cash
        const potentialDonation = Math.min(longTermGains, charityCash);
        const avoiddedCapGainsTax = potentialDonation * 0.15; // Assuming 15% LTCG rate

        return {
            id: 'deduction-appreciated-assets',
            name: 'Donate Appreciated Securities Instead of Cash',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: Math.round(avoiddedCapGainsTax),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Donate appreciated securities to avoid capital gains while getting full deduction.',
            details: [
                `Your long-term gains: $${longTermGains.toLocaleString()}`,
                `Cash charitable giving: $${charityCash.toLocaleString()}`,
                `By donating appreciated stock, you avoid capital gains tax`,
                `AND get a deduction for the full fair market value`,
            ],
            benefits: [
                'Avoid up to 23.8% capital gains tax (including NIIT)',
                'Deduct full fair market value of donation',
                'Charity receives the full value',
                'Replace donated stock position with cash if desired',
            ],
            requirements: [
                'Must have held security for over 1 year (long-term)',
                'Most charities accept stock donations',
                'Deduction limited to 30% of AGI (50% for cash)',
            ],
            timeline: 'Future Charitable Giving',
        };
    }

    return null;
}

/**
 * Analyze medical expense timing
 */
function analyzeMedicalExpenseTiming(form) {
    const currentTax = calculateTotalTax(form);
    const agi = currentTax.agi;
    const medicalExpenses = parseFloat(form.medicalExpenses) || 0;

    // Medical expenses must exceed 7.5% of AGI
    const threshold = agi * 0.075;

    // If close to threshold, consider timing
    if (medicalExpenses > 0 && medicalExpenses < threshold && medicalExpenses > threshold * 0.5) {
        const gap = threshold - medicalExpenses;

        return {
            id: 'deduction-medical-timing',
            name: 'Medical Expense Timing Strategy',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: Math.round(gap * getMarginalRate(form)),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Your medical expenses are close to the 7.5% AGI deduction threshold.',
            details: [
                `Current medical expenses: $${medicalExpenses.toLocaleString()}`,
                `7.5% AGI threshold: $${threshold.toLocaleString()}`,
                `Gap to threshold: $${gap.toLocaleString()}`,
            ],
            strategy: [
                'Consider bunching elective medical expenses into one year',
                'Schedule procedures, dental work, vision care strategically',
                'Prepay upcoming medical expenses before Dec 31',
                'Include often-missed expenses: mileage to appointments, medical equipment',
            ],
            timeline: 'Before Dec 31',
        };
    }

    return null;
}

/**
 * Analyze above-the-line deduction opportunities
 */
function analyzeAboveTheLineDeductions(form) {
    const optimizations = [];

    // Educator expenses
    const isEducator = form.isEducator || false;
    const educatorExpenses = parseFloat(form.educatorExpenses) || 0;
    const maxEducatorExpense = 300;

    if (isEducator && educatorExpenses < maxEducatorExpense) {
        optimizations.push({
            id: 'deduction-educator-expense',
            name: 'Maximize Educator Expense Deduction',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: Math.round((maxEducatorExpense - educatorExpenses) * getMarginalRate(form)),
            difficulty: DIFFICULTY.EASY,
            description: `Teachers can deduct up to $${maxEducatorExpense} in classroom expenses.`,
            details: [
                `Current claimed: $${educatorExpenses}`,
                `Maximum allowed: $${maxEducatorExpense}`,
                `Remaining: $${maxEducatorExpense - educatorExpenses}`,
            ],
            examples: [
                'Classroom supplies and materials',
                'Books and computer equipment',
                'COVID-19 protective items',
                'Professional development courses',
            ],
            timeline: 'This Return',
        });
    }

    // Student loan interest
    const studentLoanInterest = parseFloat(form.studentLoanInterest) || 0;
    const maxStudentLoanDeduction = 2500;

    if (studentLoanInterest > 0 && studentLoanInterest < maxStudentLoanDeduction) {
        // This is more informational - they may have maxed it for their actual situation
    }

    return optimizations;
}

/**
 * Helper: Calculate itemized total
 */
function calculateItemizedTotal(form) {
    const filingStatus = form.filingStatus || 'single';
    const saltCap = filingStatus === 'marriedSeparate' ? SALT_CAP_MFS : SALT_CAP_2025;

    const actualSalt = Math.min(
        (parseFloat(form.stateLocalTaxes) || 0) + (parseFloat(form.realEstateTaxes) || 0),
        saltCap
    );

    return (parseFloat(form.medicalExpenses) || 0) +
        actualSalt +
        (parseFloat(form.mortgageInterest) || 0) +
        (parseFloat(form.charityCash) || 0) +
        (parseFloat(form.charityNonCash) || 0) +
        (parseFloat(form.casualtyLosses) || 0) +
        (parseFloat(form.otherItemized) || 0);
}

/**
 * Helper: Estimate marginal tax rate
 */
function getMarginalRate(form) {
    const currentTax = calculateTotalTax(form);
    const taxableIncome = currentTax.taxableIncome;

    // Rough brackets for estimation
    if (taxableIncome > 626350) return 0.37;
    if (taxableIncome > 250525) return 0.35;
    if (taxableIncome > 197300) return 0.32;
    if (taxableIncome > 103350) return 0.24;
    if (taxableIncome > 48475) return 0.22;
    if (taxableIncome > 11925) return 0.12;
    return 0.10;
}

/**
 * Helper: Calculate age from birth date
 */
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    // For QCD, use 70.5 threshold
    if (monthDiff >= 6) {
        return age + 0.5;
    }

    return age;
}
