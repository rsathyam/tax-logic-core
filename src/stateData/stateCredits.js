/**
 * State Tax Credits for 2025
 * Includes state EITCs, CTCs, and other family credits
 */

// State Earned Income Tax Credits (as percentage of federal EITC or fixed amounts)
export const STATE_EITC = {
    CA: {
        name: 'California CalEITC',
        type: 'independent', // Has its own calculation
        maxCredit: 3756,
        incomeLimit: 32900,
        refundable: true,
        description: 'California Earned Income Tax Credit for low-income workers',
    },
    CO: {
        name: 'Colorado EITC',
        type: 'percentage',
        percentage: 0.50, // 50% of federal
        refundable: true,
        description: 'Colorado matches 50% of federal EITC',
    },
    CT: {
        name: 'Connecticut EITC',
        type: 'percentage',
        percentage: 0.40,
        refundable: true,
        description: 'Connecticut matches 40% of federal EITC',
    },
    DC: {
        name: 'DC EITC',
        type: 'percentage',
        percentage: 0.70,
        refundable: true,
        description: 'DC matches 70% of federal EITC',
    },
    DE: {
        name: 'Delaware EITC',
        type: 'percentage',
        percentage: 0.20,
        refundable: false,
        description: 'Delaware offers 20% of federal EITC (non-refundable)',
    },
    HI: {
        name: 'Hawaii EITC',
        type: 'percentage',
        percentage: 0.40,
        refundable: true,
        description: 'Hawaii matches 40% of federal EITC',
    },
    IL: {
        name: 'Illinois EITC',
        type: 'percentage',
        percentage: 0.20,
        refundable: true,
        description: 'Illinois matches 20% of federal EITC',
    },
    IN: {
        name: 'Indiana EITC',
        type: 'percentage',
        percentage: 0.10,
        refundable: true,
        description: 'Indiana matches 10% of federal EITC',
    },
    KS: {
        name: 'Kansas EITC',
        type: 'percentage',
        percentage: 0.17,
        refundable: true,
        description: 'Kansas matches 17% of federal EITC',
    },
    LA: {
        name: 'Louisiana EITC',
        type: 'percentage',
        percentage: 0.05,
        refundable: true,
        description: 'Louisiana matches 5% of federal EITC',
    },
    MA: {
        name: 'Massachusetts EITC',
        type: 'percentage',
        percentage: 0.40,
        refundable: true,
        description: 'Massachusetts matches 40% of federal EITC',
    },
    MD: {
        name: 'Maryland EITC',
        type: 'percentage',
        percentage: 0.50,
        refundable: true,
        description: 'Maryland matches 50% of federal EITC (refundable version)',
    },
    ME: {
        name: 'Maine EITC',
        type: 'percentage',
        percentage: 0.25,
        refundable: true,
        description: 'Maine matches 25% of federal EITC',
    },
    MI: {
        name: 'Michigan EITC',
        type: 'percentage',
        percentage: 0.30,
        refundable: true,
        description: 'Michigan matches 30% of federal EITC',
    },
    MN: {
        name: 'Minnesota Working Family Credit',
        type: 'independent',
        maxCredit: 2800,
        refundable: true,
        description: 'Minnesota Working Family Credit for low-income workers',
    },
    MT: {
        name: 'Montana EITC',
        type: 'percentage',
        percentage: 0.03,
        refundable: true,
        description: 'Montana matches 3% of federal EITC',
    },
    NE: {
        name: 'Nebraska EITC',
        type: 'percentage',
        percentage: 0.10,
        refundable: true,
        description: 'Nebraska matches 10% of federal EITC',
    },
    NJ: {
        name: 'New Jersey EITC',
        type: 'percentage',
        percentage: 0.40,
        refundable: true,
        description: 'New Jersey matches 40% of federal EITC',
    },
    NM: {
        name: 'New Mexico Working Families Tax Credit',
        type: 'percentage',
        percentage: 0.25,
        refundable: true,
        description: 'New Mexico matches 25% of federal EITC',
    },
    NY: {
        name: 'New York EITC',
        type: 'percentage',
        percentage: 0.30,
        refundable: true,
        description: 'New York matches 30% of federal EITC',
    },
    OH: {
        name: 'Ohio EITC',
        type: 'percentage',
        percentage: 0.30,
        refundable: false,
        description: 'Ohio matches 30% of federal EITC (non-refundable)',
    },
    OK: {
        name: 'Oklahoma EITC',
        type: 'percentage',
        percentage: 0.05,
        refundable: false,
        description: 'Oklahoma matches 5% of federal EITC (non-refundable)',
    },
    OR: {
        name: 'Oregon EITC',
        type: 'percentage',
        percentage: 0.15,
        refundable: true,
        description: 'Oregon matches 15% of federal EITC',
    },
    RI: {
        name: 'Rhode Island EITC',
        type: 'percentage',
        percentage: 0.15,
        refundable: true,
        description: 'Rhode Island matches 15% of federal EITC',
    },
    SC: {
        name: 'South Carolina EITC',
        type: 'percentage',
        percentage: 0.1667,
        refundable: true,
        description: 'South Carolina matches 16.67% of federal EITC',
    },
    VT: {
        name: 'Vermont EITC',
        type: 'percentage',
        percentage: 0.38,
        refundable: true,
        description: 'Vermont matches 38% of federal EITC',
    },
    VA: {
        name: 'Virginia EITC',
        type: 'percentage',
        percentage: 0.20,
        refundable: true,
        description: 'Virginia matches 20% of federal EITC',
    },
    WA: {
        name: 'Washington Working Families Tax Credit',
        type: 'independent',
        maxCredits: {
            0: 335,
            1: 670,
            2: 1005,
            3: 1330,
        },
        refundable: true,
        description: 'Washington state refundable credit for working families',
    },
    WI: {
        name: 'Wisconsin EITC',
        type: 'independent',
        percentages: {
            1: 0.043, // 4.3% of federal with 1 child
            2: 0.143, // 14.3% with 2 children
            3: 0.43,  // 43% with 3+ children
        },
        refundable: true,
        description: 'Wisconsin EITC varies by number of children',
    },
};

// State Child Tax Credits
export const STATE_CTC = {
    AZ: {
        name: 'Arizona Child Tax Credit',
        maxPerChild: 100,
        refundable: false,
        description: 'Arizona offers $100 per dependent child',
    },
    CA: {
        name: 'California Young Child Tax Credit',
        maxCredit: 1183,
        childAgeLimit: 6,
        incomeLimit: 32900, // Same as CalEITC
        refundable: true,
        description: 'Additional credit for children under 6',
    },
    CO: {
        name: 'Colorado Child Tax Credit',
        percentOfFederal: 0.60,
        childAgeLimit: 6,
        refundable: true,
        description: 'Colorado offers 60% of federal CTC for children under 6',
    },
    GA: {
        name: 'Georgia Child Tax Credit',
        maxPerChild: 500,
        refundable: false,
        description: 'Georgia offers $500 per qualifying child',
    },
    ID: {
        name: 'Idaho Child Tax Credit',
        maxPerChild: 205,
        refundable: false,
        description: 'Idaho offers $205 per qualifying child',
    },
    MA: {
        name: 'Massachusetts Child and Dependent Tax Credit',
        maxPerDependent: 310,
        refundable: true,
        description: 'Massachusetts offers credit for dependents',
    },
    MD: {
        name: 'Maryland Child Tax Credit',
        maxPerChild: 600,
        incomeLimit: 15000, // Per child
        refundable: true,
        description: 'Maryland refundable child credit',
    },
    ME: {
        name: 'Maine Child Tax Credit',
        maxPerChild: 300,
        refundable: true,
        description: 'Maine child tax credit',
    },
    MN: {
        name: 'Minnesota Child Tax Credit',
        maxPerChild: 1750,
        refundable: true,
        description: 'Minnesota substantial child credit',
    },
    NJ: {
        name: 'New Jersey Child Tax Credit',
        maxPerChild: 1000,
        incomeLimit: 80000, // Phase-out starts
        refundable: true,
        description: 'New Jersey refundable child credit',
    },
    NM: {
        name: 'New Mexico Child Tax Credit',
        maxPerChild: 600,
        refundable: true,
        description: 'New Mexico child credit',
    },
    NY: {
        name: 'New York Empire State Child Credit',
        maxPerChildUnder4: 1000,
        maxPerChildAge4to16: 330,
        refundable: true,
        inflationCredit2025: true, // One-time inflation credit
        description: 'New York enhanced child credit for 2025',
    },
    OK: {
        name: 'Oklahoma Child Tax Credit',
        percentOfFederal: 0.05,
        refundable: false,
        description: 'Oklahoma offers 5% of federal CTC',
    },
    OR: {
        name: 'Oregon Child Tax Credit',
        maxPerChild: 1000,
        incomeLimit: 30000,
        refundable: true,
        description: 'Oregon refundable credit for lower incomes',
    },
    UT: {
        name: 'Utah Child Tax Credit',
        maxPerChild: 1000,
        refundable: false,
        description: 'Utah non-refundable child credit',
    },
    VT: {
        name: 'Vermont Child Tax Credit',
        maxPerChildUnder6: 1000,
        refundable: true,
        description: 'Vermont credit for young children',
    },
};

// States with additional credits
export const STATE_OTHER_CREDITS = {
    NY: {
        inflationRefundCredit2025: {
            name: 'NY Inflation Refund Credit',
            description: 'One-time inflation relief payment for 2025 (based on 2023 AGI)',
            amounts: {
                single: { low: 130, mid: 65, high: 0 },
                married: { low: 260, mid: 130, high: 0 },
            },
        },
        organDonationCredit: {
            name: 'NY Organ Donation Credit',
            maxCredit: 10000,
            description: 'Credit for unreimbursed living organ donation expenses',
        },
    },
    CA: {
        rentersCreditNonRefundable: {
            name: 'California Renters Credit',
            single: 60,
            married: 120,
            incomeLimit: { single: 50746, married: 101492 },
            description: 'Non-refundable credit for California renters',
        },
    },
};

/**
 * Calculate state EITC based on federal EITC amount
 */
export function calculateStateEITC(state, federalEITC, numChildren = 0) {
    const stateCredit = STATE_EITC[state];
    if (!stateCredit) return 0;

    if (stateCredit.type === 'percentage') {
        return federalEITC * stateCredit.percentage;
    }

    if (stateCredit.type === 'independent') {
        // For states with independent calculations, return max as estimate
        if (state === 'WA') {
            const key = Math.min(numChildren, 3);
            return stateCredit.maxCredits[key] || 0;
        }
        if (state === 'WI') {
            if (numChildren === 0) return 0;
            const key = Math.min(numChildren, 3);
            return federalEITC * (stateCredit.percentages[key] || 0);
        }
        return stateCredit.maxCredit || 0;
    }

    return 0;
}

/**
 * Calculate state CTC
 */
export function calculateStateCTC(state, numChildren, childrenUnder6 = 0, form = {}) {
    const stateCTC = STATE_CTC[state];
    if (!stateCTC) return 0;

    // New York special handling
    if (state === 'NY') {
        const under4Credit = (form.childrenUnder4 || 0) * stateCTC.maxPerChildUnder4;
        const age4to16Credit = (numChildren - (form.childrenUnder4 || 0)) * stateCTC.maxPerChildAge4to16;
        return under4Credit + age4to16Credit;
    }

    // California young child credit
    if (state === 'CA') {
        return childrenUnder6 > 0 ? stateCTC.maxCredit : 0;
    }

    // States with per-child amounts
    if (stateCTC.maxPerChild) {
        return numChildren * stateCTC.maxPerChild;
    }

    // States with percentage of federal
    if (stateCTC.percentOfFederal) {
        const federalCTC = numChildren * 2200; // 2025 amount
        return federalCTC * stateCTC.percentOfFederal;
    }

    return 0;
}

/**
 * Check if state has EITC
 */
export function hasStateEITC(state) {
    return !!STATE_EITC[state];
}

/**
 * Check if state has CTC
 */
export function hasStateCTC(state) {
    return !!STATE_CTC[state];
}

/**
 * Get all available state credits for a given state
 */
export function getStateCredits(state) {
    const credits = [];

    if (STATE_EITC[state]) {
        credits.push({
            type: 'EITC',
            ...STATE_EITC[state],
        });
    }

    if (STATE_CTC[state]) {
        credits.push({
            type: 'CTC',
            ...STATE_CTC[state],
        });
    }

    if (STATE_OTHER_CREDITS[state]) {
        Object.entries(STATE_OTHER_CREDITS[state]).forEach(([key, credit]) => {
            credits.push({
                type: key,
                ...credit,
            });
        });
    }

    return credits;
}
