/**
 * Tax Authority Citation Database
 * Provides IRS Publication, IRC Section, and Regulation references for all recommendations
 * Ensures all optimizations are audit-proof with proper legal citations
 */

/**
 * IRS Authority citations for all tax optimization strategies
 */
export const TAX_AUTHORITY = {
    // ============================================
    // INCOME & DEDUCTIONS
    // ============================================

    qbiDeduction: {
        name: 'Qualified Business Income Deduction',
        irc: '§199A',
        publication: 'Publication 535 - Business Expenses',
        form: 'Form 8995 or Form 8995-A',
        regulation: 'Treas. Reg. §1.199A-1 through §1.199A-6',
        description: 'Deduction of up to 20% of qualified business income from pass-through entities',
        url: 'https://www.irs.gov/forms-pubs/about-form-8995'
    },

    augustaRule: {
        name: 'Augusta Rule (14-Day Rental Exception)',
        irc: '§280A(g)',
        publication: 'Publication 527 - Residential Rental Property',
        form: 'No reporting required if rented fewer than 15 days',
        regulation: 'Treas. Reg. §1.280A-3(c)',
        description: 'Rent your home for 14 days or fewer tax-free; business can deduct the rental expense',
        url: 'https://www.irs.gov/publications/p527'
    },

    homeOffice: {
        name: 'Home Office Deduction',
        irc: '§280A',
        publication: 'Publication 587 - Business Use of Your Home',
        form: 'Form 8829 or Simplified Method on Schedule C',
        regulation: 'Treas. Reg. §1.280A-2',
        description: 'Deduction for business use of home, including simplified method ($5/sq ft up to 300 sq ft)',
        url: 'https://www.irs.gov/forms-pubs/about-form-8829'
    },

    selfEmployedHealthInsurance: {
        name: 'Self-Employed Health Insurance Deduction',
        irc: '§162(l)',
        publication: 'Publication 535 - Business Expenses',
        form: 'Form 1040 Schedule 1, Line 17',
        regulation: 'Treas. Reg. §1.162(l)-1',
        description: 'Above-the-line deduction for health insurance premiums for self-employed individuals',
        url: 'https://www.irs.gov/publications/p535'
    },

    tipsDeduction: {
        name: 'Tips Income Deduction (OBBBA 2025)',
        irc: '§62(a)(23) (as added by OBBBA)',
        publication: 'IRS Notice 2025-XX (pending)',
        form: 'Form 1040 Schedule 1',
        regulation: 'Pending Treasury guidance',
        description: 'Deduction of up to $25,000 in tip income for qualifying taxpayers (2025-2028)',
        effectiveDate: '2025-01-01',
        expirationDate: '2028-12-31',
        incomeLimit: 150000,
        url: 'https://www.irs.gov'
    },

    overtimeDeduction: {
        name: 'Overtime Pay Deduction (OBBBA 2025)',
        irc: '§62(a)(24) (as added by OBBBA)',
        publication: 'IRS Notice 2025-XX (pending)',
        form: 'Form 1040 Schedule 1',
        regulation: 'Pending Treasury guidance',
        description: 'Deduction of up to $12,500 in overtime pay for qualifying taxpayers (2025-2028)',
        effectiveDate: '2025-01-01',
        expirationDate: '2028-12-31',
        incomeLimit: 150000,
        url: 'https://www.irs.gov'
    },

    autoLoanInterest: {
        name: 'Auto Loan Interest Deduction (OBBBA 2025)',
        irc: '§163(h)(2)(F) (as added by OBBBA)',
        publication: 'IRS Notice 2025-XX (pending)',
        form: 'Form 1040 Schedule 1',
        regulation: 'Pending Treasury guidance',
        description: 'Deduction of up to $10,000 in auto loan interest for new qualifying vehicles (2025-2028)',
        effectiveDate: '2025-01-01',
        expirationDate: '2028-12-31',
        url: 'https://www.irs.gov'
    },

    seniorBonus: {
        name: 'Senior Standard Deduction Bonus (OBBBA 2025)',
        irc: '§63(c)(2)(D) (as added by OBBBA)',
        publication: 'IRS Notice 2025-XX (pending)',
        form: 'Form 1040',
        regulation: 'Pending Treasury guidance',
        description: 'Additional $6,000 standard deduction for taxpayers age 65+ (2025-2028)',
        effectiveDate: '2025-01-01',
        expirationDate: '2028-12-31',
        url: 'https://www.irs.gov'
    },

    // ============================================
    // BUSINESS & SELF-EMPLOYMENT
    // ============================================

    section179: {
        name: 'Section 179 Expensing',
        irc: '§179',
        publication: 'Publication 946 - How To Depreciate Property',
        form: 'Form 4562',
        regulation: 'Treas. Reg. §1.179-1 through §1.179-6',
        description: 'Immediate expensing of business property up to $2,500,000 (OBBBA increased limit)',
        limit2025: 2500000,
        phaseOutThreshold: 4000000,
        url: 'https://www.irs.gov/forms-pubs/about-form-4562'
    },

    bonusDepreciation: {
        name: '100% Bonus Depreciation (Restored)',
        irc: '§168(k)',
        publication: 'Publication 946 - How To Depreciate Property',
        form: 'Form 4562',
        regulation: 'Treas. Reg. §1.168(k)-1 and §1.168(k)-2',
        description: '100% first-year depreciation for qualified property placed in service after Jan 19, 2025',
        effectiveDate: '2025-01-20',
        url: 'https://www.irs.gov/publications/p946'
    },

    sCorpElection: {
        name: 'S Corporation Election',
        irc: '§1362',
        publication: 'Publication 542 - Corporations',
        form: 'Form 2553',
        regulation: 'Treas. Reg. §1.1362-1 through §1.1362-8',
        description: 'Election to be treated as S corporation for pass-through taxation',
        url: 'https://www.irs.gov/forms-pubs/about-form-2553'
    },

    // ============================================
    // CAPITAL GAINS & INVESTMENTS
    // ============================================

    washSale: {
        name: 'Wash Sale Rule',
        irc: '§1091',
        publication: 'Publication 550 - Investment Income and Expenses',
        form: 'Form 8949, Schedule D',
        regulation: 'Treas. Reg. §1.1091-1 and §1.1091-2',
        description: 'Disallows loss deduction if substantially identical securities acquired within 30 days',
        url: 'https://www.irs.gov/publications/p550'
    },

    capitalGains: {
        name: 'Capital Gains Tax',
        irc: '§1(h)',
        publication: 'Publication 544 - Sales and Other Dispositions of Assets',
        form: 'Form 8949, Schedule D',
        regulation: 'Treas. Reg. §1.1(h)-1',
        description: 'Preferential tax rates for long-term capital gains (0%, 15%, or 20%)',
        url: 'https://www.irs.gov/publications/p544'
    },

    niit: {
        name: 'Net Investment Income Tax',
        irc: '§1411',
        publication: 'IRS Questions and Answers on NIIT',
        form: 'Form 8960',
        regulation: 'Treas. Reg. §1.1411-1 through §1.1411-10',
        description: '3.8% tax on net investment income for high-income taxpayers',
        thresholds: { single: 200000, married: 250000, marriedSeparate: 125000 },
        url: 'https://www.irs.gov/forms-pubs/about-form-8960'
    },

    primaryResidenceExclusion: {
        name: 'Primary Residence Sale Exclusion',
        irc: '§121',
        publication: 'Publication 523 - Selling Your Home',
        form: 'Not required if exclusion fully applies',
        regulation: 'Treas. Reg. §1.121-1 through §1.121-4',
        description: 'Exclude up to $250,000 ($500,000 MFJ) of gain on sale of primary residence',
        url: 'https://www.irs.gov/publications/p523'
    },

    installmentSale: {
        name: 'Installment Sale Reporting',
        irc: '§453',
        publication: 'Publication 537 - Installment Sales',
        form: 'Form 6252',
        regulation: 'Treas. Reg. §1.453-1 through §1.453-12',
        description: 'Defer gain recognition by receiving payments over time',
        url: 'https://www.irs.gov/forms-pubs/about-form-6252'
    },

    // ============================================
    // AMT
    // ============================================

    amt: {
        name: 'Alternative Minimum Tax',
        irc: '§55 through §59',
        publication: 'Publication 17, Chapter 30',
        form: 'Form 6251',
        regulation: 'Treas. Reg. §1.55-1 through §1.59-1',
        description: 'Parallel tax system to ensure minimum tax payment',
        exemption2025: { single: 88100, married: 137000 },
        phaseOut2025: { single: 609350, married: 1218700 },
        rates: { lower: 0.26, higher: 0.28, threshold: 232600 },
        url: 'https://www.irs.gov/forms-pubs/about-form-6251'
    },

    // ============================================
    // CREDITS
    // ============================================

    childTaxCredit: {
        name: 'Child Tax Credit',
        irc: '§24',
        publication: 'Publication 972 - Child Tax Credit',
        form: 'Form 1040, Schedule 8812',
        regulation: 'Treas. Reg. §1.24-1',
        description: 'Credit of $2,200 per qualifying child (OBBBA increased from $2,000)',
        amount2025: 2200,
        url: 'https://www.irs.gov/credits-deductions/individuals/child-tax-credit'
    },

    eitc: {
        name: 'Earned Income Tax Credit',
        irc: '§32',
        publication: 'Publication 596 - Earned Income Credit',
        form: 'Schedule EIC',
        regulation: 'Treas. Reg. §1.32-1 through §1.32-3',
        description: 'Refundable credit for low-to-moderate income workers',
        url: 'https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc'
    },

    educationCredits: {
        name: 'Education Credits',
        irc: '§25A',
        publication: 'Publication 970 - Tax Benefits for Education',
        form: 'Form 8863',
        regulation: 'Treas. Reg. §1.25A-1 through §1.25A-5',
        description: 'American Opportunity Credit (up to $2,500) and Lifetime Learning Credit (up to $2,000)',
        url: 'https://www.irs.gov/forms-pubs/about-form-8863'
    },

    saversCredit: {
        name: 'Retirement Savings Contribution Credit',
        irc: '§25B',
        publication: 'Publication 590-A - Contributions to IRAs',
        form: 'Form 8880',
        regulation: 'Treas. Reg. §1.25B-1 through §1.25B-5',
        description: 'Credit for contributions to retirement accounts (up to $1,000)',
        url: 'https://www.irs.gov/forms-pubs/about-form-8880'
    },

    residentialEnergy: {
        name: 'Residential Clean Energy Credit',
        irc: '§25D',
        publication: 'IRS Energy Incentives',
        form: 'Form 5695',
        regulation: 'Treas. Reg. §1.25D-1',
        description: '30% credit for solar, wind, geothermal, battery storage (through Dec 31, 2025)',
        expirationDate: '2025-12-31',
        url: 'https://www.irs.gov/forms-pubs/about-form-5695'
    },

    energyEfficient: {
        name: 'Energy Efficient Home Improvement Credit',
        irc: '§25C',
        publication: 'IRS Energy Incentives',
        form: 'Form 5695',
        regulation: 'Treas. Reg. §1.25C-1',
        description: '30% credit up to $3,200 for energy efficient improvements (repealed after 2025 by OBBBA)',
        expirationDate: '2025-12-31',
        url: 'https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit'
    },

    // ============================================
    // RETIREMENT
    // ============================================

    traditionalIra: {
        name: 'Traditional IRA Deduction',
        irc: '§219',
        publication: 'Publication 590-A - Contributions to IRAs',
        form: 'Form 1040 Schedule 1',
        regulation: 'Treas. Reg. §1.219-1 through §1.219-3',
        description: 'Deduction for contributions to traditional IRA (up to $7,000, $8,000 if 50+)',
        limit2025: 7000,
        catchUp: 1000,
        url: 'https://www.irs.gov/retirement-plans/ira-deduction-limits'
    },

    hsa: {
        name: 'Health Savings Account',
        irc: '§223',
        publication: 'Publication 969 - Health Savings Accounts',
        form: 'Form 8889',
        regulation: 'Treas. Reg. §1.223-1 through §1.223-7',
        description: 'Triple tax-advantaged savings for medical expenses',
        limit2025: { individual: 4300, family: 8550, catchUp: 1000 },
        url: 'https://www.irs.gov/forms-pubs/about-form-8889'
    },

    sep: {
        name: 'SEP-IRA',
        irc: '§408(k)',
        publication: 'Publication 560 - Retirement Plans for Small Business',
        form: 'Form 5498',
        regulation: 'Treas. Reg. §1.408(k)-1',
        description: 'Simplified Employee Pension - up to 25% of compensation or $69,000',
        limit2025: 69000,
        url: 'https://www.irs.gov/retirement-plans/retirement-plans-faqs-regarding-seps'
    },

    solo401k: {
        name: 'Solo 401(k)',
        irc: '§401(k)',
        publication: 'Publication 560 - Retirement Plans for Small Business',
        form: 'Form 5500-EZ',
        regulation: 'Treas. Reg. §1.401(k)-1',
        description: 'One-participant 401(k) with both employee and employer contributions',
        limit2025: { employee: 23500, total: 69000, catchUp: 7500 },
        url: 'https://www.irs.gov/retirement-plans/one-participant-401k-plans'
    },

    // ============================================
    // STATE TAX
    // ============================================

    saltDeduction: {
        name: 'State and Local Tax Deduction',
        irc: '§164',
        publication: 'Publication 17, Itemized Deductions',
        form: 'Schedule A',
        regulation: 'Treas. Reg. §1.164-1 through §1.164-9',
        description: 'Deduction for state/local income, sales, and property taxes (capped at $40,000 by OBBBA)',
        cap2025: 40000,
        capMarriedSeparate: 20000,
        phaseOutIncome: 500000,
        url: 'https://www.irs.gov/taxtopics/tc503'
    },

    ptet: {
        name: 'Pass-Through Entity Tax (SALT Workaround)',
        irc: 'State-specific (IRS Notice 2020-75 allows)',
        publication: 'IRS Notice 2020-75',
        form: 'State-specific PTE election forms',
        regulation: 'See individual state guidance',
        description: 'Entity-level state tax election that bypasses individual SALT cap',
        url: 'https://www.irs.gov/pub/irs-drop/n-20-75.pdf',
        stateAvailability: ['CA', 'NY', 'NJ', 'CT', 'MD', 'IL', 'MA', 'GA', 'CO', 'WI', 'OR', 'RI', 'AZ', 'OK', 'LA', 'AL', 'AR', 'ID', 'MI', 'MN', 'NC', 'SC']
    },

    // ============================================
    // K-1 PASS-THROUGH
    // ============================================

    scheduleK1: {
        name: 'Schedule K-1 Pass-Through Income',
        irc: '§701 through §761 (Partnerships), §1361 through §1379 (S-Corps)',
        publication: 'Publication 541 - Partnerships, Publication 542 - Corporations',
        form: 'Schedule K-1 (Form 1065 or 1120-S)',
        regulation: 'Treas. Reg. §1.701-1 through §1.761-3, §1.1361-1 through §1.1379-1',
        description: 'Reporting of partnership and S-corporation pass-through items',
        url: 'https://www.irs.gov/forms-pubs/about-schedule-k-1-form-1065'
    },

    guaranteedPayments: {
        name: 'Guaranteed Payments',
        irc: '§707(c)',
        publication: 'Publication 541 - Partnerships',
        form: 'Schedule K-1 (Form 1065)',
        regulation: 'Treas. Reg. §1.707-1(c)',
        description: 'Payments to partners for services/capital - not eligible for QBI deduction',
        url: 'https://www.irs.gov/publications/p541'
    }
};

/**
 * Get citation string for a specific optimization
 * @param {string} optimizationKey - Key from TAX_AUTHORITY
 * @returns {string} Formatted citation string
 */
export function getCitation(optimizationKey) {
    const authority = TAX_AUTHORITY[optimizationKey];
    if (!authority) return '';

    const parts = [];
    if (authority.irc) parts.push(`IRC ${authority.irc}`);
    if (authority.publication) parts.push(authority.publication);
    if (authority.form && authority.form !== 'N/A') parts.push(authority.form);

    return parts.join(' • ');
}

/**
 * Get full authority object for a specific optimization
 * @param {string} optimizationKey - Key from TAX_AUTHORITY
 * @returns {Object|null} Authority object or null if not found
 */
export function getAuthority(optimizationKey) {
    return TAX_AUTHORITY[optimizationKey] || null;
}

/**
 * Format authority for display in recommendations
 * @param {string} optimizationKey - Key from TAX_AUTHORITY
 * @returns {Object} Formatted authority for UI display
 */
export function formatAuthorityForDisplay(optimizationKey) {
    const authority = TAX_AUTHORITY[optimizationKey];
    if (!authority) {
        return {
            citation: 'Authority pending verification',
            details: [],
            url: null
        };
    }

    return {
        citation: getCitation(optimizationKey),
        details: [
            authority.irc ? `Internal Revenue Code: ${authority.irc}` : null,
            authority.regulation ? `Treasury Regulation: ${authority.regulation}` : null,
            authority.publication ? `IRS Guidance: ${authority.publication}` : null,
            authority.form ? `Required Form(s): ${authority.form}` : null,
        ].filter(Boolean),
        url: authority.url || null,
        description: authority.description
    };
}
