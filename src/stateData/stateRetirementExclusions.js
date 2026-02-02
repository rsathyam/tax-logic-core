/**
 * State Retirement Income Exclusions for 2025
 * Many states offer tax exclusions for Social Security, pensions, and other retirement income
 */

// States that fully exempt Social Security benefits
export const FULL_SS_EXEMPTION_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KY', 'LA',
    'ME', 'MD', 'MA', 'MI', 'MS', 'NV', 'NH', 'NJ', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA',
    'SC', 'SD', 'TN', 'TX', 'VA', 'WA', 'WI', 'WY', 'DC',
];

// States that partially tax Social Security (with exemptions/deductions)
export const PARTIAL_SS_TAX_STATES = {
    CO: {
        name: 'Colorado',
        under65Exclusion: 20000,
        age65PlusExclusion: 24000,
        description: 'Colorado excludes up to $20K (under 65) or $24K (65+) of SS and retirement income',
    },
    CT: {
        name: 'Connecticut',
        agiThreshold: { single: 75000, married: 100000 },
        exclusionPercent: 1.0, // Full exclusion below threshold
        phaseOutRate: 0.25,
        description: 'Connecticut exempts SS for AGI under threshold, phases out above',
    },
    KS: {
        name: 'Kansas',
        agiThreshold: 75000,
        fullExemptionBelow: true,
        description: 'Kansas exempts SS for AGI under $75,000 (all filing statuses)',
    },
    MN: {
        name: 'Minnesota',
        exemptionMethod: 'partial',
        subtraction: { single: 5050, married: 6470 },
        description: 'Minnesota allows subtraction for lower incomes',
    },
    MO: {
        name: 'Missouri',
        fullExemption2025: true, // Fully phased out by 2025
        description: 'Missouri has fully exempted SS benefits starting 2025',
    },
    MT: {
        name: 'Montana',
        agiThreshold: { single: 25000, married: 32000 },
        description: 'Montana exempts SS for lower income levels',
    },
    NE: {
        name: 'Nebraska',
        fullExemption2025: true, // Phased out taxation by 2025
        description: 'Nebraska has fully exempted SS benefits starting 2025',
    },
    NM: {
        name: 'New Mexico',
        agiThreshold: { single: 100000, married: 150000 },
        description: 'New Mexico exempts SS for AGI under threshold',
    },
    RI: {
        name: 'Rhode Island',
        agiThreshold: { single: 101000, married: 126250 },
        description: 'Rhode Island exempts SS below AGI threshold',
    },
    UT: {
        name: 'Utah',
        creditMethod: true,
        description: 'Utah provides a retirement credit instead of exclusion',
    },
    VT: {
        name: 'Vermont',
        agiThreshold: { single: 50000, married: 65000 },
        description: 'Vermont exempts SS below income threshold',
    },
    WV: {
        name: 'West Virginia',
        fullExemption2025: true, // Phased out by 2025
        description: 'West Virginia has fully exempted SS benefits starting 2025',
    },
};

// State pension exclusions
export const STATE_PENSION_EXCLUSIONS = {
    AL: {
        name: 'Alabama',
        publicPension: 'exempt',
        privatePension: 'taxable',
        description: 'Alabama exempts all state/local government pensions',
    },
    HI: {
        name: 'Hawaii',
        publicPension: 'exempt',
        privatePension: 'taxable',
        description: 'Hawaii exempts public pension income',
    },
    IL: {
        name: 'Illinois',
        publicPension: 'exempt',
        privatePension: 'exempt',
        retirementIncome: 'exempt',
        description: 'Illinois exempts nearly all retirement income',
    },
    IA: {
        name: 'Iowa',
        exclusion: { single: 6000, married: 12000 },
        age55Plus: true,
        description: 'Iowa excludes up to $6K/$12K for age 55+ (phases out completely by 2026)',
    },
    KY: {
        name: 'Kentucky',
        exclusion: 31110, // Annually adjusted
        description: 'Kentucky excludes up to $31,110 of retirement income',
    },
    LA: {
        name: 'Louisiana',
        exclusion: { single: 6000, married: 12000 },
        age65Plus: true,
        description: 'Louisiana excludes retirement income for age 65+',
    },
    MD: {
        name: 'Maryland',
        exclusion: { single: 36200, married: 36200 },
        age65Plus: true,
        description: 'Maryland pension exclusion for age 65+',
    },
    MI: {
        name: 'Michigan',
        publicPension: 'exempt',
        privateBorn: {
            before1946: 'exempt',
            after1946: 'taxable with exemption',
        },
        description: 'Michigan exemption depends on birth year',
    },
    MS: {
        name: 'Mississippi',
        retirementIncome: 'exempt',
        description: 'Mississippi exempts all qualified retirement income',
    },
    NJ: {
        name: 'New Jersey',
        exclusion: { single: 100000, married: 150000 },
        age62Plus: true,
        description: 'New Jersey exclusion for age 62+ (income limits apply)',
    },
    NY: {
        name: 'New York',
        publicPension: 'exempt',
        privatePension: { exclusion: 20000, age59Half: true },
        description: 'NY exempts public pensions; $20K exclusion for private',
    },
    OH: {
        name: 'Ohio',
        credit: 200, // Per taxpayer
        age65Plus: true,
        description: 'Ohio provides $200 credit for age 65+',
    },
    PA: {
        name: 'Pennsylvania',
        retirementIncome: 'exempt',
        description: 'Pennsylvania exempts all retirement income at age 60+',
    },
    SC: {
        name: 'South Carolina',
        exclusion: { under65: 3000, age65Plus: 10000 },
        description: 'South Carolina retirement deduction based on age',
    },
    VA: {
        name: 'Virginia',
        age65PlusDeduction: 12000,
        description: 'Virginia provides extra deduction for age 65+',
    },
    WI: {
        name: 'Wisconsin',
        exclusion: { single: 5000, married: 5000 },
        incomeLimit: { single: 15000, married: 30000 },
        description: 'Wisconsin retirement subtraction for lower incomes',
    },
};

// Military pension exclusions
export const MILITARY_PENSION_EXCLUSIONS = {
    fullExemption: [
        'AL', 'AK', 'AZ', 'AR', 'CT', 'FL', 'HI', 'IL', 'IN', 'IA', 'KS', 'LA', 'ME', 'MA',
        'MI', 'MN', 'MS', 'MO', 'NV', 'NH', 'NJ', 'NY', 'NC', 'ND', 'OH', 'OK', 'PA', 'SD',
        'TN', 'TX', 'UT', 'WA', 'WV', 'WI', 'WY',
    ],
    partialExemption: {
        CO: { exclusion: 24000, description: 'Up to $24,000 exemption' },
        DE: { exclusion: 12500, description: 'Up to $12,500 exemption for under 60' },
        GA: { exclusion: 35000, description: 'Up to $35,000 for under 62; $65,000 for 62+' },
        ID: { exclusion: 45104, description: 'Deduction for military retirement' },
        KY: { exclusion: 31110, description: 'Same as general pension exclusion' },
        MD: { exclusion: 'partial', description: 'Partial exemption up to $22,500' },
        MT: { exclusion: 4640, description: 'Partial exemption available' },
        NE: { exclusion: 'phase in', description: 'Phasing in full exemption' },
        NM: { exclusion: 30000, description: 'Up to $30,000 exemption' },
        OR: { exclusion: 6750, description: 'Credit for military retirees' },
        RI: { exclusion: 15000, description: 'Up to $15,000 exemption' },
        SC: { exclusion: 10000, description: 'Same as general retirement' },
        VA: { exclusion: 'partial', description: 'Subtraction up to $30,000 (income phaseout)' },
        VT: { exclusion: 'partial', description: 'Partial exclusion available' },
    },
    taxable: ['CA', 'DC', 'OR'],
};

/**
 * Check if SS is fully exempt in state
 */
export function isSSFullyExempt(state) {
    return FULL_SS_EXEMPTION_STATES.includes(state);
}

/**
 * Calculate SS exclusion for state
 */
export function calculateSSStateExclusion(state, ssAmount, agi, age, filingStatus) {
    if (FULL_SS_EXEMPTION_STATES.includes(state)) {
        return { exempt: true, exclusion: ssAmount, taxable: 0 };
    }

    const rules = PARTIAL_SS_TAX_STATES[state];
    if (!rules) {
        return { exempt: false, exclusion: 0, taxable: ssAmount };
    }

    // States that fully exempted by 2025
    if (rules.fullExemption2025) {
        return { exempt: true, exclusion: ssAmount, taxable: 0 };
    }

    // States with AGI threshold
    if (rules.agiThreshold) {
        const threshold = typeof rules.agiThreshold === 'object'
            ? (filingStatus === 'married' ? rules.agiThreshold.married : rules.agiThreshold.single)
            : rules.agiThreshold;

        if (agi <= threshold) {
            return { exempt: true, exclusion: ssAmount, taxable: 0 };
        }
    }

    // Colorado age-based exclusion
    if (state === 'CO') {
        const exclusion = age >= 65 ? rules.age65PlusExclusion : rules.under65Exclusion;
        return {
            exempt: false,
            exclusion: Math.min(exclusion, ssAmount),
            taxable: Math.max(0, ssAmount - exclusion),
        };
    }

    return { exempt: false, exclusion: 0, taxable: ssAmount, note: rules.description };
}

/**
 * Calculate pension exclusion for state
 */
export function calculatePensionExclusion(state, pensionAmount, age, filingStatus, pensionType = 'private') {
    const rules = STATE_PENSION_EXCLUSIONS[state];
    if (!rules) {
        return { exclusion: 0, taxable: pensionAmount };
    }

    // Check if fully exempt
    if (rules.retirementIncome === 'exempt') {
        return { exclusion: pensionAmount, taxable: 0 };
    }

    if (pensionType === 'public' && rules.publicPension === 'exempt') {
        return { exclusion: pensionAmount, taxable: 0 };
    }

    // States with fixed exclusion amounts
    if (rules.exclusion) {
        const maxExclusion = typeof rules.exclusion === 'object'
            ? (age >= 65 && rules.exclusion.age65Plus
                ? rules.exclusion.age65Plus
                : (filingStatus === 'married' ? rules.exclusion.married : rules.exclusion.single))
            : rules.exclusion;

        return {
            exclusion: Math.min(maxExclusion, pensionAmount),
            taxable: Math.max(0, pensionAmount - maxExclusion),
        };
    }

    return { exclusion: 0, taxable: pensionAmount };
}

/**
 * Check if military pension is exempt
 */
export function isMilitaryPensionExempt(state) {
    return MILITARY_PENSION_EXCLUSIONS.fullExemption.includes(state);
}

/**
 * Get retirement income summary for state
 */
export function getStateRetirementSummary(state) {
    return {
        socialSecurity: {
            fullyExempt: FULL_SS_EXEMPTION_STATES.includes(state),
            rules: PARTIAL_SS_TAX_STATES[state] || null,
        },
        pension: STATE_PENSION_EXCLUSIONS[state] || null,
        militaryPension: {
            fullyExempt: MILITARY_PENSION_EXCLUSIONS.fullExemption.includes(state),
            partial: MILITARY_PENSION_EXCLUSIONS.partialExemption[state] || null,
        },
    };
}
