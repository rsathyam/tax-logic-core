// 2025 Tax Brackets (estimated based on inflation adjustments)
// These are approximate and should be verified against final IRS publication

export const TAX_BRACKETS_2025 = {
    single: [
        [0, 0.10],
        [11925, 0.12],
        [48475, 0.22],
        [103350, 0.24],
        [197300, 0.32],
        [250525, 0.35],
        [626350, 0.37],
    ],
    married: [
        [0, 0.10],
        [23850, 0.12],
        [96950, 0.22],
        [206700, 0.24],
        [394600, 0.32],
        [501050, 0.35],
        [751600, 0.37],
    ],
    marriedSeparate: [
        [0, 0.10],
        [11925, 0.12],
        [48475, 0.22],
        [103350, 0.24],
        [197300, 0.32],
        [250525, 0.35],
        [375800, 0.37],
    ],
    head: [
        [0, 0.10],
        [17000, 0.12],
        [64850, 0.22],
        [103350, 0.24],
        [197300, 0.32],
        [250500, 0.35],
        [626350, 0.37],
    ],
    widow: [
        [0, 0.10],
        [23850, 0.12],
        [96950, 0.22],
        [206700, 0.24],
        [394600, 0.32],
        [501050, 0.35],
        [751600, 0.37],
    ],
};

export const STANDARD_DEDUCTIONS_2025 = {
    single: 15700,
    married: 31400,
    marriedSeparate: 15700,
    head: 23500,
    widow: 31400,
};

// Capital gains tax rates for 2025
export const CAPITAL_GAINS_BRACKETS_2025 = {
    single: [
        [0, 0],
        [48350, 0.15],
        [533400, 0.20],
    ],
    married: [
        [0, 0],
        [96700, 0.15],
        [600050, 0.20],
    ],
    marriedSeparate: [
        [0, 0],
        [48350, 0.15],
        [300025, 0.20],
    ],
    head: [
        [0, 0],
        [64750, 0.15],
        [566700, 0.20],
    ],
    widow: [
        [0, 0],
        [96700, 0.15],
        [600050, 0.20],
    ],
};

/**
 * Calculate tax using progressive brackets
 */
export function calculateBracketTax(income, brackets) {
    if (income <= 0) return 0;

    let tax = 0;
    for (let i = 0; i < brackets.length; i++) {
        const [limit, rate] = brackets[i];
        const nextLimit = brackets[i + 1]?.[0] ?? Infinity;

        if (income > nextLimit) {
            tax += (nextLimit - limit) * rate;
        } else {
            tax += (income - limit) * rate;
            break;
        }
    }
    return Math.max(0, tax);
}

/**
 * Calculate capital gains tax
 */
export function calculateCapitalGainsTax(taxableIncome, capitalGains, filingStatus) {
    if (capitalGains <= 0) return 0;

    const brackets = CAPITAL_GAINS_BRACKETS_2025[filingStatus] || CAPITAL_GAINS_BRACKETS_2025.single;

    // Capital gains are "stacked" on top of ordinary income
    const totalIncome = taxableIncome + capitalGains;

    let tax = 0;
    let remainingGains = capitalGains;

    for (let i = brackets.length - 1; i >= 0 && remainingGains > 0; i--) {
        const [threshold, rate] = brackets[i];

        if (totalIncome > threshold) {
            const gainsTaxedAtThisRate = Math.min(remainingGains, totalIncome - Math.max(taxableIncome, threshold));
            tax += gainsTaxedAtThisRate * rate;
            remainingGains -= gainsTaxedAtThisRate;
        }
    }

    return Math.max(0, tax);
}

/**
 * Calculate self-employment tax
 */
export function calculateSelfEmploymentTax(netSelfEmploymentIncome) {
    if (netSelfEmploymentIncome <= 0) return { tax: 0, deduction: 0 };

    // 92.35% of net SE income is subject to SE tax
    const taxableBase = netSelfEmploymentIncome * 0.9235;

    // Social Security portion (12.4%) up to wage base ($176,100 for 2025 estimated)
    const ssWageBase = 176100;
    const ssTax = Math.min(taxableBase, ssWageBase) * 0.124;

    // Medicare portion (2.9%) on all earnings
    const medicareTax = taxableBase * 0.029;

    // Additional Medicare tax (0.9%) over threshold
    const additionalMedicareThreshold = 200000; // Single, $250k for married
    const additionalMedicare = Math.max(0, taxableBase - additionalMedicareThreshold) * 0.009;

    const totalTax = ssTax + medicareTax + additionalMedicare;

    // Deduction is 50% of SE tax
    const deduction = totalTax * 0.5;

    return { tax: totalTax, deduction };
}

/**
 * Calculate Net Investment Income Tax (NIIT)
 */
export function calculateNIIT(agi, netInvestmentIncome, filingStatus) {
    const thresholds = {
        single: 200000,
        married: 250000,
        marriedSeparate: 125000,
        head: 200000,
        widow: 250000,
    };

    const threshold = thresholds[filingStatus] || 200000;
    const excessAGI = Math.max(0, agi - threshold);
    const taxableNII = Math.min(excessAGI, netInvestmentIncome);

    return taxableNII * 0.038;
}

/**
 * Main tax calculation function
 */
export function calculateTotalTax(form) {
    const filingStatus = form.filingStatus || 'single';

    // Calculate total income
    const totalWages = parseFloat(form.totalWages) || 0;
    const taxableInterest = parseFloat(form.taxableInterest) || 0;
    const ordinaryDividends = parseFloat(form.ordinaryDividends) || 0;
    const qualifiedDividends = parseFloat(form.qualifiedDividends) || 0;
    const taxableIra = parseFloat(form.taxableIra) || 0;
    const taxablePensions = parseFloat(form.taxablePensions) || 0;
    const taxableSocialSecurity = parseFloat(form.taxableSocialSecurity) || 0;
    const capitalGainLoss = parseFloat(form.capitalGainLoss) || 0;
    const otherIncome = parseFloat(form.otherIncome) || 0;

    // Schedule C net profit (supports both netProfit and grossReceipts/expenses)
    let scheduleC = 0;
    if (form.hasScheduleC && form.scheduleC) {
        // PDF parser provides netProfit directly
        if (form.scheduleC.netProfit !== undefined) {
            scheduleC = parseFloat(form.scheduleC.netProfit) || 0;
        } else {
            // Manual entry provides grossReceipts and expenses
            scheduleC = (parseFloat(form.scheduleC.grossReceipts) || 0) -
                (parseFloat(form.scheduleC.expenses) || 0);
        }
    }

    // Schedule E net rental
    let scheduleE = 0;
    if (form.hasScheduleE && form.scheduleE) {
        if (form.scheduleE.netIncome !== undefined) {
            scheduleE = parseFloat(form.scheduleE.netIncome) || 0;
        } else {
            scheduleE = (parseFloat(form.scheduleE.rentalIncome) || 0) -
                (parseFloat(form.scheduleE.rentalExpenses) || 0);
        }
    }

    // Schedule D capital gains
    let scheduleD = 0;
    if (form.hasScheduleD && form.scheduleD) {
        scheduleD = (parseFloat(form.scheduleD.shortTermGain) || 0) +
            (parseFloat(form.scheduleD.longTermGain) || 0);
    }

    // Use Schedule D if present, otherwise fallback to manual Capital Gain line
    // Prevents double counting if both are populated
    const totalCapitalGains = (form.hasScheduleD && form.scheduleD) ? scheduleD : (parseFloat(form.capitalGainLoss) || 0);

    const totalIncome = totalWages + taxableInterest + ordinaryDividends + taxableIra +
        taxablePensions + taxableSocialSecurity + otherIncome +
        scheduleC + scheduleE + totalCapitalGains;

    // Helper to calculate age (local scope or imported if available, duplicating for safety here as per plan)
    const calculateAge = (birthDate) => {
        if (!birthDate) return 40;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    // New 2025 OBBBA Deductions with Phase-outs
    // Phase-out: Single $150k-$400k, Married $300k-$550k
    const getPhaseOutPct = (income) => {
        const limits = filingStatus === 'married'
            ? { start: 300000, end: 550000 }
            : { start: 150000, end: 400000 };

        if (income <= limits.start) return 1.0;
        if (income >= limits.end) return 0.0;
        return 1.0 - ((income - limits.start) / (limits.end - limits.start));
    };

    // We need AGI to calculate phase-out, but deductions reduce AGI. 
    // OBBBA uses Modified AGI *before* these specific deductions.
    const tentativeTotalIncome = totalIncome;
    const tentativeAdjustments = (parseFloat(form.educatorExpenses) || 0) +
        (parseFloat(form.hsaDeduction) || 0) +
        (parseFloat(form.selfEmploymentTaxDeduction) || 0) +
        (parseFloat(form.selfEmployedSEPSimple) || 0) +
        (parseFloat(form.selfEmployedHealthInsurance) || 0) +
        (parseFloat(form.penaltyEarlyWithdrawal) || 0) +
        (parseFloat(form.alimonyPaid) || 0) +
        (parseFloat(form.iraDeduction) || 0) +
        (parseFloat(form.studentLoanInterest) || 0);

    const magiForPhaseOut = tentativeTotalIncome - tentativeAdjustments;
    const phaseOutPct = getPhaseOutPct(magiForPhaseOut);

    const tipsDeduction = Math.min(parseFloat(form.tipIncome) || 0, 25000) * phaseOutPct;
    const overtimeDeduction = Math.min(parseFloat(form.overtimeIncome) || 0, 12500) * phaseOutPct;
    const autoLoanDeduction = Math.min(parseFloat(form.autoLoanInterest) || 0, 10000);
    const seniorBonus = calculateAge(form.birthDate) >= 65 ? 6000 : 0;

    // Calculate adjustments
    const totalAdjustments =
        (parseFloat(form.educatorExpenses) || 0) +
        (parseFloat(form.hsaDeduction) || 0) +
        (parseFloat(form.selfEmploymentTaxDeduction) || 0) +
        (parseFloat(form.selfEmployedSEPSimple) || 0) +
        (parseFloat(form.selfEmployedHealthInsurance) || 0) +
        (parseFloat(form.penaltyEarlyWithdrawal) || 0) +
        (parseFloat(form.alimonyPaid) || 0) +
        (parseFloat(form.iraDeduction) || 0) +
        (parseFloat(form.studentLoanInterest) || 0) +
        // Add new deductions
        tipsDeduction +
        overtimeDeduction +
        autoLoanDeduction +
        seniorBonus;

    const agi = totalIncome - totalAdjustments;

    // Calculate deduction
    const standardDeduction = STANDARD_DEDUCTIONS_2025[filingStatus] || STANDARD_DEDUCTIONS_2025.single;
    // SALT cap for 2025 (OBBBA increased from $10K to $40K)
    const saltCap = filingStatus === 'marriedSeparate' ? 20000 : 40000;
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

    const deduction = form.deductionType === 'itemized' ? itemizedTotal : standardDeduction;

    // Calculate QBI Deduction (Simplified: 20% of Net Profit, limited by 20% of Taxable Income - Cap Gains)
    let qbiDeduction = 0;
    if (scheduleC > 0) {
        const tentativeQBI = scheduleC * 0.20;
        // Calculation: Taxable Income before QBI deduction
        const taxableBeforeQBI = Math.max(0, agi - deduction);
        const capGains = form.hasScheduleD ? (parseFloat(form.scheduleD?.longTermGain) || 0) : 0;
        const limit = (taxableBeforeQBI - capGains) * 0.20;
        qbiDeduction = Math.min(tentativeQBI, Math.max(0, limit));
    }

    // Taxable income (Subtract QBI)
    const taxableIncome = Math.max(0, agi - deduction - qbiDeduction);

    // Calculate regular tax (on ordinary income)
    const longTermGains = form.hasScheduleD ? (parseFloat(form.scheduleD?.longTermGain) || 0) : 0;
    const totalQualifiedIncome = qualifiedDividends + Math.max(0, longTermGains);
    const ordinaryTaxableIncome = Math.max(0, taxableIncome - totalQualifiedIncome);

    const brackets = TAX_BRACKETS_2025[filingStatus] || TAX_BRACKETS_2025.single;
    const regularTax = calculateBracketTax(ordinaryTaxableIncome, brackets);

    // Calculate capital gains tax on qualified dividends and long-term gains
    const capitalGainsTax = calculateCapitalGainsTax(ordinaryTaxableIncome, totalQualifiedIncome, filingStatus);

    // Self-employment tax
    const { tax: seTax } = calculateSelfEmploymentTax(scheduleC);

    // Calculate NIIT
    // Investment Income = Interest + Dividends + Cap Gains + Passive Rental (approx scheduleE)
    // Note: Active rental is not NII, but assuming passive for calculator safety
    const investmentIncome = taxableInterest + ordinaryDividends + totalCapitalGains + scheduleE;
    const niit = calculateNIIT(agi, investmentIncome, filingStatus);

    // Total tax before credits
    const totalTaxBeforeCredits = regularTax + capitalGainsTax + seTax + niit;

    // Calculate credits
    const qualifyingChildren = (form.dependents || []).filter(d => d.qualifyingChild && d.childTaxCredit).length;
    const otherDependents = (form.dependents || []).filter(d => !d.qualifyingChild).length;

    const estimatedChildCredit = qualifyingChildren * 2000;
    const estimatedOtherDependentsCredit = otherDependents * 500;

    const totalCredits =
        (parseFloat(form.childTaxCredit) || estimatedChildCredit) +
        (parseFloat(form.creditOtherDependents) || estimatedOtherDependentsCredit) +
        (parseFloat(form.educationCredits) || 0) +
        (parseFloat(form.retirementSaversCredit) || 0) +
        (parseFloat(form.childCareCredit) || 0) +
        (parseFloat(form.earnedIncomeCredit) || 0) +
        (parseFloat(form.otherCredits) || 0);

    // Tax after credits (can't go below 0 for non-refundable credits)
    const nonRefundableCredits = (parseFloat(form.childTaxCredit) || estimatedChildCredit) +
        (parseFloat(form.creditOtherDependents) || estimatedOtherDependentsCredit) +
        (parseFloat(form.educationCredits) || 0) +
        (parseFloat(form.retirementSaversCredit) || 0) +
        (parseFloat(form.childCareCredit) || 0);

    const refundableCredits = (parseFloat(form.earnedIncomeCredit) || 0) +
        (parseFloat(form.otherCredits) || 0);

    const taxAfterNonRefundable = Math.max(0, totalTaxBeforeCredits - nonRefundableCredits);
    const finalTax = taxAfterNonRefundable - refundableCredits;

    // Calculate payments and withholding
    const totalWithholding = parseFloat(form.totalWithholding) || 0;
    const estimatedPayments = parseFloat(form.estimatedTaxPayments) || 0;
    const priorYearApplied = parseFloat(form.amountAppliedFromPriorYear) || 0;
    const totalPayments = totalWithholding + estimatedPayments + priorYearApplied;

    // Refund or amount owed
    const refundOrOwed = totalPayments - finalTax;

    return {
        totalIncome,
        totalAdjustments,
        agi,
        deduction,
        taxableIncome,
        regularTax,
        capitalGainsTax,
        seTax,
        totalTaxBeforeCredits,
        totalCredits,
        finalTax,
        totalPayments,
        refundOrOwed,
        isRefund: refundOrOwed >= 0,
    };
}

/**
 * Calculate tax with form overrides - used for "what-if" scenario analysis
 * @param {Object} form - Original form data
 * @param {Object} overrides - Fields to override (e.g., { filingStatus: 'marriedSeparate' })
 * @returns {Object} Tax calculation result
 */
export function calculateTaxWithOverrides(form, overrides = {}) {
    const modifiedForm = { ...form, ...overrides };
    return calculateTotalTax(modifiedForm);
}
