/**
 * Main Tax Optimizer Engine
 * Orchestrates all optimization strategies and provides recommendations
 * 
 * 2025 OBBBA Updates: Integrated Augusta Rule, K-1, AMT, and enhanced citations
 */

import { calculateTotalTax, calculateTaxWithOverrides, STANDARD_DEDUCTIONS_2025 } from '../calculations/calculateTax.js';
import { analyzeFilingStatusOptimizations } from './filingStatusOptimizer';
import { analyzeDeductionOptimizations } from './deductionOptimizer';
import { analyzeRetirementOptimizations } from './retirementOptimizer';
import { analyzeCreditsOptimizations } from './creditsOptimizer';
import { analyzeSelfEmploymentOptimizations } from './selfEmploymentOptimizer';
import { analyzeCapitalGainsOptimizations } from './capitalGainsOptimizer';
import { analyzeStateOptimizations } from './stateOptimizer';
// New optimizers added for 2025 audit
import { analyzeAugustaRuleOptimization } from './augustaRuleOptimizer';
import { analyzeK1Optimizations } from './k1Optimizer';
import { analyzeAMTOptimizations } from './amtOptimizer';

/**
 * Optimization difficulty levels
 */
export const DIFFICULTY = {
    EASY: 'easy',       // Can be done immediately on this return
    MEDIUM: 'medium',   // Requires some planning or documentation
    HARD: 'hard',       // Requires significant changes or professional help
};

/**
 * Optimization categories
 */
export const CATEGORY = {
    FILING_STATUS: 'Filing Status',
    DEDUCTIONS: 'Deductions',
    RETIREMENT: 'Retirement',
    CREDITS: 'Credits',
    SELF_EMPLOYMENT: 'Self-Employment',
    CAPITAL_GAINS: 'Capital Gains',
    STATE: 'State',
    INCOME_TIMING: 'Income Timing',
};

/**
 * Main optimization function - analyzes form and returns all recommendations
 */
export function analyzeTaxOptimizations(form) {
    const state = form.state || form.stateOfResidence || '';

    // Calculate current tax liability
    const currentTax = calculateTotalTax(form);

    // Gather all optimizations from each module
    const allOptimizations = [];

    try {
        // Filing Status Optimizations
        const filingStatusOpts = analyzeFilingStatusOptimizations(form);
        allOptimizations.push(...filingStatusOpts);
    } catch (e) {
        console.warn('Filing status optimizer error:', e);
    }

    try {
        // Deduction Optimizations
        const deductionOpts = analyzeDeductionOptimizations(form);
        allOptimizations.push(...deductionOpts);
    } catch (e) {
        console.warn('Deduction optimizer error:', e);
    }

    try {
        // Retirement Optimizations
        const retirementOpts = analyzeRetirementOptimizations(form);
        allOptimizations.push(...retirementOpts);
    } catch (e) {
        console.warn('Retirement optimizer error:', e);
    }

    try {
        // Credits Optimizations
        const creditsOpts = analyzeCreditsOptimizations(form);
        allOptimizations.push(...creditsOpts);
    } catch (e) {
        console.warn('Credits optimizer error:', e);
    }

    try {
        // Self-Employment Optimizations
        const seOpts = analyzeSelfEmploymentOptimizations(form);
        allOptimizations.push(...seOpts);
    } catch (e) {
        console.warn('Self-employment optimizer error:', e);
    }

    try {
        // Capital Gains Optimizations
        const cgOpts = analyzeCapitalGainsOptimizations(form);
        allOptimizations.push(...cgOpts);
    } catch (e) {
        console.warn('Capital gains optimizer error:', e);
    }

    try {
        // State-Specific Optimizations
        if (state) {
            const stateOpts = analyzeStateOptimizations(form, state);
            allOptimizations.push(...stateOpts);
        }
    } catch (e) {
        console.warn('State optimizer error:', e);
    }

    try {
        // Augusta Rule (§280A) - 14-day rental for business owners
        const augustaOpts = analyzeAugustaRuleOptimization(form);
        allOptimizations.push(...augustaOpts);
    } catch (e) {
        console.warn('Augusta Rule optimizer error:', e);
    }

    try {
        // K-1 Pass-Through Optimization
        const k1Opts = analyzeK1Optimizations(form);
        allOptimizations.push(...k1Opts);
    } catch (e) {
        console.warn('K-1 optimizer error:', e);
    }

    try {
        // AMT Analysis and Planning
        const amtOpts = analyzeAMTOptimizations(form);
        allOptimizations.push(...amtOpts);
    } catch (e) {
        console.warn('AMT optimizer error:', e);
    }

    // Filter to only beneficial optimizations and sort by savings
    const beneficialOptimizations = allOptimizations
        .filter(opt => opt.potentialSavings > 0)
        .sort((a, b) => b.potentialSavings - a.potentialSavings);

    // Calculate totals
    const totalPotentialSavings = beneficialOptimizations.reduce(
        (sum, opt) => sum + (opt.potentialSavings || 0),
        0
    );

    return {
        currentTax,
        optimizations: beneficialOptimizations,
        totalPotentialSavings,
        optimizedTax: Math.max(0, currentTax.finalTax - totalPotentialSavings),
        summary: generateSummary(beneficialOptimizations),
    };
}

/**
 * Generate summary of optimizations by category
 */
function generateSummary(optimizations) {
    const byCategory = {};

    optimizations.forEach(opt => {
        if (!byCategory[opt.category]) {
            byCategory[opt.category] = {
                count: 0,
                totalSavings: 0,
            };
        }
        byCategory[opt.category].count++;
        byCategory[opt.category].totalSavings += opt.potentialSavings || 0;
    });

    return {
        totalCount: optimizations.length,
        byCategory,
        topRecommendation: optimizations[0] || null,
        easyWins: optimizations.filter(o => o.difficulty === DIFFICULTY.EASY).length,
    };
}

/**
 * Run a "what-if" scenario with selected optimizations
 */
export function runWhatIfScenario(form, selectedOptimizationIds) {
    // Get all possible optimizations
    const { optimizations } = analyzeTaxOptimizations(form);

    // Filter to selected
    const selectedOpts = optimizations.filter(opt =>
        selectedOptimizationIds.includes(opt.id)
    );

    // Build modified form based on optimizations
    let modifiedForm = { ...form };

    selectedOpts.forEach(opt => {
        if (opt.formOverrides) {
            modifiedForm = { ...modifiedForm, ...opt.formOverrides };
        }
    });

    // Calculate new tax
    const originalTax = calculateTotalTax(form);
    const newTax = calculateTotalTax(modifiedForm);

    return {
        originalTax,
        newTax,
        savings: originalTax.finalTax - newTax.finalTax,
        selectedOptimizations: selectedOpts,
    };
}

/**
 * Get optimizations filtered by category
 */
export function getOptimizationsByCategory(optimizations, category) {
    return optimizations.filter(opt => opt.category === category);
}

/**
 * Get optimizations filtered by difficulty
 */
export function getOptimizationsByDifficulty(optimizations, difficulty) {
    return optimizations.filter(opt => opt.difficulty === difficulty);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Calculate effective tax rate
 */
export function calculateEffectiveRate(tax, income) {
    if (income <= 0) return 0;
    return (tax / income) * 100;
}
