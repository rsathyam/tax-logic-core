/**
 * K-1 Optimizer
 * Analyzes Schedule K-1 pass-through income for optimization opportunities
 * Covers partnerships (Form 1065) and S-Corporations (Form 1120-S)
 */

import { calculateTotalTax } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';
import { formatAuthorityForDisplay } from '../utils/taxAuthority.js';

// 2025 QBI thresholds (OBBBA made permanent)
const QBI_THRESHOLDS_2025 = {
    single: { start: 197300, end: 247300 },
    married: { start: 394600, end: 494600 },
};

// Specified Service Trades or Businesses (SSTBs) - limited QBI above thresholds
const SSTB_CATEGORIES = [
    'health', 'law', 'accounting', 'actuarial', 'performing arts',
    'consulting', 'athletics', 'financial services', 'brokerage',
    'investment management', 'trading', 'dealing'
];

/**
 * Analyze all K-1 optimization opportunities
 */
export function analyzeK1Optimizations(form) {
    const optimizations = [];

    // Check for K-1 income
    const hasK1 = form.hasScheduleK1 || form.hasK1Income ||
        form.partnershipIncome || form.sCorpIncome;

    if (!hasK1) return optimizations;

    // Get K-1 details
    const k1Data = form.scheduleK1 || {};
    const partnershipIncome = parseFloat(form.partnershipIncome) || parseFloat(k1Data.ordinaryIncome) || 0;
    const sCorpIncome = parseFloat(form.sCorpIncome) || 0;
    const guaranteedPayments = parseFloat(k1Data.guaranteedPayments) || 0;
    const k1CapitalGains = parseFloat(k1Data.capitalGains) || 0;
    const k1Section179 = parseFloat(k1Data.section179) || 0;

    const currentTax = calculateTotalTax(form);
    const taxableIncome = currentTax.taxableIncome;
    const filingStatus = form.filingStatus || 'single';

    // 1. QBI Deduction Analysis for K-1 Income
    const qbiOpt = analyzeK1QBI(form, partnershipIncome + sCorpIncome, guaranteedPayments, taxableIncome, filingStatus);
    if (qbiOpt) optimizations.push(qbiOpt);

    // 2. Guaranteed Payments Warning
    const gpOpt = analyzeGuaranteedPayments(form, guaranteedPayments, partnershipIncome);
    if (gpOpt) optimizations.push(gpOpt);

    // 3. S-Corp Reasonable Compensation
    const sCorpOpt = analyzeSCorpCompensation(form, sCorpIncome);
    if (sCorpOpt) optimizations.push(sCorpOpt);

    // 4. Self-Employment Tax on K-1
    const seTaxOpt = analyzeK1SETax(form, partnershipIncome, guaranteedPayments, k1Data);
    if (seTaxOpt) optimizations.push(seTaxOpt);

    // 5. K-1 Basis Tracking
    const basisOpt = analyzeK1Basis(form, k1Data);
    if (basisOpt) optimizations.push(basisOpt);

    // 6. Section 199A Pass-Through
    const section199AOpt = analyzeSection199ADetails(form, k1Data);
    if (section199AOpt) optimizations.push(section199AOpt);

    return optimizations;
}

/**
 * Analyze QBI Deduction eligibility for K-1 income
 */
function analyzeK1QBI(form, qualifiedIncome, guaranteedPayments, taxableIncome, filingStatus) {
    if (qualifiedIncome <= 0) return null;

    const authority = formatAuthorityForDisplay('qbiDeduction');
    const threshold = filingStatus === 'married' ? QBI_THRESHOLDS_2025.married : QBI_THRESHOLDS_2025.single;

    // QBI = 20% of qualified business income (excluding guaranteed payments)
    // Guaranteed payments are NOT eligible for QBI deduction
    const eligibleQBI = qualifiedIncome; // K-1 ordinary income is generally eligible
    const potentialQBI = eligibleQBI * 0.20;

    // Check for phase-out
    let qbiDeduction = potentialQBI;
    let phaseOutWarning = null;

    if (taxableIncome > threshold.start) {
        if (taxableIncome >= threshold.end) {
            // Check for SSTB
            const isSSTB = form.isSpecifiedServiceBusiness || form.isSSTB;
            if (isSSTB) {
                qbiDeduction = 0;
                phaseOutWarning = 'SSTB income: QBI deduction fully phased out';
            } else {
                // W-2 wages/capital limitation applies
                const w2Wages = parseFloat(form.k1W2Wages) || 0;
                const ubia = parseFloat(form.k1UBIA) || 0; // Unadjusted Basis Immediately After Acquisition

                const wageLimit = w2Wages * 0.50;
                const wageCapitalLimit = (w2Wages * 0.25) + (ubia * 0.025);
                const limitation = Math.max(wageLimit, wageCapitalLimit);

                qbiDeduction = Math.min(potentialQBI, limitation);
                phaseOutWarning = 'W-2 wages/UBIA limitations apply above threshold';
            }
        } else {
            // Partial phase-out
            const phaseOutPercent = (taxableIncome - threshold.start) / (threshold.end - threshold.start);
            qbiDeduction = potentialQBI * (1 - phaseOutPercent);
            phaseOutWarning = `Partial phase-out: ${Math.round(phaseOutPercent * 100)}% reduction`;
        }
    }

    if (qbiDeduction > 0) {
        const currentQBI = parseFloat(form.qbiDeduction) || 0;
        const additionalQBI = qbiDeduction - currentQBI;

        if (additionalQBI > 100) {
            const marginalRate = getMarginalRate(taxableIncome);

            return {
                id: 'k1-qbi-deduction',
                name: 'K-1 Qualified Business Income Deduction',
                category: CATEGORY.SELF_EMPLOYMENT,
                potentialSavings: Math.round(additionalQBI * marginalRate),
                difficulty: DIFFICULTY.EASY,
                description: 'Claim the 20% QBI deduction on your pass-through business income.',
                details: [
                    `K-1 ordinary income: $${qualifiedIncome.toLocaleString()}`,
                    guaranteedPayments > 0 ? `Guaranteed payments (NOT QBI eligible): $${guaranteedPayments.toLocaleString()}` : null,
                    `Potential QBI deduction: $${Math.round(qbiDeduction).toLocaleString()}`,
                    `Currently claimed: $${currentQBI.toLocaleString()}`,
                    phaseOutWarning,
                ].filter(Boolean),
                benefits: [
                    'Reduces taxable income by up to 20% of qualified business income',
                    'Deduction is NOT subject to self-employment tax',
                    'Can be claimed even if taking standard deduction',
                ],
                limitations: [
                    'Guaranteed payments are NOT eligible',
                    'Investment income (interest, dividends, capital gains) is NOT eligible',
                    'SSTB income limited for high-income taxpayers',
                    'W-2 wages/UBIA limitations apply above threshold',
                ],
                authority: authority,
                timeline: 'This Return',
                formImpact: ['Form 8995 or Form 8995-A'],
            };
        }
    }

    return null;
}

/**
 * Analyze guaranteed payments optimization
 */
function analyzeGuaranteedPayments(form, guaranteedPayments, partnershipIncome) {
    if (guaranteedPayments <= 0) return null;

    const authority = formatAuthorityForDisplay('guaranteedPayments');
    const totalPartnershipIncome = guaranteedPayments + partnershipIncome;

    // If guaranteed payments are a significant portion, flag for review
    const gpPercentage = (guaranteedPayments / totalPartnershipIncome) * 100;

    if (gpPercentage > 50) {
        return {
            id: 'k1-guaranteed-payments-review',
            name: 'Review Guaranteed Payment Structure',
            category: CATEGORY.SELF_EMPLOYMENT,
            potentialSavings: 0, // Planning item
            difficulty: DIFFICULTY.HARD,
            description: 'High guaranteed payments reduce your QBI deduction. Consider restructuring.',
            details: [
                `Guaranteed payments: $${guaranteedPayments.toLocaleString()} (${gpPercentage.toFixed(0)}% of total)`,
                `Partnership income: $${partnershipIncome.toLocaleString()}`,
                'Guaranteed payments are subject to self-employment tax',
                'Guaranteed payments are NOT eligible for QBI deduction',
            ],
            strategy: [
                'Consider reducing guaranteed payments and increasing profit share',
                'Evaluate if guaranteed payments are required by partnership agreement',
                'Review with partnership tax advisor for restructuring options',
            ],
            authority: authority,
            isInformational: true,
            timeline: 'Future Tax Year',
        };
    }

    return null;
}

/**
 * Analyze S-Corp reasonable compensation
 */
function analyzeSCorpCompensation(form, sCorpIncome) {
    if (sCorpIncome <= 0) return null;

    const w2Wages = parseFloat(form.sCorpW2Wages) || parseFloat(form.totalWages) || 0;

    // Check if distributions exceed wages significantly
    const distributions = sCorpIncome; // K-1 Box 16D or similar

    if (distributions > 0 && w2Wages > 0) {
        const ratio = distributions / w2Wages;

        if (ratio > 4) { // Distributions 4x wages - potential audit risk
            return {
                id: 'k1-scorp-reasonable-comp',
                name: 'S-Corp Reasonable Compensation Review',
                category: CATEGORY.SELF_EMPLOYMENT,
                potentialSavings: 0,
                difficulty: DIFFICULTY.HARD,
                description: 'High distribution-to-salary ratio may trigger IRS scrutiny.',
                details: [
                    `S-Corp distributions: $${distributions.toLocaleString()}`,
                    `W-2 wages: $${w2Wages.toLocaleString()}`,
                    `Ratio: ${ratio.toFixed(1)}x`,
                    'IRS requires "reasonable compensation" before distributions',
                ],
                risks: [
                    'IRS may reclassify distributions as wages',
                    'Back payroll taxes, penalties, and interest',
                    'Reasonable comp based on duties, industry standards',
                ],
                authority: formatAuthorityForDisplay('sCorpElection'),
                auditRisk: 'HIGH',
                isInformational: true,
                timeline: 'Review Immediately',
            };
        }
    }

    return null;
}

/**
 * Analyze self-employment tax on K-1 income
 */
function analyzeK1SETax(form, partnershipIncome, guaranteedPayments, k1Data) {
    // General partners and LLC members may owe SE tax on K-1 income
    const isGeneralPartner = form.isGeneralPartner || k1Data.isGeneralPartner;
    const isLLCMember = form.isLLCMember || k1Data.isLLCMember;

    if (!isGeneralPartner && !isLLCMember) return null;

    const seIncome = partnershipIncome + guaranteedPayments;
    if (seIncome <= 0) return null;

    // SE tax = 15.3% on 92.35% of net SE income (up to SS wage base)
    const ssTaxableIncome = Math.min(seIncome * 0.9235, 176100);
    const additionalMedicare = Math.max(0, (seIncome * 0.9235 - 176100)) * 0.029;
    const estimatedSETax = (ssTaxableIncome * 0.153) + additionalMedicare;

    return {
        id: 'k1-se-tax-info',
        name: 'Self-Employment Tax on Partnership Income',
        category: CATEGORY.SELF_EMPLOYMENT,
        potentialSavings: 0,
        difficulty: DIFFICULTY.EASY,
        description: 'As a general partner or LLC member, your K-1 income is subject to SE tax.',
        details: [
            `SE-taxable K-1 income: $${seIncome.toLocaleString()}`,
            `Estimated SE tax: $${Math.round(estimatedSETax).toLocaleString()}`,
            `Deductible portion (50%): $${Math.round(estimatedSETax / 2).toLocaleString()}`,
        ],
        strategy: [
            'Consider S-Corp election to reduce SE tax on distributions',
            'Limited partners generally NOT subject to SE tax on distributive share',
            'Review partnership agreement for SE tax characterization',
        ],
        isInformational: true,
        timeline: 'This Return',
        formImpact: ['Schedule SE'],
    };
}

/**
 * Analyze K-1 basis tracking
 */
function analyzeK1Basis(form, k1Data) {
    // Basis tracking is critical for loss limitations
    const currentBasis = parseFloat(k1Data.basis) || parseFloat(form.k1Basis) || 0;
    const k1Loss = parseFloat(k1Data.ordinaryLoss) || 0;

    if (k1Loss > 0 && currentBasis < k1Loss) {
        return {
            id: 'k1-basis-limitation',
            name: 'K-1 Loss Limitation - Insufficient Basis',
            category: CATEGORY.SELF_EMPLOYMENT,
            potentialSavings: 0,
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Your K-1 loss may be limited by your basis in the partnership/S-Corp.',
            details: [
                `K-1 loss: $${k1Loss.toLocaleString()}`,
                `Current basis: $${currentBasis.toLocaleString()}`,
                `Suspended loss: $${Math.round(k1Loss - currentBasis).toLocaleString()}`,
            ],
            strategy: [
                'Losses exceeding basis are suspended until you have sufficient basis',
                'Consider contributing capital to increase basis',
                'For S-Corps, shareholder loans can increase basis',
                'Track basis annually to ensure proper loss deductions',
            ],
            isInformational: true,
            timeline: 'This Return',
        };
    }

    return null;
}

/**
 * Analyze Section 199A details from K-1
 */
function analyzeSection199ADetails(form, k1Data) {
    // Check for Section 199A information on K-1 (Box 20, Code Z for partnerships)
    const section199AInfo = k1Data.section199A || {};
    const w2Wages = parseFloat(section199AInfo.w2Wages) || 0;
    const ubia = parseFloat(section199AInfo.ubia) || 0;
    const sstb = section199AInfo.isSSTB;

    if (!w2Wages && !ubia && !sstb) return null;

    return {
        id: 'k1-section-199a-info',
        name: 'Section 199A Information from K-1',
        category: CATEGORY.SELF_EMPLOYMENT,
        potentialSavings: 0,
        difficulty: DIFFICULTY.EASY,
        description: 'Review Section 199A details reported on your K-1 for QBI calculation.',
        details: [
            w2Wages > 0 ? `W-2 Wages (for wage limitation): $${w2Wages.toLocaleString()}` : null,
            ubia > 0 ? `UBIA (Qualified Property): $${ubia.toLocaleString()}` : null,
            sstb !== undefined ? `SSTB Status: ${sstb ? 'Yes (limited at high income)' : 'No'}` : null,
            'This information is needed for Form 8995-A',
        ].filter(Boolean),
        formImpact: ['Form 8995-A, Schedule A'],
        isInformational: true,
        timeline: 'This Return',
    };
}

/**
 * Calculate marginal rate
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
