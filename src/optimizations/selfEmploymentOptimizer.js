/**
 * Self-Employment Optimizer
 * Analyzes QBI deduction, S-Corp election, home office, and SE tax strategies
 */

import { calculateTotalTax, calculateSelfEmploymentTax } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';

// 2025 Self-Employment Limits
const SE_LIMITS_2025 = {
    section179: 1220000,
    bonusDepreciation: 1.0, // 100% restored in 2025
    homeOfficeSafeHarbor: 1500, // $5/sq ft, max 300 sq ft
    mileageRate: 0.70, // $0.70/mile for 2025
};

/**
 * Analyze all self-employment optimization opportunities
 */
export function analyzeSelfEmploymentOptimizations(form) {
    if (!form.hasScheduleC) return [];

    const optimizations = [];
    const scheduleC = form.scheduleC || {};

    // Handle both PDF-extracted netProfit and manually entered grossReceipts/expenses
    let netProfit = 0;
    if (scheduleC.netProfit !== undefined && scheduleC.netProfit !== 0) {
        netProfit = parseFloat(scheduleC.netProfit) || 0;
    } else {
        const grossReceipts = parseFloat(scheduleC.grossReceipts) || 0;
        const expenses = parseFloat(scheduleC.expenses) || 0;
        netProfit = grossReceipts - expenses;
    }

    if (netProfit <= 0) return [];

    // QBI Deduction (20%)
    const qbiOpt = analyzeQBIDeduction(form, netProfit);
    if (qbiOpt) {
        optimizations.push(qbiOpt);
    }

    // S-Corp Election Analysis
    const sCorpOpt = analyzeSCorpElection(form, netProfit);
    if (sCorpOpt) {
        optimizations.push(sCorpOpt);
    }

    // Home Office Deduction
    const homeOfficeOpt = analyzeHomeOffice(form, netProfit);
    if (homeOfficeOpt) {
        optimizations.push(homeOfficeOpt);
    }

    // Self-Employed Health Insurance
    const healthInsOpt = analyzeSEHealthInsurance(form);
    if (healthInsOpt) {
        optimizations.push(healthInsOpt);
    }

    // Business Vehicle Deduction
    const vehicleOpt = analyzeBusinessVehicle(form);
    if (vehicleOpt) {
        optimizations.push(vehicleOpt);
    }

    // Section 179 / Bonus Depreciation
    const depreciationOpt = analyzeDepreciation(form);
    if (depreciationOpt) {
        optimizations.push(depreciationOpt);
    }

    // SE Tax Deduction check
    const seTaxOpt = analyzeSETaxDeduction(form, netProfit);
    if (seTaxOpt) {
        optimizations.push(seTaxOpt);
    }

    return optimizations;
}

/**
 * Analyze QBI (Qualified Business Income) Deduction
 */
function analyzeQBIDeduction(form, netProfit) {
    const currentTax = calculateTotalTax(form);
    const taxableIncome = currentTax.taxableIncome;
    const filingStatus = form.filingStatus || 'single';

    // QBI is generally 20% of qualified business income
    // Limited to lesser of: 20% of QBI or 20% of (taxable income - net cap gains)
    const potentialQBI = netProfit * 0.20;

    // Phase-out thresholds for 2025
    const thresholds = {
        single: { start: 191950, end: 241950 },
        married: { start: 383900, end: 483900 },
    };

    const threshold = filingStatus === 'married'
        ? thresholds.married
        : thresholds.single;

    let qbiDeduction = potentialQBI;

    // Check if QBI is being claimed
    const currentQBI = parseFloat(form.qbiDeduction) || 0;

    if (currentQBI < qbiDeduction && taxableIncome < threshold.end) {
        // Check if limited by taxable income
        const taxableIncomeLimit = (taxableIncome - (currentTax.totalQualifiedIncome || 0)) * 0.20;
        qbiDeduction = Math.min(qbiDeduction, taxableIncomeLimit);

        const additionalQBI = qbiDeduction - currentQBI;

        if (additionalQBI > 0) {
            const savings = additionalQBI * getMarginalRate(form);

            return {
                id: 'se-qbi-deduction',
                name: 'Claim Qualified Business Income (QBI) Deduction',
                category: CATEGORY.SELF_EMPLOYMENT,
                potentialSavings: Math.round(savings),
                difficulty: DIFFICULTY.EASY,
                description: 'Deduct up to 20% of your qualified business income.',
                details: [
                    `Net business income: $${netProfit.toLocaleString()}`,
                    `Potential QBI deduction: $${qbiDeduction.toLocaleString()}`,
                    `Currently claimed: $${currentQBI.toLocaleString()}`,
                    taxableIncome > threshold.start
                        ? `Note: Phase-out may apply (income > $${threshold.start.toLocaleString()})`
                        : '',
                ].filter(Boolean),
                benefits: [
                    'Reduces taxable income by up to 20% of business income',
                    'Available for pass-through businesses (sole prop, S-corp, partnership)',
                    'Not subject to self-employment tax',
                ],
                limitations: [
                    'Cannot exceed 20% of taxable income (minus cap gains)',
                    'Some specified service trades subject to limitations',
                    'W-2 wage/capital limitations apply at higher incomes',
                ],
                timeline: 'This Return',
            };
        }
    }

    return null;
}

/**
 * Analyze S-Corp election opportunity
 */
function analyzeSCorpElection(form, netProfit) {
    // S-Corp typically makes sense when net profit > $50,000
    if (netProfit < 50000) return null;

    // Calculate current SE tax
    const { tax: currentSETax } = calculateSelfEmploymentTax(netProfit);

    // Estimate S-Corp savings
    // Reasonable salary: ~60% of profit (for calculation purposes)
    const reasonableSalary = netProfit * 0.60;
    const distribution = netProfit - reasonableSalary;

    // S-Corp: SE tax only on salary, not distribution
    // Employee portion: 7.65% (SS + Medicare) on salary
    // Employer portion: 7.65% on salary (but employer portion is deductible)
    const sCorpEmployeeTax = Math.min(reasonableSalary, 176100) * 0.0765 + reasonableSalary * 0.0145;
    const sCorpEmployerTax = Math.min(reasonableSalary, 176100) * 0.0765 + reasonableSalary * 0.0145;

    // Total S-Corp payroll tax (employee pays employee portion, company pays employer portion)
    // But we're comparing to SE tax which is both portions paid by individual
    const sCorpTotalPayrollTax = sCorpEmployeeTax + sCorpEmployerTax;

    const savings = currentSETax - sCorpTotalPayrollTax;

    if (savings > 1000) {
        return {
            id: 'se-scorp-election',
            name: 'Consider S-Corporation Election',
            category: CATEGORY.SELF_EMPLOYMENT,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.HARD,
            description: 'An S-Corp election could reduce your self-employment taxes significantly.',
            details: [
                `Net business profit: $${netProfit.toLocaleString()}`,
                `Current SE tax: $${currentSETax.toLocaleString()}`,
                `Reasonable salary (60%): $${reasonableSalary.toLocaleString()}`,
                `Distributions (not subject to SE tax): $${distribution.toLocaleString()}`,
                `Estimated payroll tax as S-Corp: $${sCorpTotalPayrollTax.toLocaleString()}`,
            ],
            benefits: [
                'Distributions not subject to self-employment tax',
                'Can still claim QBI deduction',
                'Professional appearance and liability protection',
            ],
            considerations: [
                'Must pay yourself a "reasonable salary"',
                'Requires payroll processing and quarterly filings',
                'Additional administrative costs ($500-2000/year)',
                'State registration and compliance requirements',
                'Consult with CPA before making election',
            ],
            timeline: 'Future Tax Year (requires advance planning)',
        };
    }

    return null;
}

/**
 * Analyze Home Office Deduction
 */
function analyzeHomeOffice(form, netProfit) {
    const currentHomeOffice = parseFloat(form.homeOfficeDeduction) || 0;

    // Check if they work from home
    const worksFromHome = form.worksFromHome || form.hasHomeOffice;

    if (!worksFromHome) {
        return {
            id: 'se-home-office-prompt',
            name: 'Do You Have a Home Office?',
            category: CATEGORY.SELF_EMPLOYMENT,
            potentialSavings: Math.round(SE_LIMITS_2025.homeOfficeSafeHarbor * getMarginalRate(form)),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'If you use part of your home regularly and exclusively for business, you may qualify.',
            details: [
                'Simplified method: $5 per square foot (up to 300 sq ft)',
                `Maximum simplified deduction: $${SE_LIMITS_2025.homeOfficeSafeHarbor}`,
                'Regular method: Actual expenses prorated by space used',
            ],
            requirements: [
                'Space must be used regularly and exclusively for business',
                'Must be your principal place of business',
                'Employees cannot claim (W-2 workers)',
            ],
            isQuestion: true,
            timeline: 'This Return',
        };
    }

    if (worksFromHome && currentHomeOffice === 0) {
        const estimatedDeduction = SE_LIMITS_2025.homeOfficeSafeHarbor;
        const savings = estimatedDeduction * getMarginalRate(form);

        return {
            id: 'se-home-office',
            name: 'Claim Home Office Deduction',
            category: CATEGORY.SELF_EMPLOYMENT,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Deduct expenses for the business use of your home.',
            details: [
                'Simplified method: $5 per square foot (up to 300 sq ft)',
                `Maximum simplified deduction: $${SE_LIMITS_2025.homeOfficeSafeHarbor}`,
                'Alternative: Calculate actual expenses (may be higher)',
            ],
            actualExpensesInclude: [
                'Mortgage interest or rent (prorated)',
                'Utilities (prorated)',
                'Insurance, repairs, depreciation',
            ],
            timeline: 'This Return',
        };
    }

    return null;
}

/**
 * Analyze Self-Employed Health Insurance Deduction
 */
function analyzeSEHealthInsurance(form) {
    const currentDeduction = parseFloat(form.selfEmployedHealthInsurance) || 0;
    const healthInsurancePremiums = parseFloat(form.healthInsurancePremiums) || 0;

    if (healthInsurancePremiums > 0 && currentDeduction === 0) {
        const savings = healthInsurancePremiums * getMarginalRate(form);

        return {
            id: 'se-health-insurance',
            name: 'Deduct Self-Employed Health Insurance',
            category: CATEGORY.SELF_EMPLOYMENT,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.EASY,
            description: 'Health, dental, and long-term care premiums are deductible above-the-line.',
            details: [
                `Health insurance premiums: $${healthInsurancePremiums.toLocaleString()}`,
                'Reduces AGI (better than itemized deduction)',
                'Includes coverage for yourself, spouse, and dependents',
            ],
            requirements: [
                'Must have net self-employment income',
                'Cannot be eligible for employer-sponsored health plan',
                'Deduction limited to net self-employment income',
            ],
            timeline: 'This Return',
        };
    }

    return null;
}

/**
 * Analyze Business Vehicle Deduction
 */
function analyzeBusinessVehicle(form) {
    const businessMiles = parseFloat(form.businessMiles) || 0;
    const actualVehicleExpenses = parseFloat(form.actualVehicleExpenses) || 0;

    if (businessMiles > 0 || actualVehicleExpenses > 0) {
        const mileageDeduction = businessMiles * SE_LIMITS_2025.mileageRate;

        // Compare methods
        if (businessMiles > 0 && actualVehicleExpenses > 0) {
            const betterMethod = mileageDeduction > actualVehicleExpenses ? 'mileage' : 'actual';
            const betterAmount = Math.max(mileageDeduction, actualVehicleExpenses);
            const savings = betterAmount * getMarginalRate(form);

            return {
                id: 'se-vehicle-comparison',
                name: 'Optimize Vehicle Expense Method',
                category: CATEGORY.SELF_EMPLOYMENT,
                potentialSavings: Math.round(Math.abs(mileageDeduction - actualVehicleExpenses) * getMarginalRate(form)),
                difficulty: DIFFICULTY.MEDIUM,
                description: `The ${betterMethod} method provides a higher deduction for you.`,
                details: [
                    `Business miles: ${businessMiles.toLocaleString()}`,
                    `Mileage rate (2025): $${SE_LIMITS_2025.mileageRate}/mile`,
                    `Mileage deduction: $${mileageDeduction.toLocaleString()}`,
                    `Actual expenses: $${actualVehicleExpenses.toLocaleString()}`,
                    `Better method: ${betterMethod} ($${betterAmount.toLocaleString()})`,
                ],
                timeline: 'This Return',
            };
        }

        // Just report mileage deduction if that's all we have
        if (businessMiles > 0) {
            const savings = mileageDeduction * getMarginalRate(form);

            return {
                id: 'se-vehicle-mileage',
                name: 'Business Mileage Deduction',
                category: CATEGORY.SELF_EMPLOYMENT,
                potentialSavings: Math.round(savings),
                difficulty: DIFFICULTY.EASY,
                description: 'Deduct business-related vehicle expenses using standard mileage.',
                details: [
                    `Business miles: ${businessMiles.toLocaleString()}`,
                    `2025 rate: $${SE_LIMITS_2025.mileageRate}/mile`,
                    `Deduction: $${mileageDeduction.toLocaleString()}`,
                    'Keep a mileage log for documentation',
                ],
                timeline: 'This Return',
            };
        }
    }

    return null;
}

/**
 * Analyze Section 179 / Bonus Depreciation
 */
function analyzeDepreciation(form) {
    const equipmentPurchases = parseFloat(form.equipmentPurchases) || 0;

    if (equipmentPurchases > 0) {
        // 100% bonus depreciation restored for 2025
        const immediateDeduction = equipmentPurchases;
        const savings = immediateDeduction * getMarginalRate(form);

        return {
            id: 'se-depreciation',
            name: '100% Bonus Depreciation (Restored 2025)',
            category: CATEGORY.SELF_EMPLOYMENT,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Immediately expense business equipment purchases with restored 100% bonus depreciation.',
            details: [
                `Equipment purchases: $${equipmentPurchases.toLocaleString()}`,
                `Section 179 limit (2025): $${SE_LIMITS_2025.section179.toLocaleString()}`,
                '100% bonus depreciation restored by OBBBA',
                'Deduct full cost in year of purchase',
            ],
            qualifyingProperty: [
                'Computers and software',
                'Office furniture and equipment',
                'Vehicles (with limitations)',
                'Manufacturing equipment',
            ],
            timeline: 'This Return',
        };
    }

    return null;
}

/**
 * Analyze SE Tax Deduction check
 */
function analyzeSETaxDeduction(form, netProfit) {
    const { tax: seTax, deduction: seDeduction } = calculateSelfEmploymentTax(netProfit);

    const currentDeduction = parseFloat(form.selfEmploymentTaxDeduction) || 0;

    if (seDeduction > 0 && currentDeduction < seDeduction) {
        const additionalDeduction = seDeduction - currentDeduction;
        const savings = additionalDeduction * getMarginalRate(form);

        return {
            id: 'se-tax-deduction',
            name: 'Claim SE Tax Deduction (50%)',
            category: CATEGORY.SELF_EMPLOYMENT,
            potentialSavings: Math.round(savings),
            difficulty: DIFFICULTY.EASY,
            description: 'Deduct 50% of self-employment tax above-the-line.',
            details: [
                `Self-employment tax: $${seTax.toLocaleString()}`,
                `Deductible portion (50%): $${seDeduction.toLocaleString()}`,
                `Currently claimed: $${currentDeduction.toLocaleString()}`,
                'This is an automatic deduction on Schedule SE',
            ],
            timeline: 'This Return',
        };
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
