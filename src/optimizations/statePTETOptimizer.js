/**
 * State Pass-Through Entity Tax (PTET) Optimizer
 * Analyzes state PTET elections for SALT cap workaround
 * 
 * Covers: NY PTET, CA PTE Elective Tax, NJ BAIT, and other state programs
 * 
 * IRS Authority:
 * - IRS Notice 2020-75 (PTET safe harbor)
 * - Individual state tax codes
 */

import { calculateTotalTax } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';

// State PTET Program Details (2025)
export const STATE_PTET_PROGRAMS = {
    CA: {
        name: 'California Elective Pass-Through Entity Tax',
        rate: 0.093, // 9.3% flat rate
        deadline: 'March 15 (estimated), June 15 (final election)',
        minOwners: 1,
        eligibleEntities: ['S-Corp', 'Partnership', 'LLC'],
        saltWorkaround: true,
        extendedTo: 2030, // Extended by AB 150
        notes: 'Generates credit equal to 9.3% of income for owners',
    },
    NY: {
        name: 'New York Pass-Through Entity Tax',
        rates: [
            { min: 0, max: 2000000, rate: 0.0685 },
            { min: 2000000, max: 5000000, rate: 0.0965 },
            { min: 5000000, max: 25000000, rate: 0.1030 },
            { min: 25000000, max: Infinity, rate: 0.1090 },
        ],
        deadline: 'March 15 (annual election)',
        minOwners: 1,
        eligibleEntities: ['S-Corp', 'Partnership', 'LLC'],
        saltWorkaround: true,
        estimatedPayments: [
            { due: 'March 15', percent: 25 },
            { due: 'June 15', percent: 25 },
            { due: 'September 15', percent: 25 },
            { due: 'January 15', percent: 25 },
        ],
    },
    NJ: {
        name: 'New Jersey Business Alternative Income Tax (BAIT)',
        rate: 0.0675, // Simplified - actual is graduated
        deadline: 'March 15',
        minOwners: 1,
        eligibleEntities: ['S-Corp', 'Partnership', 'LLC'],
        saltWorkaround: true,
    },
    CT: {
        name: 'Connecticut Pass-Through Entity Tax',
        rate: 0.0699,
        mandatory: true, // CT PTET is mandatory for some entities
        saltWorkaround: true,
    },
    GA: {
        name: 'Georgia Pass-Through Entity Tax',
        rate: 0.055,
        deadline: 'Due date of return',
        saltWorkaround: true,
    },
    IL: {
        name: 'Illinois Pass-Through Entity Tax',
        rate: 0.0495,
        deadline: 'First day of tax year',
        saltWorkaround: true,
    },
    MA: {
        name: 'Massachusetts Pass-Through Entity Excise',
        rate: 0.05,
        deadline: 'With extension request',
        saltWorkaround: true,
    },
};

// Texas Margin Tax Details (2025)
export const TX_MARGIN_TAX = {
    name: 'Texas Margin Tax (Franchise Tax)',
    exemptionThreshold: 2470000, // Revenue exemption for 2025
    rates: {
        retail: 0.00375,
        wholesale: 0.00375,
        other: 0.0075,
    },
    noTaxDue: 1230000, // No tax due threshold
    methods: ['Cost of Goods Sold', '30% Deduction', 'Compensation Deduction'],
};

/**
 * Analyze state PTET opportunities
 */
export function analyzeStatePTETOptimizations(form) {
    const optimizations = [];
    const state = (form.state || '').toUpperCase();

    // Check if they have pass-through income
    const hasPassThrough = form.hasScheduleK1 || form.hasSCorp ||
        form.hasPartnership || form.hasScheduleC;

    if (!hasPassThrough) return optimizations;

    // Get pass-through income
    const k1Income = parseFloat(form.scheduleK1?.ordinaryIncome) || 0;
    const sCorpIncome = parseFloat(form.sCorpIncome) || 0;
    const partnershipIncome = parseFloat(form.partnershipIncome) || 0;
    const totalPassThrough = k1Income + sCorpIncome + partnershipIncome;

    if (totalPassThrough <= 0) return optimizations;

    // Check if state has PTET
    const ptetProgram = STATE_PTET_PROGRAMS[state];

    if (ptetProgram) {
        const ptetOpt = analyzePTETElection(form, ptetProgram, totalPassThrough, state);
        if (ptetOpt) optimizations.push(ptetOpt);
    }

    // Check for Texas margin tax
    if (state === 'TX') {
        const txOpt = analyzeTexasMarginTax(form);
        if (txOpt) optimizations.push(txOpt);
    }

    // Check for California mental health tax
    if (state === 'CA') {
        const caOpt = analyzeCaliforniaMentalHealthTax(form);
        if (caOpt) optimizations.push(caOpt);
    }

    // General PTET awareness for states without specific implementation
    if (!ptetProgram && totalPassThrough > 50000) {
        const generalOpt = analyzeGeneralPTETOpportunity(form, state, totalPassThrough);
        if (generalOpt) optimizations.push(generalOpt);
    }

    return optimizations;
}

/**
 * Analyze specific state PTET election
 */
function analyzePTETElection(form, program, passThroughIncome, state) {
    const currentTax = calculateTotalTax(form);
    const federalRate = getMarginalRate(currentTax.taxableIncome);

    // SALT cap is $40,000 after OBBBA
    const saltCap = 40000;
    const stateLocalTaxPaid = parseFloat(form.stateLocalTaxes) || 0;
    const saltLimited = stateLocalTaxPaid > saltCap;

    if (!saltLimited) {
        return {
            id: `ptet-${state.toLowerCase()}-not-limited`,
            name: `${state} PTET - SALT Not Limited`,
            category: CATEGORY.STATE_TAX,
            potentialSavings: 0,
            difficulty: DIFFICULTY.MEDIUM,
            description: 'PTET election may not benefit you - your SALT is under the cap.',
            details: [
                `State/local taxes paid: $${stateLocalTaxPaid.toLocaleString()}`,
                `SALT cap (2025): $${saltCap.toLocaleString()}`,
                'PTET is primarily beneficial when SALT is capped',
            ],
            isInformational: true,
            timeline: 'Review Annually',
        };
    }

    // Calculate PTET benefit
    let ptetRate;
    if (typeof program.rate === 'number') {
        ptetRate = program.rate;
    } else if (program.rates) {
        // Graduated rates (NY style)
        ptetRate = program.rates.find(r => passThroughIncome <= r.max)?.rate || program.rates[program.rates.length - 1].rate;
    }

    const ptetAmount = passThroughIncome * ptetRate;
    const federalDeduction = ptetAmount; // Entity-level deduction
    const federalTaxSavings = federalDeduction * federalRate;

    // Net benefit = federal savings - any state credit reduction
    // Most states give dollar-for-dollar credit, so net benefit is federal savings
    const netBenefit = federalTaxSavings;

    return {
        id: `ptet-${state.toLowerCase()}-opportunity`,
        name: `${program.name}`,
        category: CATEGORY.STATE_TAX,
        potentialSavings: Math.round(netBenefit),
        difficulty: DIFFICULTY.MEDIUM,
        description: 'Elect PTET to bypass federal SALT deduction cap.',
        details: [
            `Pass-through income: $${passThroughIncome.toLocaleString()}`,
            `PTET rate: ${(ptetRate * 100).toFixed(2)}%`,
            `PTET amount: $${Math.round(ptetAmount).toLocaleString()}`,
            `Federal tax savings: $${Math.round(federalTaxSavings).toLocaleString()}`,
            `Excess SALT being lost: $${(stateLocalTaxPaid - saltCap).toLocaleString()}`,
        ],
        howItWorks: [
            'Entity elects to pay state tax at entity level',
            'Entity-level tax is deductible for federal (no SALT cap)',
            'Owners receive state credit for tax paid',
            'Net effect: Bypass SALT cap on pass-through income',
        ],
        requirements: [
            `Deadline: ${program.deadline}`,
            `Eligible entities: ${program.eligibleEntities?.join(', ')}`,
            state === 'CA' ? 'Extended through 2030 (AB 150)' : null,
        ].filter(Boolean),
        estimatedPayments: program.estimatedPayments,
        authority: {
            citation: `IRS Notice 2020-75 • ${state} Tax Law`,
            details: [
                'IRS Notice 2020-75: PTET safe harbor for SALT workaround',
                `${state} specific rules apply`,
            ],
            url: 'https://www.irs.gov/pub/irs-drop/n-20-75.pdf'
        },
        timeline: program.deadline,
        formImpact: [`${state} PTET Election Form`],
    };
}

/**
 * Analyze Texas Margin Tax
 */
function analyzeTexasMarginTax(form) {
    const grossRevenue = parseFloat(form.businessRevenue) ||
        parseFloat(form.scheduleC?.grossReceipts) || 0;

    if (grossRevenue <= 0) return null;

    const isExempt = grossRevenue <= TX_MARGIN_TAX.exemptionThreshold;
    const noTaxDue = grossRevenue <= TX_MARGIN_TAX.noTaxDue;

    if (isExempt) {
        return {
            id: 'tx-margin-tax-exempt',
            name: 'Texas Margin Tax - Exempt',
            category: CATEGORY.STATE_TAX,
            potentialSavings: 0,
            difficulty: DIFFICULTY.EASY,
            description: 'Your business is exempt from Texas margin tax.',
            details: [
                `Gross revenue: $${grossRevenue.toLocaleString()}`,
                `Exemption threshold: $${TX_MARGIN_TAX.exemptionThreshold.toLocaleString()}`,
                '✅ No margin tax due',
                'May still need to file No Tax Due Report',
            ],
            requirements: [
                'File No Tax Due Report by May 15',
                'Report must be filed even if no tax due',
                'Late filing = loss of exemption',
            ],
            authority: {
                citation: 'Texas Tax Code Chapter 171',
                url: 'https://comptroller.texas.gov/taxes/franchise/'
            },
            isInformational: true,
            timeline: 'May 15 annually',
        };
    }

    // Calculate estimated margin tax
    const businessType = form.businessType || 'other';
    const rate = TX_MARGIN_TAX.rates[businessType] || TX_MARGIN_TAX.rates.other;

    // Estimate taxable margin (simplified)
    const costOfGoods = parseFloat(form.costOfGoodsSold) || grossRevenue * 0.6;
    const compensation = parseFloat(form.totalCompensation) || grossRevenue * 0.3;

    const methods = {
        'Cost of Goods Sold': grossRevenue - costOfGoods,
        '70% Revenue': grossRevenue * 0.70,
        'Compensation': grossRevenue - compensation,
    };

    const bestMethod = Object.entries(methods).reduce((a, b) => a[1] < b[1] ? a : b);
    const taxableMargin = bestMethod[1];
    const estimatedTax = taxableMargin * rate;

    return {
        id: 'tx-margin-tax-calculation',
        name: 'Texas Margin Tax Analysis',
        category: CATEGORY.STATE_TAX,
        potentialSavings: 0,
        difficulty: DIFFICULTY.MEDIUM,
        description: 'Texas has no income tax but does have Franchise (Margin) Tax on businesses.',
        details: [
            `Gross revenue: $${grossRevenue.toLocaleString()}`,
            `Best calculation method: ${bestMethod[0]}`,
            `Taxable margin: $${Math.round(taxableMargin).toLocaleString()}`,
            `Estimated margin tax: $${Math.round(estimatedTax).toLocaleString()}`,
        ],
        calculationMethods: TX_MARGIN_TAX.methods.map(m => ({
            name: m,
            description: m === 'Cost of Goods Sold'
                ? 'Revenue minus COGS (requires manufacturing/resale)'
                : m === '30% Deduction'
                    ? 'Automatic 30% deduction from total revenue'
                    : 'Revenue minus total compensation',
        })),
        exemptions: [
            `Revenue under $${TX_MARGIN_TAX.exemptionThreshold.toLocaleString()}: Exempt`,
            'Sole proprietorships: Generally exempt',
            'General partnerships (all natural persons): Exempt',
        ],
        authority: {
            citation: 'Texas Tax Code Chapter 171',
            url: 'https://comptroller.texas.gov/taxes/franchise/'
        },
        isInformational: true,
        timeline: 'May 15 annually',
    };
}

/**
 * Analyze California Mental Health Services Tax
 */
function analyzeCaliforniaMentalHealthTax(form) {
    const currentTax = calculateTotalTax(form);
    const taxableIncome = currentTax.taxableIncome || 0;

    // Mental health tax applies above $1M
    const threshold = 1000000;
    const rate = 0.01; // 1% additional tax

    if (taxableIncome <= threshold) return null;

    const excessIncome = taxableIncome - threshold;
    const additionalTax = excessIncome * rate;

    return {
        id: 'ca-mental-health-tax',
        name: 'California Mental Health Services Tax (Prop 63)',
        category: CATEGORY.STATE_TAX,
        potentialSavings: 0,
        difficulty: DIFFICULTY.HARD,
        description: 'Additional 1% tax on California taxable income over $1 million.',
        details: [
            `CA taxable income: $${taxableIncome.toLocaleString()}`,
            `Threshold: $${threshold.toLocaleString()}`,
            `Excess income: $${excessIncome.toLocaleString()}`,
            `Additional tax (1%): $${Math.round(additionalTax).toLocaleString()}`,
        ],
        context: [
            'Proposition 63 (2004) established this surtax',
            'Funds go to mental health services',
            'Applies to all income types',
            'Cannot be avoided - but can time income',
        ],
        mitigation: [
            'Defer income into years below $1M threshold if possible',
            'Charitable giving to reduce below threshold',
            'QOZ (Qualified Opportunity Zone) investments',
            'Municipal bond income is excluded',
        ],
        authority: {
            citation: 'California Revenue & Taxation Code §17043',
            url: 'https://www.ftb.ca.gov/about-ftb/newsroom/mental-health-services-tax/index.html'
        },
        isWarning: true,
        isInformational: true,
        timeline: 'This Return',
    };
}

/**
 * General PTET opportunity for states without specific implementation
 */
function analyzeGeneralPTETOpportunity(form, state, passThroughIncome) {
    const stateLocalTaxPaid = parseFloat(form.stateLocalTaxes) || 0;
    const saltCap = 40000;

    if (stateLocalTaxPaid <= saltCap) return null;

    return {
        id: 'ptet-general-opportunity',
        name: 'PTET May Be Available in Your State',
        category: CATEGORY.STATE_TAX,
        potentialSavings: 0,
        difficulty: DIFFICULTY.HARD,
        description: 'Many states offer PTET elections to work around SALT cap.',
        details: [
            `Your state: ${state || 'Not specified'}`,
            `Pass-through income: $${passThroughIncome.toLocaleString()}`,
            `SALT paid: $${stateLocalTaxPaid.toLocaleString()}`,
            `Excess over cap: $${(stateLocalTaxPaid - saltCap).toLocaleString()}`,
        ],
        recommendation: [
            'Check if your state offers PTET program',
            'Most states enacted PTET after IRS Notice 2020-75',
            'Consult with state-specific tax professional',
            'Election deadlines vary by state',
        ],
        statesWithPTET: Object.keys(STATE_PTET_PROGRAMS).join(', '),
        authority: {
            citation: 'IRS Notice 2020-75',
            url: 'https://www.irs.gov/pub/irs-drop/n-20-75.pdf'
        },
        isInformational: true,
        timeline: 'Research',
    };
}

/**
 * Helper: Get federal marginal rate
 */
function getMarginalRate(taxableIncome) {
    if (taxableIncome > 626350) return 0.37;
    if (taxableIncome > 250525) return 0.35;
    if (taxableIncome > 197300) return 0.32;
    if (taxableIncome > 103350) return 0.24;
    if (taxableIncome > 48475) return 0.22;
    if (taxableIncome > 11925) return 0.12;
    return 0.10;
}
