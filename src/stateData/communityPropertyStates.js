/**
 * Community Property States for 2025
 * 9 states follow community property rules which affect income splitting for MFS filers
 */

// Community property states
export const COMMUNITY_PROPERTY_STATES = [
    'AZ', // Arizona
    'CA', // California
    'ID', // Idaho
    'LA', // Louisiana
    'NV', // Nevada
    'NM', // New Mexico
    'TX', // Texas
    'WA', // Washington
    'WI', // Wisconsin (marital property - similar rules)
];

/**
 * Community property rules affect how income is reported when filing MFS:
 * - Community income (earned during marriage) is split 50/50 between spouses
 * - Separate income (before marriage, gifts, inheritance) stays with that spouse
 * - This can create tax advantages for MFS filing in certain situations
 */

export const COMMUNITY_PROPERTY_RULES = {
    AZ: {
        name: 'Arizona',
        splitRequired: true,
        form8958Required: true,
        notes: 'Arizona requires 50/50 split of community income on Form 8958',
    },
    CA: {
        name: 'California',
        splitRequired: true,
        form8958Required: true,
        specialRules: {
            mentalHealthTax: {
                threshold: 1000000,
                rate: 0.01,
                description: 'California 1% mental health surcharge applies over $1M',
                mfsAdvantage: 'Filing MFS can help each spouse stay under $1M threshold',
            },
            amtBusinessExclusion: {
                amount: 1000000,
                description: 'CA AMT $1M business income exclusion applies per return',
                mfsAdvantage: 'Filing MFS provides two $1M exclusions',
            },
        },
        notes: 'California offers significant MFS benefits for high earners',
    },
    ID: {
        name: 'Idaho',
        splitRequired: true,
        form8958Required: true,
        notes: 'Idaho follows standard community property rules',
    },
    LA: {
        name: 'Louisiana',
        splitRequired: true,
        form8958Required: true,
        notes: 'Louisiana civil law community property system',
    },
    NV: {
        name: 'Nevada',
        splitRequired: true,
        form8958Required: true,
        stateTaxAdvantage: 'No state income tax - federal benefit only',
        notes: 'Nevada has no income tax but community property affects federal filing',
    },
    NM: {
        name: 'New Mexico',
        splitRequired: true,
        form8958Required: true,
        notes: 'New Mexico follows standard community property rules',
    },
    TX: {
        name: 'Texas',
        splitRequired: true,
        form8958Required: true,
        stateTaxAdvantage: 'No state income tax - federal benefit only',
        notes: 'Texas has no income tax but community property affects federal filing',
    },
    WA: {
        name: 'Washington',
        splitRequired: true,
        form8958Required: true,
        capitalGainsTax: {
            threshold: 270000,
            rate: 0.07,
            note: 'WA capital gains tax may be affected by community property split',
        },
        notes: 'Washington has no income tax but 7% capital gains tax applies',
    },
    WI: {
        name: 'Wisconsin',
        splitRequired: true,
        form8958Required: true,
        type: 'marital property',
        notes: 'Wisconsin marital property law (similar to community property since 1986)',
    },
};

/**
 * Federal benefits of community property for MFS filers:
 * 1. Income splitting can put each spouse in lower brackets
 * 2. Each spouse gets their own deduction thresholds
 * 3. Capital gains split can affect 0% bracket opportunity
 * 4. Social Security taxability may be reduced
 */

export const COMMUNITY_PROPERTY_FEDERAL_BENEFITS = {
    incomeSplitting: {
        name: 'Income Splitting',
        description: 'Community income is split 50/50 regardless of who earned it',
        benefit: 'Reduces tax when one spouse earns significantly more',
    },
    bracketOptimization: {
        name: 'Bracket Optimization',
        description: 'Each spouse files with their half of community income',
        benefit: 'Can keep both spouses in lower marginal brackets',
    },
    capitalGainsThreshold: {
        name: 'Capital Gains 0% Bracket',
        description: 'Split allows both spouses to use 0% long-term capital gains bracket',
        threshold2025: 48350, // Per MFS filer
        benefit: 'Each spouse can have up to $48,350 in 0% LTCG',
    },
    socialSecurityTaxability: {
        name: 'Social Security Taxability',
        description: 'Lower individual income may reduce taxable Social Security',
        benefit: 'May reduce the portion of SS benefits that are taxable',
    },
};

/**
 * Check if state is a community property state
 */
export function isCommunityPropertyState(state) {
    return COMMUNITY_PROPERTY_STATES.includes(state);
}

/**
 * Get community property rules for a state
 */
export function getCommunityPropertyRules(state) {
    return COMMUNITY_PROPERTY_RULES[state] || null;
}

/**
 * Calculate potential MFS benefit in community property state
 * @param {number} spouseAIncome - Primary earner income
 * @param {number} spouseBIncome - Secondary earner income
 * @param {number} mfjTax - Tax if filing MFJ
 * @param {Object} form - Full form for complete calculation
 */
export function calculateCommunityPropertyMFSBenefit(spouseAIncome, spouseBIncome, mfjTax, calculateMFSTax) {
    const totalCommunityIncome = spouseAIncome + spouseBIncome;
    const splitIncome = totalCommunityIncome / 2;

    // Each spouse files with half the community income
    const spouseATax = calculateMFSTax(splitIncome);
    const spouseBTax = calculateMFSTax(splitIncome);
    const totalMFSTax = spouseATax + spouseBTax;

    const benefit = mfjTax - totalMFSTax;

    return {
        splitIncome,
        spouseATax,
        spouseBTax,
        totalMFSTax,
        mfjTax,
        benefit,
        isBeneficial: benefit > 0,
        formRequired: 'Form 8958 (Allocation of Tax Amounts)',
    };
}

/**
 * California-specific MFS analysis for mental health tax
 */
export function analyzeCaliforniaMentalHealthTax(combinedIncome) {
    const threshold = 1000000;

    if (combinedIncome <= threshold) {
        return {
            applies: false,
            mfsAdvantage: false,
            savings: 0,
            recommendation: 'Combined income is under $1M - mental health tax does not apply',
        };
    }

    const mentalHealthTax = (combinedIncome - threshold) * 0.01;

    // Check if splitting would avoid the tax
    const splitIncome = combinedIncome / 2;
    const mfsSavings = splitIncome > threshold
        ? mentalHealthTax - ((splitIncome - threshold) * 0.01 * 2)
        : mentalHealthTax;

    return {
        applies: true,
        currentTax: mentalHealthTax,
        splitIncome,
        splitPerSpouseApplies: splitIncome > threshold,
        mfsAdvantage: mfsSavings > 0,
        savings: mfsSavings,
        recommendation: mfsSavings > 0
            ? `Filing MFS could save $${mfsSavings.toFixed(0)} in CA mental health tax`
            : 'MFS would not save on mental health tax (each spouse still over $1M)',
    };
}
