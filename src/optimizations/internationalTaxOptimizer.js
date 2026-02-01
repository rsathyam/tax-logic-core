/**
 * International Tax Optimizer
 * Analyzes foreign income, credits, exclusions, and reporting requirements
 * 
 * IRS Authority:
 * - IRC §911 - Foreign Earned Income Exclusion
 * - IRC §901/902 - Foreign Tax Credit
 * - IRC §6038D - FATCA/Form 8938
 * - FBAR - FinCEN 114
 */

import { calculateTotalTax } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';

// 2025 Foreign Earned Income Exclusion limit
const FEIE_LIMIT_2025 = 130000; // Adjusted annually for inflation

// Foreign account thresholds
const FBAR_THRESHOLD = 10000;        // Aggregate value threshold
const FATCA_THRESHOLD_US = 50000;    // End of year (unmarried, in US)
const FATCA_THRESHOLD_ABROAD = 200000; // End of year (unmarried, abroad)

/**
 * Analyze all international tax optimization opportunities
 */
export function analyzeInternationalTaxOptimizations(form) {
    const optimizations = [];

    // Check for international indicators
    const hasForeignIndicators = form.hasForeignIncome ||
        form.foreignEarnedIncome ||
        form.foreignTaxPaid ||
        form.foreignBankAccounts ||
        form.livesAbroad;

    if (!hasForeignIndicators) return optimizations;

    // 1. Foreign Earned Income Exclusion
    const feieOpt = analyzeForeignEarnedIncomeExclusion(form);
    if (feieOpt) optimizations.push(feieOpt);

    // 2. Foreign Tax Credit
    const ftcOpt = analyzeForeignTaxCredit(form);
    if (ftcOpt) optimizations.push(ftcOpt);

    // 3. FEIE vs FTC Decision
    const comparisonOpt = analyzeFEIEvsFTC(form);
    if (comparisonOpt) optimizations.push(comparisonOpt);

    // 4. Foreign Housing Exclusion
    const housingOpt = analyzeForeignHousingExclusion(form);
    if (housingOpt) optimizations.push(housingOpt);

    // 5. FBAR Reporting
    const fbarOpt = analyzeFBARRequirements(form);
    if (fbarOpt) optimizations.push(fbarOpt);

    // 6. FATCA/Form 8938
    const fatcaOpt = analyzeFATCARequirements(form);
    if (fatcaOpt) optimizations.push(fatcaOpt);

    // 7. Treaty Benefits
    const treatyOpt = analyzeTreatyBenefits(form);
    if (treatyOpt) optimizations.push(treatyOpt);

    // 8. Foreign Investment Income (PFIC warning)
    const pficOpt = analyzePFICIssues(form);
    if (pficOpt) optimizations.push(pficOpt);

    return optimizations;
}

/**
 * Analyze Foreign Earned Income Exclusion eligibility
 */
function analyzeForeignEarnedIncomeExclusion(form) {
    const foreignEarnedIncome = parseFloat(form.foreignEarnedIncome) || 0;
    const livesAbroad = form.livesAbroad || form.meetsBonaFideResidence || form.meetsPhysicalPresence;

    if (foreignEarnedIncome <= 0 && !livesAbroad) return null;

    // Check qualification tests
    const meetsBonaFide = form.meetsBonaFideResidence;
    const meetsPhysicalPresence = form.meetsPhysicalPresence;
    const daysAbroad = parseFloat(form.daysOutsideUS) || 0;

    const qualifies = meetsBonaFide || meetsPhysicalPresence || daysAbroad >= 330;
    const exclusionAmount = Math.min(foreignEarnedIncome, FEIE_LIMIT_2025);

    const currentTax = calculateTotalTax(form);
    const marginalRate = getMarginalRate(currentTax.taxableIncome);
    const taxSavings = exclusionAmount * marginalRate;

    if (qualifies && foreignEarnedIncome > 0) {
        return {
            id: 'intl-feie-eligible',
            name: 'Foreign Earned Income Exclusion (FEIE)',
            category: CATEGORY.INCOME_TIMING,
            potentialSavings: Math.round(taxSavings),
            difficulty: DIFFICULTY.MEDIUM,
            description: `Exclude up to $${FEIE_LIMIT_2025.toLocaleString()} of foreign earned income from US tax.`,
            details: [
                `Foreign earned income: $${foreignEarnedIncome.toLocaleString()}`,
                `Exclusion limit (2025): $${FEIE_LIMIT_2025.toLocaleString()}`,
                `Your exclusion: $${exclusionAmount.toLocaleString()}`,
                `Tax savings: $${Math.round(taxSavings).toLocaleString()}`,
            ],
            qualificationTests: [
                {
                    name: 'Physical Presence Test',
                    desc: 'Present in foreign country 330 days in any 12-month period',
                    met: meetsPhysicalPresence || daysAbroad >= 330,
                },
                {
                    name: 'Bona Fide Residence Test',
                    desc: 'Foreign country resident for entire tax year',
                    met: meetsBonaFide,
                },
            ],
            requirements: [
                '✅ Tax home must be in foreign country',
                '✅ Must have foreign earned income (wages, self-employment)',
                '❌ Does NOT apply to: investment income, pensions, dividends',
                '⚠️ Election is binding - cannot revoke for 5 years without IRS approval',
            ],
            stackingNote: 'Can combine with Foreign Housing Exclusion for additional savings',
            authority: {
                citation: 'IRC §911 • Form 2555 • Publication 54',
                details: [
                    'IRC §911: Foreign Earned Income Exclusion',
                    'Form 2555: Required form to claim exclusion',
                    'Publication 54: Tax Guide for U.S. Citizens Abroad',
                ],
                url: 'https://www.irs.gov/forms-pubs/about-form-2555'
            },
            formImpact: ['Form 2555'],
            timeline: 'This Return',
        };
    } else if (foreignEarnedIncome > 0) {
        return {
            id: 'intl-feie-opportunity',
            name: 'Foreign Earned Income Exclusion - Not Currently Qualified',
            category: CATEGORY.INCOME_TIMING,
            potentialSavings: Math.round(taxSavings),
            difficulty: DIFFICULTY.HARD,
            description: 'You may qualify for FEIE if you meet presence requirements.',
            details: [
                `Foreign earned income: $${foreignEarnedIncome.toLocaleString()}`,
                `Days abroad this year: ${daysAbroad}`,
                `Need 330 days for Physical Presence Test`,
            ],
            howToQualify: [
                'Physical Presence: Be abroad 330+ days in 12-month period',
                'Period can straddle tax years',
                'Brief trips to US count against you',
                'OR establish bona fide residence abroad',
            ],
            authority: {
                citation: 'IRC §911 • Publication 54',
            },
            timeline: 'Future Planning',
        };
    }

    return null;
}

/**
 * Analyze Foreign Tax Credit opportunities
 */
function analyzeForeignTaxCredit(form) {
    const foreignTaxPaid = parseFloat(form.foreignTaxPaid) || 0;

    if (foreignTaxPaid <= 0) return null;

    const foreignIncome = parseFloat(form.foreignEarnedIncome) ||
        parseFloat(form.totalForeignIncome) || 0;

    return {
        id: 'intl-foreign-tax-credit',
        name: 'Foreign Tax Credit (FTC)',
        category: CATEGORY.CREDITS,
        potentialSavings: Math.round(foreignTaxPaid),
        difficulty: DIFFICULTY.MEDIUM,
        description: 'Credit for foreign taxes paid, reducing double taxation.',
        details: [
            `Foreign taxes paid: $${foreignTaxPaid.toLocaleString()}`,
            `Foreign income: $${foreignIncome.toLocaleString()}`,
            'Dollar-for-dollar credit against US tax',
            'Excess credits can carry back 1 year or forward 10 years',
        ],
        creditLimitation: [
            'Credit limited by foreign source income ratio',
            'Separate baskets: passive, general, branch remittances',
            'Cannot exceed US tax on foreign income',
        ],
        forms: [
            'Form 1116 (required if >$300 single or >$600 MFJ)',
            'Schedule B attachment for simplified method',
        ],
        authority: {
            citation: 'IRC §901-909 • Form 1116 • Publication 514',
            details: [
                'IRC §901: Foreign tax credit allowed',
                'IRC §904: Limitation on credit',
                'Form 1116: Foreign Tax Credit form',
            ],
            url: 'https://www.irs.gov/forms-pubs/about-form-1116'
        },
        formImpact: ['Form 1116'],
        timeline: 'This Return',
    };
}

/**
 * Compare FEIE vs Foreign Tax Credit
 */
function analyzeFEIEvsFTC(form) {
    const foreignEarnedIncome = parseFloat(form.foreignEarnedIncome) || 0;
    const foreignTaxPaid = parseFloat(form.foreignTaxPaid) || 0;

    if (foreignEarnedIncome <= 0 || foreignTaxPaid <= 0) return null;

    const currentTax = calculateTotalTax(form);
    const marginalRate = getMarginalRate(currentTax.taxableIncome);

    // Estimate savings under each method
    const exclusionAmount = Math.min(foreignEarnedIncome, FEIE_LIMIT_2025);
    const feieSavings = exclusionAmount * marginalRate;
    const ftcSavings = foreignTaxPaid; // Credit is dollar-for-dollar

    const foreignTaxRate = foreignTaxPaid / foreignEarnedIncome;

    let recommendation;
    if (foreignTaxRate > marginalRate) {
        recommendation = 'FTC';
    } else if (feieSavings > ftcSavings) {
        recommendation = 'FEIE';
    } else {
        recommendation = 'FTC';
    }

    return {
        id: 'intl-feie-vs-ftc',
        name: 'FEIE vs Foreign Tax Credit Analysis',
        category: CATEGORY.CREDITS,
        potentialSavings: Math.max(Math.round(feieSavings), Math.round(ftcSavings)),
        difficulty: DIFFICULTY.HARD,
        description: 'Choose the method that minimizes your overall tax burden.',
        details: [
            `FEIE potential savings: $${Math.round(feieSavings).toLocaleString()}`,
            `FTC potential savings: $${Math.round(ftcSavings).toLocaleString()}`,
            `Foreign tax rate: ${(foreignTaxRate * 100).toFixed(1)}%`,
            `Your US marginal rate: ${(marginalRate * 100).toFixed(0)}%`,
        ],
        recommendation: {
            choice: recommendation,
            reason: recommendation === 'FTC'
                ? 'Foreign tax rate exceeds US rate - FTC more valuable'
                : 'FEIE produces larger overall tax reduction',
        },
        considerations: [
            'FEIE: Cannot be revoked for 5 years',
            'FTC: Unused credits carry forward 10 years',
            'FEIE: Stacks with Foreign Housing Exclusion',
            'FTC: Better if you plan to return to US soon',
            'High-tax countries: FTC usually better',
            'Low/no-tax countries: FEIE usually better',
        ],
        authority: {
            citation: 'IRC §911, §901 • Publication 54 • Publication 514',
        },
        timeline: 'This Return',
    };
}

/**
 * Analyze Foreign Housing Exclusion
 */
function analyzeForeignHousingExclusion(form) {
    const livesAbroad = form.livesAbroad || form.meetsBonaFideResidence || form.meetsPhysicalPresence;
    const housingExpenses = parseFloat(form.foreignHousingExpenses) || 0;

    if (!livesAbroad || housingExpenses <= 0) return null;

    // Base housing amount (2025 - roughly 16% of FEIE limit)
    const baseAmount = Math.round(FEIE_LIMIT_2025 * 0.16);
    const maxHousingExclusion = Math.round(FEIE_LIMIT_2025 * 0.30);
    const qualifyingExpenses = Math.max(0, housingExpenses - baseAmount);
    const exclusionAmount = Math.min(qualifyingExpenses, maxHousingExclusion);

    const currentTax = calculateTotalTax(form);
    const marginalRate = getMarginalRate(currentTax.taxableIncome);
    const taxSavings = exclusionAmount * marginalRate;

    return {
        id: 'intl-foreign-housing',
        name: 'Foreign Housing Exclusion',
        category: CATEGORY.DEDUCTIONS,
        potentialSavings: Math.round(taxSavings),
        difficulty: DIFFICULTY.MEDIUM,
        description: 'Exclude additional income for high housing costs abroad.',
        details: [
            `Housing expenses: $${housingExpenses.toLocaleString()}`,
            `Base amount (not excluded): $${baseAmount.toLocaleString()}`,
            `Qualifying expenses: $${qualifyingExpenses.toLocaleString()}`,
            `Exclusion amount: $${exclusionAmount.toLocaleString()}`,
        ],
        qualifyingExpenses: [
            'Rent or fair rental value of employer housing',
            'Utilities (except telephone)',
            'Property insurance',
            'Residential parking',
            'Furniture rental',
        ],
        nonQualifying: [
            '❌ Mortgage payments (principal or interest)',
            '❌ Domestic labor (maids, gardeners)',
            '❌ Home improvements',
            '❌ Furniture purchases',
        ],
        authority: {
            citation: 'IRC §911(c) • Form 2555 Part VI',
        },
        formImpact: ['Form 2555 (Part VI)'],
        timeline: 'This Return',
    };
}

/**
 * Analyze FBAR reporting requirements
 */
function analyzeFBARRequirements(form) {
    const hasForeignAccounts = form.foreignBankAccounts || form.hasForeignAccounts;
    const maxAccountValue = parseFloat(form.maxForeignAccountValue) || 0;

    if (!hasForeignAccounts) return null;

    const fbarRequired = maxAccountValue >= FBAR_THRESHOLD;

    return {
        id: 'intl-fbar-requirement',
        name: fbarRequired ? '⚠️ FBAR Filing Required' : 'FBAR - Not Required',
        category: CATEGORY.COMPLIANCE,
        potentialSavings: 0,
        difficulty: DIFFICULTY.MEDIUM,
        description: fbarRequired
            ? 'You must file FinCEN 114 (FBAR) reporting foreign accounts.'
            : 'Below FBAR threshold - no filing required.',
        details: [
            `Maximum account value: $${maxAccountValue.toLocaleString()}`,
            `FBAR threshold: $${FBAR_THRESHOLD.toLocaleString()} aggregate`,
            fbarRequired ? 'FBAR REQUIRED' : 'No FBAR needed',
        ],
        fbarDetails: fbarRequired ? [
            'Due April 15 (auto-extended to October 15)',
            'Filed electronically with FinCEN (NOT IRS)',
            'Report ALL foreign accounts, not just over $10k',
            'Includes joint accounts, signatory authority',
        ] : undefined,
        penalties: fbarRequired ? [
            'Non-willful: Up to $10,000 per violation',
            'Willful: Greater of $100,000 or 50% of account balance',
            'Criminal penalties possible for willful violations',
        ] : undefined,
        whatToReport: [
            'Bank accounts (checking, savings)',
            'Securities accounts',
            'Mutual funds held at foreign institutions',
            'Foreign retirement accounts (may be exempt)',
        ],
        authority: {
            citation: '31 USC §5314 • 31 CFR §1010.350 • FinCEN 114',
            url: 'https://bsaefiling.fincen.treas.gov/NoRegFBARFiler.html'
        },
        formImpact: fbarRequired ? ['FinCEN 114 (FBAR)'] : [],
        deadline: 'April 15 (auto-extends to October 15)',
        timeline: fbarRequired ? 'Immediate' : 'N/A',
        isCompliance: true,
    };
}

/**
 * Analyze FATCA/Form 8938 requirements
 */
function analyzeFATCARequirements(form) {
    const totalForeignAssets = parseFloat(form.totalForeignAssets) ||
        parseFloat(form.maxForeignAccountValue) || 0;
    const livesAbroad = form.livesAbroad;
    const filingStatus = form.filingStatus;

    // Determine threshold based on residence
    let threshold = FATCA_THRESHOLD_US;
    if (livesAbroad) {
        threshold = FATCA_THRESHOLD_ABROAD;
    }
    if (filingStatus === 'married') {
        threshold *= 2;
    }

    const fatcaRequired = totalForeignAssets >= threshold;

    if (totalForeignAssets <= 0) return null;

    return {
        id: 'intl-fatca-8938',
        name: fatcaRequired ? '⚠️ Form 8938 Required (FATCA)' : 'Form 8938 - Not Required',
        category: CATEGORY.COMPLIANCE,
        potentialSavings: 0,
        difficulty: DIFFICULTY.MEDIUM,
        description: 'Report specified foreign financial assets on Form 8938.',
        details: [
            `Foreign assets: $${totalForeignAssets.toLocaleString()}`,
            `Your threshold: $${threshold.toLocaleString()}`,
            fatcaRequired ? 'FORM 8938 REQUIRED' : 'Below threshold',
        ],
        thresholds: [
            'US residents: $50,000 EOY or $75,000 during year (single)',
            'US residents: $100,000 EOY or $150,000 during year (married)',
            'Abroad: $200,000 EOY or $300,000 during year (single)',
            'Abroad: $400,000 EOY or $600,000 during year (married)',
        ],
        whatToReport: [
            'Foreign bank/securities accounts',
            'Foreign stock/securities (not in US account)',
            'Foreign partnership interests',
            'Foreign mutual funds',
            'Foreign hedge funds',
            'Foreign life insurance with cash value',
        ],
        vsWBAR: [
            'FBAR: Accounts only, filed with FinCEN',
            'Form 8938: Broader assets, filed with tax return',
            'May need to file BOTH if thresholds met',
        ],
        authority: {
            citation: 'IRC §6038D • Form 8938 • FATCA',
            url: 'https://www.irs.gov/forms-pubs/about-form-8938'
        },
        formImpact: fatcaRequired ? ['Form 8938'] : [],
        timeline: fatcaRequired ? 'This Return' : 'N/A',
        isCompliance: true,
    };
}

/**
 * Analyze tax treaty benefits
 */
function analyzeTreatyBenefits(form) {
    const country = form.foreignCountry || form.countryOfResidence;
    const hasInvestmentIncome = parseFloat(form.foreignDividends) > 0 ||
        parseFloat(form.foreignInterest) > 0;

    if (!country) return null;

    // Common treaty countries with significant benefits
    const treatyCountries = {
        'UK': { dividendRate: 15, interestRate: 0 },
        'Canada': { dividendRate: 15, interestRate: 0 },
        'Germany': { dividendRate: 15, interestRate: 0 },
        'France': { dividendRate: 15, interestRate: 0 },
        'Japan': { dividendRate: 10, interestRate: 10 },
        'Australia': { dividendRate: 15, interestRate: 10 },
    };

    const treatyInfo = treatyCountries[country.toUpperCase()];

    return {
        id: 'intl-treaty-benefits',
        name: 'Tax Treaty Benefits',
        category: CATEGORY.CREDITS,
        potentialSavings: 0,
        difficulty: DIFFICULTY.HARD,
        description: 'Reduce or eliminate double taxation through treaty provisions.',
        details: [
            `Country: ${country}`,
            treatyInfo
                ? `Treaty rates: Dividends ${treatyInfo.dividendRate}%, Interest ${treatyInfo.interestRate}%`
                : 'Review specific treaty for applicable rates',
        ],
        commonBenefits: [
            'Reduced withholding on dividends/interest',
            'Exemption for certain pension income',
            'Modified permanent establishment rules',
            'Tie-breaker rules for dual residents',
        ],
        howToClaim: [
            'Form W-8BEN for US withholding reduction',
            'Form 8833 to disclose treaty positions',
            'Include treaty article number on return',
        ],
        authority: {
            citation: 'US Tax Treaties • Form 8833 • Publication 901',
            url: 'https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z'
        },
        isInformational: true,
        timeline: 'This Return',
    };
}

/**
 * Analyze PFIC issues for foreign investments
 */
function analyzePFICIssues(form) {
    const hasForeignMutualFunds = form.hasForeignMutualFunds || form.hasPFIC;
    const pficIncome = parseFloat(form.pficIncome) || 0;

    if (!hasForeignMutualFunds && pficIncome <= 0) return null;

    return {
        id: 'intl-pfic-warning',
        name: '⚠️ PFIC Tax Warning',
        category: CATEGORY.CAPITAL_GAINS,
        potentialSavings: 0,
        difficulty: DIFFICULTY.HARD,
        description: 'Passive Foreign Investment Companies have punitive US tax treatment.',
        details: [
            'PFICs include most foreign mutual funds',
            'Default taxation: Interest + excess distribution regime',
            'Can result in effective tax rates over 50%',
        ],
        whatIsPFIC: [
            'Foreign corporation with 75%+ passive income, OR',
            '50%+ assets produce passive income',
            'Includes: Foreign mutual funds, ETFs, holding companies',
        ],
        taxRegimes: [
            'Default: Highest rate + interest back to acquisition',
            'QEF Election: Current income inclusion (if fund provides info)',
            'Mark-to-Market: Annual gain/loss recognition',
        ],
        recommendations: [
            '⚠️ Avoid buying foreign mutual funds if possible',
            'Use US-based mutual funds for international exposure',
            'If you own PFICs: Consult international tax specialist',
            'Required: Form 8621 for each PFIC',
        ],
        authority: {
            citation: 'IRC §1291-1298 • Form 8621',
            url: 'https://www.irs.gov/forms-pubs/about-form-8621'
        },
        formImpact: ['Form 8621'],
        timeline: 'This Return',
        isWarning: true,
    };
}

/**
 * Helper: Get marginal rate
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
