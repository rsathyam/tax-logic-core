/**
 * Augusta Rule Optimizer
 * Analyzes Section 280A(g) 14-day rental opportunity for business owners
 * 
 * The Augusta Rule allows homeowners to rent their home to their own business
 * for up to 14 days per year tax-free, while the business can deduct the expense.
 */

import { calculateTotalTax } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';
import { formatAuthorityForDisplay } from '../utils/taxAuthority.js';

// Fair market rental rates by region (conservative estimates)
const REGIONAL_DAILY_RATES = {
    highCost: 500,      // NYC, SF, LA, Boston, DC
    mediumCost: 350,    // Chicago, Seattle, Denver, Austin, Miami
    lowCost: 200,       // Most other areas
    default: 300        // National average estimate
};

// High-cost states/metros for rate determination
const HIGH_COST_STATES = ['CA', 'NY', 'MA', 'DC', 'HI'];
const MEDIUM_COST_STATES = ['WA', 'CO', 'IL', 'TX', 'FL', 'NJ', 'CT', 'MD', 'VA'];

/**
 * Analyze Augusta Rule opportunity for Schedule C/S-Corp/Partnership business owners
 */
export function analyzeAugustaRuleOptimization(form) {
    const optimizations = [];

    // Must have a business entity
    const hasScheduleC = form.hasScheduleC;
    const hasSCorp = form.hasSCorp;
    const hasPartnership = form.hasPartnership;

    if (!hasScheduleC && !hasSCorp && !hasPartnership) {
        return optimizations;
    }

    // Check for home ownership (proxy indicators)
    const hasHomeOwnership = form.mortgageInterest > 0 ||
        form.realEstateTaxes > 0 ||
        form.hasHomeOffice ||
        form.ownsHome;

    if (!hasHomeOwnership) {
        // Still suggest as opportunity if they have a business
        optimizations.push(createAugustaOpportunityPrompt(form));
        return optimizations;
    }

    // Check if already using Augusta Rule
    const currentAugustaUsage = parseFloat(form.augustaRuleDays) || 0;
    const currentAugustaIncome = parseFloat(form.augustaRuleIncome) || 0;

    if (currentAugustaUsage >= 14) {
        // Already maximizing the rule
        return optimizations;
    }

    // Calculate potential savings
    const state = form.state || form.stateOfResidence || '';
    const dailyRate = getDailyRentalRate(form, state);
    const availableDays = 14 - currentAugustaUsage;
    const potentialRentalIncome = availableDays * dailyRate;

    // Get marginal tax rate for savings calculation
    const currentTax = calculateTotalTax(form);
    const marginalRate = getMarginalRate(currentTax.taxableIncome);

    // Calculate benefits:
    // 1. Homeowner receives rent TAX-FREE (no income recognition)
    // 2. Business deducts the rental expense (reduces taxable income)
    const businessDeductionSavings = potentialRentalIncome * marginalRate;
    const selfEmploymentSavings = hasScheduleC ? potentialRentalIncome * 0.0765 : 0; // SE tax if Schedule C
    const totalPotentialSavings = businessDeductionSavings + selfEmploymentSavings;

    // Get IRS authority citation
    const authority = formatAuthorityForDisplay('augustaRule');

    if (totalPotentialSavings > 100) {
        optimizations.push({
            id: 'augusta-rule-14-day-rental',
            name: 'Augusta Rule: Rent Home to Your Business Tax-Free',
            category: CATEGORY.SELF_EMPLOYMENT,
            potentialSavings: Math.round(totalPotentialSavings),
            difficulty: DIFFICULTY.MEDIUM,
            description: `Rent your home to your business for up to ${availableDays} days at fair market value. You receive tax-free income while your business gets a deduction.`,
            details: [
                `Estimated fair market daily rate: $${dailyRate.toLocaleString()}`,
                `Available days (max 14): ${availableDays}`,
                `Potential tax-free income to you: $${potentialRentalIncome.toLocaleString()}`,
                `Business deduction value: $${Math.round(businessDeductionSavings).toLocaleString()}`,
                hasScheduleC ? `SE tax savings: $${Math.round(selfEmploymentSavings).toLocaleString()}` : null,
            ].filter(Boolean),
            benefits: [
                'Rental income is completely tax-free to the homeowner',
                'Business can deduct the rental as ordinary business expense',
                'No reporting required if fewer than 15 days',
                'Works for meetings, planning sessions, retreats, strategy days',
            ],
            requirements: [
                'Must charge fair market value rent (comparable to local hotels)',
                'Must be for legitimate business purposes, not entertainment',
                'Keep documentation: rental agreement, meeting agendas, attendees',
                'Business must be a separate entity (Corp, LLC, or clear Schedule C)',
                'Space must have business use (meetings, not just personal office)',
            ],
            documentation: [
                'Written rental agreement between you and your business',
                'Fair market value appraisal or comparable local rates',
                'Meeting agendas and attendance records',
                'Minutes or notes from business meetings',
                'Calendar of rental days used',
            ],
            authority: authority,
            auditRisk: 'MEDIUM',
            auditNotes: 'IRS scrutinizes self-dealing; ensure arm\'s-length terms and genuine business purpose',
            timeline: 'This Return & Future Years',
            formImpact: [
                'Schedule C/1120-S/1065: Deduct rental expense under "Rent"',
                'Form 1040: No reporting of rental income if <15 days',
            ],
        });
    }

    return optimizations;
}

/**
 * Create prompt for business owners without confirmed home ownership
 */
function createAugustaOpportunityPrompt(form) {
    const authority = formatAuthorityForDisplay('augustaRule');

    return {
        id: 'augusta-rule-opportunity',
        name: 'Do You Own Your Home? Consider the Augusta Rule',
        category: CATEGORY.SELF_EMPLOYMENT,
        potentialSavings: 0, // Unknown until confirmed
        difficulty: DIFFICULTY.MEDIUM,
        description: 'If you own your home, you may be able to rent it to your business for up to 14 days per year completely tax-free.',
        details: [
            'Homeowner receives rental income with zero federal tax',
            'Business deducts the rental expense',
            'Named after Augusta, GA homeowners renting during Masters Tournament',
            'Works for any business owner with a home-based meeting space',
        ],
        isQuestion: true,
        questionPrompt: 'Do you own your home and hold business meetings there?',
        authority: authority,
        timeline: 'Future Planning',
    };
}

/**
 * Get estimated daily rental rate based on location
 */
function getDailyRentalRate(form, state) {
    // Check for custom rate from form
    if (form.homeRentalDailyRate && form.homeRentalDailyRate > 0) {
        return parseFloat(form.homeRentalDailyRate);
    }

    // Determine rate tier based on state
    if (HIGH_COST_STATES.includes(state)) {
        return REGIONAL_DAILY_RATES.highCost;
    }
    if (MEDIUM_COST_STATES.includes(state)) {
        return REGIONAL_DAILY_RATES.mediumCost;
    }
    if (state) {
        return REGIONAL_DAILY_RATES.lowCost;
    }

    return REGIONAL_DAILY_RATES.default;
}

/**
 * Calculate marginal tax rate
 */
function getMarginalRate(taxableIncome) {
    // 2025 brackets (OBBBA permanent rates)
    if (taxableIncome > 626350) return 0.37;
    if (taxableIncome > 250525) return 0.35;
    if (taxableIncome > 197300) return 0.32;
    if (taxableIncome > 103350) return 0.24;
    if (taxableIncome > 48475) return 0.22;
    if (taxableIncome > 11925) return 0.12;
    return 0.10;
}

/**
 * Analyze Augusta Rule for specific scenarios
 */
export function analyzeAugustaRuleScenarios(form) {
    const scenarios = [];

    // Scenario 1: Annual board meetings
    if (form.hasSCorp || form.hasPartnership) {
        scenarios.push({
            name: 'Annual Board/Member Meetings',
            days: 4,
            description: 'Quarterly board meetings or annual member meetings',
            suggestedRate: 'Full-day conference room rates + accommodations value'
        });
    }

    // Scenario 2: Strategic planning retreats
    if (form.hasScheduleC || form.hasSCorp) {
        scenarios.push({
            name: 'Strategic Planning Sessions',
            days: 6,
            description: 'Semi-annual planning retreats, budget reviews, strategy sessions',
            suggestedRate: 'Compare to local retreat center or conference hotel'
        });
    }

    // Scenario 3: Team meetings/training
    scenarios.push({
        name: 'Team Meetings & Training',
        days: 4,
        description: 'Training sessions, team building, contractor meetings',
        suggestedRate: 'Local meeting room rental rates'
    });

    return scenarios;
}

/**
 * Validate Augusta Rule compliance
 */
export function validateAugustaRuleCompliance(form) {
    const warnings = [];
    const errors = [];

    const days = parseFloat(form.augustaRuleDays) || 0;
    const income = parseFloat(form.augustaRuleIncome) || 0;
    const rate = days > 0 ? income / days : 0;

    // Check day limit
    if (days > 14) {
        errors.push({
            code: 'EXCEEDS_14_DAY_LIMIT',
            message: `You have indicated ${days} rental days. The Augusta Rule only applies to 14 days or fewer. All ${days} days of rental income would be taxable, and you must report on Schedule E.`,
            severity: 'error'
        });
    }

    // Check for reasonable rate
    if (rate > 0 && rate < 100) {
        warnings.push({
            code: 'LOW_RENTAL_RATE',
            message: `Your implied daily rate ($${rate.toFixed(0)}/day) seems low. Ensure you're charging fair market value to support the deduction.`,
            severity: 'warning'
        });
    }

    if (rate > 1500) {
        warnings.push({
            code: 'HIGH_RENTAL_RATE',
            message: `Your implied daily rate ($${rate.toFixed(0)}/day) is high. Be prepared to document comparable rates in your area.`,
            severity: 'warning'
        });
    }

    // Check business purpose
    if (days > 0 && !form.augustaRuleBusinessPurpose) {
        warnings.push({
            code: 'DOCUMENT_BUSINESS_PURPOSE',
            message: 'Ensure you document the business purpose for each rental day (meetings, sessions, etc.)',
            severity: 'info'
        });
    }

    return { warnings, errors, isValid: errors.length === 0 };
}
