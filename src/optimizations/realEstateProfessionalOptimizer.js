/**
 * Real Estate Professional Status Optimizer
 * Analyzes eligibility for REP status and unlimited passive loss deduction
 * 
 * IRS Authority:
 * - IRC §469(c)(7) - Real Estate Professional Exception
 * - Treas. Reg. §1.469-9 - Material Participation
 * - IRS Publication 925 - Passive Activity and At-Risk Rules
 */

import { calculateTotalTax } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';

// REP status requirements
const REP_REQUIREMENTS = {
    minHours: 750,           // Minimum hours in real property trades
    majorityTest: true,      // Must be more than 50% of total work time
    materialParticipation: true, // Each property must meet material participation
};

// 7 Material Participation Tests
const MATERIAL_PARTICIPATION_TESTS = [
    { id: 1, name: '500 Hour Test', desc: 'Participate > 500 hours in the activity' },
    { id: 2, name: 'Substantially All Test', desc: 'Your participation = substantially all participation' },
    { id: 3, name: '100 Hour + Most Test', desc: '> 100 hours AND more than anyone else' },
    { id: 4, name: 'Significant Participation', desc: '> 100 hours in each of multiple activities totaling > 500' },
    { id: 5, name: 'Prior Year Test', desc: 'Materially participated in any 5 of last 10 years' },
    { id: 6, name: 'Personal Service Test', desc: 'Personal service activity with 3+ prior years participation' },
    { id: 7, name: 'Facts & Circumstances', desc: '> 100 hours + regular, continuous, substantial involvement' },
];

/**
 * Analyze Real Estate Professional status opportunities
 */
export function analyzeRealEstateProfessionalOptimizations(form) {
    const optimizations = [];

    // Check for rental real estate
    const hasRentalProperty = form.hasScheduleE || form.hasRentalIncome;
    if (!hasRentalProperty) return optimizations;

    // Get rental data
    const scheduleE = form.scheduleE || {};
    const rentalIncome = parseFloat(scheduleE.rentalIncome) || parseFloat(form.rentalIncome) || 0;
    const rentalExpenses = parseFloat(scheduleE.rentalExpenses) || parseFloat(form.rentalExpenses) || 0;
    const depreciation = parseFloat(scheduleE.depreciation) || 0;
    const netRentalIncome = rentalIncome - rentalExpenses - depreciation;

    // Get RE hours
    const realEstateHours = parseFloat(form.realEstateHours) || 0;
    const otherWorkHours = parseFloat(form.otherWorkHours) || 0;
    const totalWorkHours = realEstateHours + otherWorkHours;

    // 1. Check REP status eligibility
    const repOpt = analyzeREPStatus(form, realEstateHours, otherWorkHours, netRentalIncome);
    if (repOpt) optimizations.push(repOpt);

    // 2. Check passive loss limitations
    const passiveLossOpt = analyzePassiveLossLimitation(form, netRentalIncome);
    if (passiveLossOpt) optimizations.push(passiveLossOpt);

    // 3. Grouping Election
    const groupingOpt = analyzeGroupingElection(form, scheduleE);
    if (groupingOpt) optimizations.push(groupingOpt);

    // 4. Material Participation Analysis
    const materialPartOpt = analyzeMaterialParticipation(form, scheduleE);
    if (materialPartOpt) optimizations.push(materialPartOpt);

    // 5. $25,000 Active Participation Exception
    const activePartOpt = analyzeActiveParticipation(form, netRentalIncome);
    if (activePartOpt) optimizations.push(activePartOpt);

    return optimizations;
}

/**
 * Analyze Real Estate Professional status eligibility
 */
function analyzeREPStatus(form, realEstateHours, otherWorkHours, netRentalLoss) {
    const totalWorkHours = realEstateHours + otherWorkHours;
    const meetsHourTest = realEstateHours >= REP_REQUIREMENTS.minHours;
    const meetsMajorityTest = realEstateHours > (totalWorkHours / 2);
    const qualifiesForREP = meetsHourTest && meetsMajorityTest;

    // Only show if they have losses that would benefit
    if (netRentalLoss >= 0) return null;

    const lossAmount = Math.abs(netRentalLoss);
    const currentTax = calculateTotalTax(form);
    const marginalRate = getMarginalRate(currentTax.taxableIncome);

    if (qualifiesForREP) {
        return {
            id: 'rep-status-qualified',
            name: '🎉 You Qualify as Real Estate Professional!',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: Math.round(lossAmount * marginalRate),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Your rental losses can offset ALL other income - no passive activity limits!',
            details: [
                `Real estate hours: ${realEstateHours.toLocaleString()} (requires 750+) ✅`,
                `Total work hours: ${totalWorkHours.toLocaleString()}`,
                `RE hours > 50%: ${(realEstateHours / totalWorkHours * 100).toFixed(0)}% ✅`,
                `Rental loss: $${lossAmount.toLocaleString()}`,
                `Tax savings: $${Math.round(lossAmount * marginalRate).toLocaleString()}`,
            ],
            requirements: [
                '✅ More than half of personal services in real property trades',
                '✅ More than 750 hours in real property trades',
                '⚠️ Each property must also meet material participation test',
            ],
            nextSteps: [
                'Document hours in contemporaneous time log',
                'Ensure each property meets material participation OR...',
                'Make grouping election to treat all rentals as one activity',
                'Keep detailed records for potential audit',
            ],
            authority: {
                citation: 'IRC §469(c)(7) • Treas. Reg. §1.469-9 • Publication 925',
                details: [
                    'IRC §469(c)(7): Real Estate Professional exception',
                    'Treas. Reg. §1.469-9: Hours counting rules',
                    'Publication 925: Passive Activity Rules',
                ],
                url: 'https://www.irs.gov/publications/p925'
            },
            auditRisk: 'HIGH',
            auditNotes: 'REP status is heavily scrutinized. Maintain contemporaneous time logs.',
            timeline: 'This Return',
            formImpact: ['Form 8582 (may not be required if REP)'],
        };
    } else {
        // Show what's needed to qualify
        const hoursNeeded = REP_REQUIREMENTS.minHours - realEstateHours;
        const percentageOfWork = (realEstateHours / (totalWorkHours || 1)) * 100;

        return {
            id: 'rep-status-opportunity',
            name: 'Real Estate Professional Status Opportunity',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: Math.round(lossAmount * marginalRate),
            difficulty: DIFFICULTY.HARD,
            description: 'Qualify as REP to deduct rental losses against all income.',
            details: [
                `Current RE hours: ${realEstateHours.toLocaleString()} (need 750+)`,
                `Current % of work in RE: ${percentageOfWork.toFixed(0)}% (need >50%)`,
                hoursNeeded > 0 ? `Hours needed: ${hoursNeeded} more` : null,
                `Potential loss deduction: $${lossAmount.toLocaleString()}`,
                `Potential tax savings: $${Math.round(lossAmount * marginalRate).toLocaleString()}/year`,
            ].filter(Boolean),
            requirements: [
                `${meetsHourTest ? '✅' : '❌'} More than 750 hours in real property trades`,
                `${meetsMajorityTest ? '✅' : '❌'} More than 50% of work in real property trades`,
                '⚪ Material participation in each rental (or grouping election)',
            ],
            qualifyingActivities: [
                'Development, redevelopment, construction, reconstruction',
                'Acquisition, conversion, rental operations',
                'Management, leasing, brokerage',
                'NOTE: Managing your own rentals counts!',
            ],
            strategy: [
                'Reduce W-2 hours if possible (part-time, retire, spouse focuses on RE)',
                'Increase RE activities (manage properties yourself)',
                'One spouse can qualify for both (filing jointly)',
                'Consider quitting day job if RE income can support',
            ],
            authority: {
                citation: 'IRC §469(c)(7) • Publication 925',
            },
            timeline: 'Future Tax Years',
        };
    }
}

/**
 * Analyze passive loss limitation
 */
function analyzePassiveLossLimitation(form, netRentalIncome) {
    if (netRentalIncome >= 0) return null; // No losses

    const lossAmount = Math.abs(netRentalIncome);
    const currentTax = calculateTotalTax(form);
    const agi = currentTax.agi;

    // Check if losses are being limited
    const suspendedLosses = parseFloat(form.suspendedPassiveLosses) || 0;

    if (suspendedLosses > 0) {
        return {
            id: 'rep-suspended-losses',
            name: 'Suspended Passive Losses Available',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: 0, // Info only
            difficulty: DIFFICULTY.MEDIUM,
            description: 'You have passive losses suspended from prior years.',
            details: [
                `Suspended losses: $${suspendedLosses.toLocaleString()}`,
                `Current year loss: $${lossAmount.toLocaleString()}`,
                'Losses released when property sold in taxable disposition',
            ],
            releaseOptions: [
                'Qualify as Real Estate Professional (immediate release)',
                'Sell property in fully taxable sale (losses released)',
                'Generate passive income to offset (e.g., K-1)',
                'Installment sale: Losses released proportionally',
            ],
            authority: {
                citation: 'IRC §469(g) • Publication 925',
            },
            isInformational: true,
            timeline: 'Future Planning',
        };
    }

    return null;
}

/**
 * Analyze grouping election for rental activities
 */
function analyzeGroupingElection(form, scheduleE) {
    const numberOfProperties = parseFloat(form.numberOfRentalProperties) ||
        parseFloat(scheduleE.propertyCount) || 0;

    if (numberOfProperties < 2) return null;

    return {
        id: 'rep-grouping-election',
        name: 'Rental Property Grouping Election',
        category: CATEGORY.DEDUCTIONS,
        potentialSavings: 0,
        difficulty: DIFFICULTY.MEDIUM,
        description: 'Treat all rental properties as single activity for material participation.',
        details: [
            `Number of rental properties: ${numberOfProperties}`,
            'Grouping allows meeting material participation once for all',
            'Easier to meet 500-hour test on combined basis',
        ],
        benefits: [
            'Meet material participation for all rentals together',
            'Combine hours across all properties',
            'Simplifies REP qualification',
        ],
        requirements: [
            'Must be Real Estate Professional first',
            'Election made by attaching statement to return',
            'Election is binding for future years',
            'Made on timely-filed return (including extensions)',
        ],
        howToMake: [
            'Attach statement to your tax return',
            'Statement must identify the election',
            'List all rental properties included',
            'File by due date (including extensions)',
        ],
        authority: {
            citation: 'Treas. Reg. §1.469-9(g) • Rev. Proc. 2010-13',
        },
        isInformational: true,
        timeline: 'This Return (if REP)',
    };
}

/**
 * Analyze material participation tests
 */
function analyzeMaterialParticipation(form, scheduleE) {
    const propertyHours = parseFloat(form.rentalPropertyHours) || 0;

    if (propertyHours <= 0) return null;

    // Determine which tests might be met
    const testResults = MATERIAL_PARTICIPATION_TESTS.map(test => {
        let met = false;
        switch (test.id) {
            case 1: met = propertyHours >= 500; break;
            case 3: met = propertyHours >= 100; break; // Simplified
            case 4: met = propertyHours >= 100; break;
            case 7: met = propertyHours >= 100; break;
            default: met = false;
        }
        return { ...test, met };
    });

    return {
        id: 'rep-material-participation',
        name: 'Material Participation Tests',
        category: CATEGORY.DEDUCTIONS,
        potentialSavings: 0,
        difficulty: DIFFICULTY.MEDIUM,
        description: 'To deduct rental losses as REP, each property must meet material participation.',
        details: [
            `Hours in rental activities: ${propertyHours.toLocaleString()}`,
            'Must meet ONE of seven tests for each property (or grouped)',
        ],
        tests: testResults,
        easiestTests: [
            'Test #1: 500+ hours in the property',
            'Test #4: 100+ hours in multiple activities totaling 500+',
            'Use grouping election to combine all properties',
        ],
        authority: {
            citation: 'Treas. Reg. §1.469-5T(a) • Publication 925',
        },
        isInformational: true,
        timeline: 'This Return',
    };
}

/**
 * Analyze $25,000 active participation exception
 */
function analyzeActiveParticipation(form, netRentalLoss) {
    if (netRentalLoss >= 0) return null;

    const lossAmount = Math.abs(netRentalLoss);
    const currentTax = calculateTotalTax(form);
    const agi = currentTax.agi;
    const marginalRate = getMarginalRate(currentTax.taxableIncome);

    // $25k exception phases out from $100k to $150k AGI
    const phaseOutStart = 100000;
    const phaseOutEnd = 150000;

    if (agi >= phaseOutEnd) {
        return {
            id: 'rep-active-participation-phased-out',
            name: '$25,000 Rental Loss Exception - Phased Out',
            category: CATEGORY.DEDUCTIONS,
            potentialSavings: 0,
            difficulty: DIFFICULTY.HARD,
            description: 'Your AGI exceeds $150,000 - the $25k exception does not apply.',
            details: [
                `Your AGI: $${agi.toLocaleString()}`,
                `Phase-out complete at: $150,000`,
                `Rental loss: $${lossAmount.toLocaleString()}`,
                'Loss is suspended until property sold or you have passive income',
            ],
            alternatives: [
                'Qualify as Real Estate Professional',
                'Generate passive income from other sources',
                'Sell property to release suspended losses',
            ],
            authority: {
                citation: 'IRC §469(i) • Publication 925',
            },
            isInformational: true,
            timeline: 'Future Planning',
        };
    }

    let allowableDeduction = 25000;
    if (agi > phaseOutStart) {
        const reduction = (agi - phaseOutStart) * 0.5;
        allowableDeduction = Math.max(0, 25000 - reduction);
    }

    const actualDeduction = Math.min(lossAmount, allowableDeduction);
    const taxSavings = actualDeduction * marginalRate;

    return {
        id: 'rep-active-participation',
        name: '$25,000 Active Participation Exception',
        category: CATEGORY.DEDUCTIONS,
        potentialSavings: Math.round(taxSavings),
        difficulty: DIFFICULTY.EASY,
        description: 'Deduct up to $25,000 in rental losses against non-passive income.',
        details: [
            `Your AGI: $${agi.toLocaleString()}`,
            `Maximum exception: $${allowableDeduction.toLocaleString()}`,
            `Your rental loss: $${lossAmount.toLocaleString()}`,
            `Deductible amount: $${actualDeduction.toLocaleString()}`,
            `Tax savings: $${Math.round(taxSavings).toLocaleString()}`,
        ],
        requirements: [
            'Actively participate in rental (make management decisions)',
            'Own at least 10% of rental property',
            'Not a limited partner',
            'AGI under $150,000 (phases out above $100,000)',
        ],
        authority: {
            citation: 'IRC §469(i) • Publication 925',
            details: [
                'IRC §469(i): $25k active participation exception',
                'Phases out at 50 cents per dollar over $100k AGI',
            ],
            url: 'https://www.irs.gov/publications/p925'
        },
        timeline: 'This Return',
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
