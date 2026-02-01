/**
 * Capital Gains Optimizer
 * Analyzes tax-loss harvesting, 0% bracket harvesting, NIIT planning, and more
 */

import { calculateTotalTax, calculateCapitalGainsTax, CAPITAL_GAINS_BRACKETS_2025 } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';

// 2025 Capital Gains Thresholds
const CG_THRESHOLDS_2025 = {
    zeroPercent: {
        single: 48350,
        married: 96700,
        marriedSeparate: 48350,
        head: 64750,
    },
    niit: {
        single: 200000,
        married: 250000,
        marriedSeparate: 125000,
        head: 200000,
    },
    primaryResidence: {
        single: 250000,
        married: 500000,
    },
};

/**
 * Analyze all capital gains optimization opportunities
 */
export function analyzeCapitalGainsOptimizations(form) {
    const optimizations = [];

    // Tax-Loss Harvesting
    const lossHarvestOpt = analyzeTaxLossHarvesting(form);
    if (lossHarvestOpt) {
        optimizations.push(lossHarvestOpt);
    }

    // Tax-Gain Harvesting (0% bracket)
    const gainHarvestOpt = analyzeTaxGainHarvesting(form);
    if (gainHarvestOpt) {
        optimizations.push(gainHarvestOpt);
    }

    // Long-Term vs Short-Term
    const holdingPeriodOpt = analyzeHoldingPeriod(form);
    if (holdingPeriodOpt) {
        optimizations.push(holdingPeriodOpt);
    }

    // NIIT Planning
    const niitOpt = analyzeNIITPlanning(form);
    if (niitOpt) {
        optimizations.push(niitOpt);
    }

    // Primary Residence Exclusion
    const residenceOpt = analyzePrimaryResidenceExclusion(form);
    if (residenceOpt) {
        optimizations.push(residenceOpt);
    }

    // Qualified Dividend Optimization
    const dividendOpt = analyzeQualifiedDividends(form);
    if (dividendOpt) {
        optimizations.push(dividendOpt);
    }

    // Installment Sale consideration
    const installmentOpt = analyzeInstallmentSale(form);
    if (installmentOpt) {
        optimizations.push(installmentOpt);
    }

    // Wash Sale Detection
    const washSaleOpt = analyzeWashSaleRisk(form);
    if (washSaleOpt) {
        optimizations.push(washSaleOpt);
    }

    return optimizations;
}

/**
 * Analyze Tax-Loss Harvesting opportunity
 */
function analyzeTaxLossHarvesting(form) {
    // Check if they have capital gains to offset
    const longTermGain = form.hasScheduleD ? (parseFloat(form.scheduleD?.longTermGain) || 0) : 0;
    const shortTermGain = form.hasScheduleD ? (parseFloat(form.scheduleD?.shortTermGain) || 0) : 0;
    const totalGains = longTermGain + shortTermGain;

    const longTermLoss = form.hasScheduleD ? (parseFloat(form.scheduleD?.longTermLoss) || 0) : 0;
    const shortTermLoss = form.hasScheduleD ? (parseFloat(form.scheduleD?.shortTermLoss) || 0) : 0;
    const totalLosses = longTermLoss + shortTermLoss;

    // Net capital position
    const netCapitalGain = totalGains - totalLosses;

    if (netCapitalGain > 0) {
        // They have gains that could be offset
        const taxOnGains = longTermGain > 0
            ? longTermGain * 0.15 + shortTermGain * getMarginalRate(form) // Rough estimate
            : shortTermGain * getMarginalRate(form);

        return {
            id: 'cg-tax-loss-harvesting',
            name: 'Consider Tax-Loss Harvesting',
            category: CATEGORY.CAPITAL_GAINS,
            potentialSavings: Math.round(Math.min(totalGains, 3000) * getMarginalRate(form)),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Sell investments at a loss to offset your capital gains.',
            details: [
                `Your net capital gains: $${netCapitalGain.toLocaleString()}`,
                `Long-term gains: $${longTermGain.toLocaleString()}`,
                `Short-term gains: $${shortTermGain.toLocaleString()}`,
                'Review portfolio for loss positions to harvest',
            ],
            rules: [
                'Losses first offset gains of the same type (ST vs LT)',
                'Excess losses offset gains of the other type',
                'Up to $3,000 of net losses can offset ordinary income',
                'Remaining losses carry forward to future years',
                'Beware wash sale rule: 30 days before/after',
            ],
            timeline: 'Before Dec 31',
        };
    }

    // Even without gains, can harvest $3,000 deduction
    if (totalGains === 0 && form.hasInvestments !== false) {
        return {
            id: 'cg-tax-loss-3000',
            name: 'Harvest Losses for $3,000 Deduction',
            category: CATEGORY.CAPITAL_GAINS,
            potentialSavings: Math.round(3000 * getMarginalRate(form)),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Harvest investment losses to deduct up to $3,000 against ordinary income.',
            details: [
                'Even without capital gains, you can deduct losses',
                'Maximum $3,000 per year ($1,500 if MFS)',
                'Excess carries forward indefinitely',
                'Reduces AGI and taxable income',
            ],
            timeline: 'Before Dec 31',
        };
    }

    return null;
}

/**
 * Analyze Tax-Gain Harvesting (0% bracket opportunity)
 */
function analyzeTaxGainHarvesting(form) {
    const currentTax = calculateTotalTax(form);
    const taxableIncome = currentTax.taxableIncome;
    const filingStatus = form.filingStatus || 'single';

    const zeroPercentLimit = CG_THRESHOLDS_2025.zeroPercent[filingStatus] || CG_THRESHOLDS_2025.zeroPercent.single;

    // Check if they have room in 0% bracket
    const roomInZeroBracket = zeroPercentLimit - taxableIncome;

    if (roomInZeroBracket > 1000) {
        return {
            id: 'cg-tax-gain-harvesting',
            name: 'Harvest Capital Gains at 0% Rate',
            category: CATEGORY.CAPITAL_GAINS,
            potentialSavings: 0, // Future tax savings, not immediate
            difficulty: DIFFICULTY.MEDIUM,
            description: `You have room to realize up to $${roomInZeroBracket.toLocaleString()} in long-term gains at 0% tax.`,
            details: [
                `Current taxable income: $${taxableIncome.toLocaleString()}`,
                `0% LTCG bracket limit: $${zeroPercentLimit.toLocaleString()}`,
                `Room in 0% bracket: $${roomInZeroBracket.toLocaleString()}`,
            ],
            strategy: [
                'Sell appreciated investments to realize gains',
                'Immediately rebuy to reset cost basis',
                'Gains are taxed at 0% (in 0% bracket)',
                'Higher cost basis = lower future taxes',
                'No wash sale rule for gains!',
            ],
            benefits: [
                'Lock in 0% tax rate on gains',
                'Reset cost basis higher',
                'Reduce future tax liability',
            ],
            isLongTerm: true,
            timeline: 'Before Dec 31',
        };
    }

    return null;
}

/**
 * Analyze holding period optimization
 */
function analyzeHoldingPeriod(form) {
    const shortTermGain = form.hasScheduleD ? (parseFloat(form.scheduleD?.shortTermGain) || 0) : 0;

    if (shortTermGain > 1000) {
        const ordinaryRate = getMarginalRate(form);
        const ltcgRate = 0.15; // Assume 15% for most taxpayers

        const excessTax = shortTermGain * (ordinaryRate - ltcgRate);

        return {
            id: 'cg-holding-period',
            name: 'Short-Term Gains Taxed at Higher Rate',
            category: CATEGORY.CAPITAL_GAINS,
            potentialSavings: 0, // Informational
            difficulty: DIFFICULTY.EASY,
            description: 'Your short-term gains are taxed as ordinary income (higher rates).',
            details: [
                `Short-term gains: $${shortTermGain.toLocaleString()}`,
                `Your marginal rate: ${(ordinaryRate * 100).toFixed(0)}%`,
                `Long-term rate would be: ${(ltcgRate * 100).toFixed(0)}%`,
                `Extra tax due to short-term: ~$${excessTax.toLocaleString()}`,
            ],
            recommendation: [
                'Hold investments over 1 year for long-term rates',
                '0%, 15%, or 20% rates vs ordinary income rates',
                'Plan sales around holding period',
            ],
            isInformational: true,
            timeline: 'Future Planning',
        };
    }

    return null;
}

/**
 * Analyze NIIT (Net Investment Income Tax) Planning
 */
function analyzeNIITPlanning(form) {
    const currentTax = calculateTotalTax(form);
    const agi = currentTax.agi;
    const filingStatus = form.filingStatus || 'single';

    const niitThreshold = CG_THRESHOLDS_2025.niit[filingStatus] || CG_THRESHOLDS_2025.niit.single;

    // Calculate investment income
    let scheduleEIncome = 0;
    if (form.hasScheduleE && form.scheduleE) {
        if (form.scheduleE.netIncome !== undefined) {
            scheduleEIncome = parseFloat(form.scheduleE.netIncome) || 0;
        } else {
            scheduleEIncome = (parseFloat(form.scheduleE.rentalIncome) || 0) -
                (parseFloat(form.scheduleE.rentalExpenses) || 0);
        }
    }

    const investmentIncome =
        (parseFloat(form.taxableInterest) || 0) +
        (parseFloat(form.ordinaryDividends) || 0) +
        (parseFloat(form.capitalGainLoss) || 0) +
        scheduleEIncome;

    // Check if subject to NIIT
    if (agi > niitThreshold && investmentIncome > 0) {
        const excessAGI = agi - niitThreshold;
        const niitBase = Math.min(excessAGI, investmentIncome);
        const niitTax = niitBase * 0.038;

        return {
            id: 'cg-niit',
            name: 'Net Investment Income Tax (NIIT) Applies',
            category: CATEGORY.CAPITAL_GAINS,
            potentialSavings: 0, // Informational
            difficulty: DIFFICULTY.HARD,
            description: 'You are subject to the 3.8% NIIT on investment income.',
            details: [
                `AGI: $${agi.toLocaleString()}`,
                `NIIT threshold: $${niitThreshold.toLocaleString()}`,
                `Excess AGI: $${excessAGI.toLocaleString()}`,
                `Investment income: $${investmentIncome.toLocaleString()}`,
                `Estimated NIIT: $${niitTax.toLocaleString()}`,
            ],
            strategies: [
                'Time income to stay below threshold in some years',
                'Maximize retirement contributions to lower AGI',
                'Invest in qualified small business stock (excluded)',
                'Consider tax-exempt municipal bonds',
                'Harvest losses to reduce investment income',
            ],
            isInformational: true,
            timeline: 'Tax Planning',
        };
    }

    // Close to threshold warning
    if (agi > niitThreshold * 0.9 && agi < niitThreshold && investmentIncome > 5000) {
        return {
            id: 'cg-niit-warning',
            name: 'Approaching NIIT Threshold',
            category: CATEGORY.CAPITAL_GAINS,
            potentialSavings: Math.round(investmentIncome * 0.038),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'You are close to the NIIT threshold. Plan to avoid 3.8% additional tax.',
            details: [
                `AGI: $${agi.toLocaleString()}`,
                `NIIT threshold: $${niitThreshold.toLocaleString()}`,
                `Buffer remaining: $${(niitThreshold - agi).toLocaleString()}`,
                'Additional income could trigger 3.8% tax on investments',
            ],
            strategies: [
                'Maximize 401(k)/IRA contributions',
                'Time capital gains realization carefully',
                'Consider charitable contributions',
            ],
            timeline: 'Before Dec 31',
        };
    }

    return null;
}

/**
 * Analyze Primary Residence Exclusion
 */
function analyzePrimaryResidenceExclusion(form) {
    const homeGain = parseFloat(form.homeSaleGain) || 0;

    if (homeGain > 0) {
        const filingStatus = form.filingStatus || 'single';
        const exclusion = filingStatus === 'married'
            ? CG_THRESHOLDS_2025.primaryResidence.married
            : CG_THRESHOLDS_2025.primaryResidence.single;

        if (homeGain <= exclusion) {
            return {
                id: 'cg-home-exclusion',
                name: 'Primary Residence Exclusion Applies',
                category: CATEGORY.CAPITAL_GAINS,
                potentialSavings: Math.round(homeGain * 0.15), // Estimate avoided tax
                difficulty: DIFFICULTY.EASY,
                description: `Your home sale gain of $${homeGain.toLocaleString()} may be fully excluded.`,
                details: [
                    `Gain from home sale: $${homeGain.toLocaleString()}`,
                    `Exclusion available: $${exclusion.toLocaleString()}`,
                    'Requirements: Owned and lived in home 2 of last 5 years',
                ],
                requirements: [
                    'Ownership test: Owned home ≥2 years',
                    'Use test: Lived in home ≥2 years of last 5',
                    'No exclusion used in prior 2 years',
                ],
                timeline: 'This Return',
            };
        } else {
            // Partial exclusion
            const taxableGain = homeGain - exclusion;
            const estimatedTax = taxableGain * 0.15;

            return {
                id: 'cg-home-partial-exclusion',
                name: 'Partial Home Sale Exclusion',
                category: CATEGORY.CAPITAL_GAINS,
                potentialSavings: 0, // Informational
                difficulty: DIFFICULTY.MEDIUM,
                description: 'Your home gain exceeds the exclusion limit.',
                details: [
                    `Total gain: $${homeGain.toLocaleString()}`,
                    `Exclusion: $${exclusion.toLocaleString()}`,
                    `Taxable amount: $${taxableGain.toLocaleString()}`,
                    `Estimated tax: $${estimatedTax.toLocaleString()}`,
                ],
                strategies: [
                    'Check for qualifying expenses to add to cost basis',
                    'Review improvements made during ownership',
                    'Consider installment sale for large gains',
                ],
                isInformational: true,
                timeline: 'This Return',
            };
        }
    }

    return null;
}

/**
 * Analyze qualified dividend opportunity
 */
function analyzeQualifiedDividends(form) {
    const qualifiedDividends = parseFloat(form.qualifiedDividends) || 0;
    const ordinaryDividends = parseFloat(form.ordinaryDividends) || 0;

    // Check if non-qualified dividends are significant
    const nonQualified = ordinaryDividends - qualifiedDividends;

    if (nonQualified > 1000 && ordinaryDividends > 0) {
        const ratesDiff = getMarginalRate(form) - 0.15;
        const potentialSavings = nonQualified * ratesDiff;

        return {
            id: 'cg-qualified-dividends',
            name: 'Shift to Qualified Dividend Investments',
            category: CATEGORY.CAPITAL_GAINS,
            potentialSavings: Math.round(potentialSavings),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Some of your dividends are taxed at higher ordinary income rates.',
            details: [
                `Qualified dividends: $${qualifiedDividends.toLocaleString()}`,
                `Non-qualified dividends: $${nonQualified.toLocaleString()}`,
                `Qualified rate: 0%/15%/20%`,
                `Your ordinary rate: ${(getMarginalRate(form) * 100).toFixed(0)}%`,
            ],
            strategy: [
                'Hold dividend stocks > 60 days around ex-dividend date',
                'Choose stocks/funds with qualified dividends',
                'Consider tax-efficient index funds',
            ],
            isLongTerm: true,
            timeline: 'Future Investing',
        };
    }

    return null;
}

/**
 * Analyze Installment Sale consideration
 */
function analyzeInstallmentSale(form) {
    const capitalGains = form.hasScheduleD
        ? (parseFloat(form.scheduleD?.longTermGain) || 0) + (parseFloat(form.scheduleD?.shortTermGain) || 0)
        : 0;

    // Suggest installment sale for large gains
    if (capitalGains > 100000) {
        const currentTax = calculateTotalTax(form);
        const taxableIncome = currentTax.taxableIncome;

        // Check if they jumped into higher bracket
        if (taxableIncome > 250000) {
            return {
                id: 'cg-installment-sale',
                name: 'Consider Installment Sale for Large Gains',
                category: CATEGORY.CAPITAL_GAINS,
                potentialSavings: 0, // Depends on specifics
                difficulty: DIFFICULTY.HARD,
                description: 'Spread a large gain over multiple tax years to stay in lower brackets.',
                details: [
                    `Capital gains: $${capitalGains.toLocaleString()}`,
                    `Taxable income: $${taxableIncome.toLocaleString()}`,
                    'May be subject to higher rates or NIIT due to bunched income',
                ],
                strategy: [
                    'Structure sale as installment agreement',
                    'Receive payments (and recognize gain) over multiple years',
                    'May avoid higher brackets and NIIT threshold',
                    'Consult tax professional for structuring',
                ],
                considerations: [
                    'Interest income on deferred payments',
                    'Risk of buyer default',
                    'Cannot use for publicly traded property',
                ],
                timeline: 'Future Sales Planning',
            };
        }
    }

    return null;
}

/**
 * Helper: Estimate marginal rate
 */
function getMarginalRate(form) {
    const currentTax = calculateTotalTax(form);
    const taxableIncome = currentTax.taxableIncome;

    if (taxableIncome > 626350) return 0.37;
    if (taxableIncome > 250525) return 0.35;
    if (taxableIncome > 197300) return 0.32;
    if (taxableIncome > 103350) return 0.24;
    if (taxableIncome > 48475) return 0.22;
    if (taxableIncome > 11925) return 0.12;
    return 0.10;
}

/**
 * Analyze Wash Sale Risk and provide warnings
 * IRS IRC §1091 - Wash Sale Rule
 */
function analyzeWashSaleRisk(form) {
    // Check for capital losses that may trigger wash sale concerns
    const longTermLoss = form.hasScheduleD ? (parseFloat(form.scheduleD?.longTermLoss) || 0) : 0;
    const shortTermLoss = form.hasScheduleD ? (parseFloat(form.scheduleD?.shortTermLoss) || 0) : 0;
    const totalLosses = longTermLoss + shortTermLoss;

    if (totalLosses <= 0) return null;

    // Check for wash sale indicators
    const hasWashSaleAdjustment = parseFloat(form.washSaleAdjustment) || 0;
    const hasActiveTrading = form.isActiveTrader || form.tradingFrequency === 'frequent';

    // Create wash sale warning for active traders or those with losses
    if (totalLosses > 1000 || hasWashSaleAdjustment > 0) {
        const warnings = [];
        const risks = [];

        if (hasWashSaleAdjustment > 0) {
            warnings.push(`Wash sale adjustment reported: $${hasWashSaleAdjustment.toLocaleString()}`);
            warnings.push('These losses are disallowed but added to basis of replacement shares');
        }

        if (hasActiveTrading) {
            risks.push('Your trading frequency increases wash sale risk');
            risks.push('Automated trading and reinvested dividends can trigger rule');
        }

        return {
            id: 'cg-wash-sale-warning',
            name: 'Wash Sale Rule Compliance',
            category: CATEGORY.CAPITAL_GAINS,
            potentialSavings: hasWashSaleAdjustment > 0 ? 0 : Math.round(totalLosses * 0.15),
            difficulty: DIFFICULTY.MEDIUM,
            description: hasWashSaleAdjustment > 0
                ? 'You have wash sale disallowed losses. Review your trading to maximize deductible losses.'
                : 'Review your loss transactions for potential wash sale violations.',
            details: [
                `Total capital losses: $${totalLosses.toLocaleString()}`,
                `Long-term losses: $${longTermLoss.toLocaleString()}`,
                `Short-term losses: $${shortTermLoss.toLocaleString()}`,
                ...warnings,
            ],
            washSaleRule: [
                'Loss is disallowed if you buy substantially identical securities:',
                '• Within 30 days BEFORE the sale',
                '• Within 30 days AFTER the sale',
                '• In an IRA or other tax-advantaged account',
                'Disallowed loss is added to basis of replacement shares',
            ],
            avoidanceStrategies: [
                'Wait 31 days before rebuying same or similar securities',
                'Buy a different ETF in the same sector (not substantially identical)',
                'Harvest losses in taxable account, not IRA',
                'Use tax-lot selection to optimize which shares to sell',
                'Be cautious of dividend reinvestment near loss harvesting',
            ],
            risks: risks.length > 0 ? risks : undefined,
            authority: {
                citation: 'IRC §1091 • Publication 550 • Form 8949',
                details: [
                    'Internal Revenue Code: §1091',
                    'Treasury Regulation: Treas. Reg. §1.1091-1 and §1.1091-2',
                    'IRS Guidance: Publication 550 - Investment Income and Expenses',
                    'Required Form(s): Form 8949, Schedule D',
                ],
                url: 'https://www.irs.gov/publications/p550'
            },
            auditRisk: hasActiveTrading ? 'MEDIUM' : 'LOW',
            timeline: 'This Return & Trading Strategy',
            formImpact: ['Form 8949 (Code W for wash sale adjustment)', 'Schedule D'],
        };
    }

    return null;
}

