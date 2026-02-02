/**
 * 529 Plan State Tax Deductions for 2025
 * Over 30 states offer deductions or credits for 529 contributions
 */

// States with unlimited 529 deductions
export const UNLIMITED_529_STATES = ['CO', 'IN', 'NM', 'PA', 'SC'];

// Tax parity states (allow deduction for contributions to ANY state's 529)
export const TAX_PARITY_STATES = ['AZ', 'AR', 'KS', 'ME', 'MN', 'MO', 'MT', 'OH', 'PA'];

// States with no 529 deduction (includes no-income-tax states)
export const NO_529_DEDUCTION_STATES = [
    'AK', 'CA', 'DE', 'FL', 'HI', 'KY', 'NV', 'NH', 'NC', 'SD', 'TN', 'TX', 'WA', 'WY',
];

// State 529 deduction limits and rules
export const STATE_529_DEDUCTIONS = {
    AL: {
        name: 'Alabama',
        maxDeduction: { single: 5000, married: 10000 },
        inStateOnly: true,
        carryforward: true,
        description: 'Up to $5,000/$10,000 deduction for contributions to Alabama 529',
    },
    AZ: {
        name: 'Arizona',
        maxDeduction: { single: 2000, married: 4000 },
        inStateOnly: false, // Tax parity
        description: 'Deduction for contributions to any state 529 plan',
    },
    AR: {
        name: 'Arkansas',
        maxDeduction: { single: 5000, married: 10000 },
        inStateOnly: false, // Tax parity
        description: 'Deduction for contributions to any state 529 plan',
    },
    CO: {
        name: 'Colorado',
        maxDeduction: { single: 'unlimited', married: 'unlimited' },
        inStateOnly: true,
        description: 'Unlimited deduction for Colorado 529 contributions',
    },
    CT: {
        name: 'Connecticut',
        maxDeduction: { single: 5000, married: 10000 },
        inStateOnly: true,
        description: 'Deduction for Connecticut 529 contributions',
    },
    DC: {
        name: 'District of Columbia',
        maxDeduction: { single: 4000, married: 8000 },
        inStateOnly: true,
        description: 'Deduction for DC 529 contributions',
    },
    GA: {
        name: 'Georgia',
        maxDeduction: { single: 8000, married: 16000 },
        inStateOnly: true,
        description: 'Deduction for Georgia Path2College 529',
    },
    ID: {
        name: 'Idaho',
        maxDeduction: { single: 6000, married: 12000 },
        inStateOnly: true,
        description: 'Deduction for Idaho 529 contributions',
    },
    IL: {
        name: 'Illinois',
        maxDeduction: { single: 10000, married: 20000 },
        inStateOnly: true,
        description: 'Deduction for Bright Start 529 contributions',
    },
    IN: {
        name: 'Indiana',
        type: 'credit',
        creditRate: 0.20,
        maxCredit: 1500,
        inStateOnly: false, // Tax parity
        description: '20% credit up to $7,500 contribution ($1,500 max credit)',
    },
    IA: {
        name: 'Iowa',
        maxDeduction: { single: 3785, married: 7570 },
        inStateOnly: true,
        description: 'Deduction for Iowa 529 contributions',
    },
    KS: {
        name: 'Kansas',
        maxDeduction: { single: 3000, married: 6000 },
        inStateOnly: false, // Tax parity
        description: 'Deduction for contributions to any state 529 plan',
    },
    LA: {
        name: 'Louisiana',
        maxDeduction: { single: 2400, married: 4800 },
        inStateOnly: true,
        description: 'Deduction for START 529 contributions',
    },
    MD: {
        name: 'Maryland',
        maxDeduction: { single: 2500, married: 5000 },
        inStateOnly: true,
        description: 'Deduction for Maryland 529 contributions',
    },
    MA: {
        name: 'Massachusetts',
        maxDeduction: { single: 1000, married: 2000 },
        inStateOnly: true,
        description: 'Deduction for U.Fund 529 contributions',
    },
    MI: {
        name: 'Michigan',
        maxDeduction: { single: 5000, married: 10000 },
        inStateOnly: true,
        description: 'Deduction for MI 529 Advisor Plan contributions',
    },
    MN: {
        name: 'Minnesota',
        type: 'credit',
        creditRate: 0.50,
        maxCredit: 500,
        incomeLimit: { single: 80000, married: 160000 },
        inStateOnly: false, // Tax parity
        deductionAlternative: { single: 1500, married: 3000 },
        description: '50% credit (up to $500) or deduction available',
    },
    MO: {
        name: 'Missouri',
        maxDeduction: { single: 8000, married: 16000 },
        inStateOnly: false, // Tax parity
        description: 'Deduction for contributions to any state 529 plan',
    },
    MS: {
        name: 'Mississippi',
        maxDeduction: { single: 10000, married: 20000 },
        inStateOnly: true,
        description: 'Deduction for Mississippi 529 contributions',
    },
    MT: {
        name: 'Montana',
        maxDeduction: { single: 3000, married: 6000 },
        inStateOnly: false, // Tax parity
        description: 'Deduction for contributions to any state 529 plan',
    },
    NE: {
        name: 'Nebraska',
        maxDeduction: { single: 10000, married: 10000 },
        inStateOnly: true,
        description: 'Deduction for NEST 529 contributions',
    },
    NJ: {
        name: 'New Jersey',
        maxDeduction: { single: 10000, married: 10000 },
        inStateOnly: true,
        incomeLimit: { single: 200000, married: 200000 },
        description: 'Deduction for NJ BEST 529 (income limits apply)',
    },
    NM: {
        name: 'New Mexico',
        maxDeduction: { single: 'unlimited', married: 'unlimited' },
        inStateOnly: true,
        description: 'Unlimited deduction for New Mexico 529 contributions',
    },
    NY: {
        name: 'New York',
        maxDeduction: { single: 5000, married: 10000 },
        inStateOnly: true,
        description: 'Deduction for NY 529 Direct or Advisor plans',
    },
    ND: {
        name: 'North Dakota',
        maxDeduction: { single: 5000, married: 10000 },
        inStateOnly: true,
        description: 'Deduction for ND 529 contributions',
    },
    OH: {
        name: 'Ohio',
        maxDeduction: { single: 4000, married: 4000 },
        perBeneficiary: true,
        inStateOnly: false, // Tax parity
        description: '$4,000 deduction per beneficiary for any state 529',
    },
    OK: {
        name: 'Oklahoma',
        maxDeduction: { single: 10000, married: 20000 },
        inStateOnly: true,
        description: 'Deduction for Oklahoma 529 contributions',
    },
    OR: {
        name: 'Oregon',
        type: 'credit',
        creditRate: 0.10,
        maxCredit: 300,
        refundable: true,
        inStateOnly: true,
        description: '10% credit up to $300 for Oregon 529 contributions',
    },
    PA: {
        name: 'Pennsylvania',
        maxDeduction: { single: 'unlimited', married: 'unlimited' },
        inStateOnly: false, // Tax parity (unique - unlimited AND parity)
        description: 'Unlimited deduction for contributions to any state 529',
    },
    RI: {
        name: 'Rhode Island',
        maxDeduction: { single: 500, married: 1000 },
        inStateOnly: true,
        description: 'Deduction for CollegeBoundfund contributions',
    },
    SC: {
        name: 'South Carolina',
        maxDeduction: { single: 'unlimited', married: 'unlimited' },
        inStateOnly: true,
        description: 'Unlimited deduction for Future Scholar 529',
    },
    UT: {
        name: 'Utah',
        type: 'credit',
        creditRate: 0.05,
        maxCredit: { single: 'unlimited', married: 'unlimited' },
        inStateOnly: true,
        description: '5% credit for my529 contributions (no cap)',
    },
    VT: {
        name: 'Vermont',
        type: 'credit',
        creditRate: 0.10,
        maxCredit: 250,
        inStateOnly: true,
        description: '10% credit up to $250 for Vermont 529 contributions',
    },
    VA: {
        name: 'Virginia',
        maxDeduction: { single: 4000, married: 4000 },
        perAccount: true,
        age70Plus: 'unlimited',
        inStateOnly: true,
        description: '$4,000 per account; unlimited for age 70+',
    },
    WV: {
        name: 'West Virginia',
        maxDeduction: { single: 'unlimited', married: 'unlimited' },
        inStateOnly: true,
        description: 'Unlimited deduction for SMART529 contributions',
    },
    WI: {
        name: 'Wisconsin',
        maxDeduction: { single: 3860, married: 3860 },
        perBeneficiary: true,
        inStateOnly: true,
        description: '$3,860 per beneficiary for Edvest 529',
    },
};

/**
 * Calculate 529 state tax benefit
 */
export function calculate529Benefit(state, contribution, filingStatus = 'single', taxRate = 0.05) {
    if (NO_529_DEDUCTION_STATES.includes(state)) {
        return { type: 'none', amount: 0, description: 'Your state does not offer a 529 deduction' };
    }

    const plan = STATE_529_DEDUCTIONS[state];
    if (!plan) {
        return { type: 'none', amount: 0, description: 'No 529 deduction data available' };
    }

    const status = filingStatus === 'married' || filingStatus === 'widow' ? 'married' : 'single';

    if (plan.type === 'credit') {
        // Credit-based states
        const creditAmount = contribution * plan.creditRate;
        const maxCredit = typeof plan.maxCredit === 'object' ? plan.maxCredit[status] : plan.maxCredit;
        const finalCredit = maxCredit === 'unlimited' ? creditAmount : Math.min(creditAmount, maxCredit);

        return {
            type: 'credit',
            amount: finalCredit,
            refundable: plan.refundable || false,
            description: plan.description,
        };
    }

    // Deduction-based states
    const maxDeduction = plan.maxDeduction[status];
    const deductionAmount = maxDeduction === 'unlimited' ? contribution : Math.min(contribution, maxDeduction);
    const taxSavings = deductionAmount * taxRate;

    return {
        type: 'deduction',
        deductionAmount,
        taxSavings,
        description: plan.description,
        inStateOnly: plan.inStateOnly,
        taxParity: TAX_PARITY_STATES.includes(state),
    };
}

/**
 * Check if state has 529 benefit
 */
export function has529Benefit(state) {
    return !NO_529_DEDUCTION_STATES.includes(state) && !!STATE_529_DEDUCTIONS[state];
}

/**
 * Get 529 info for state
 */
export function get529Info(state) {
    return STATE_529_DEDUCTIONS[state] || null;
}
