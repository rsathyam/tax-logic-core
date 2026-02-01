/**
 * Test Profiles for Tax Optimizer Edge Case Testing
 * Simulates complex taxpayer scenarios to verify optimization coverage
 */

/**
 * High Net Worth Individual with K-1s, Capital Gains, and AMT Exposure
 */
export const HIGH_NET_WORTH_PROFILE = {
    name: 'High Net Worth with K-1s',
    description: 'HNW individual with partnership income, capital gains, and AMT exposure',
    form: {
        filingStatus: 'married',
        state: 'CA',

        // W-2 Income
        totalWages: 450000,

        // Investment Income
        taxableInterest: 25000,
        taxExemptInterest: 15000,
        ordinaryDividends: 75000,
        qualifiedDividends: 60000,

        // K-1 Income (Partnership)
        hasScheduleK1: true,
        partnershipIncome: 200000,
        scheduleK1: {
            ordinaryIncome: 200000,
            guaranteedPayments: 50000,
            capitalGains: 25000,
            section199A: {
                w2Wages: 150000,
                ubia: 500000,
                isSSTB: false,
            },
        },
        isGeneralPartner: true,

        // Capital Gains
        hasScheduleD: true,
        scheduleD: {
            longTermGain: 150000,
            shortTermGain: 25000,
            longTermLoss: 10000,
        },
        capitalGainLoss: 165000,

        // Real Estate
        hasScheduleE: true,
        scheduleE: {
            rentalIncome: 100000,
            rentalExpenses: 80000,
            netIncome: 20000,
        },

        // Home ownership for Augusta Rule
        ownsHome: true,
        mortgageInterest: 25000,
        realEstateTaxes: 35000,

        // Itemized deductions
        itemizedDeductions: true,
        stateLocalTaxes: 50000, // Subject to $40k cap
        charitableContributions: 30000,

        // ISO Exercise (AMT trigger)
        isoExerciseSpread: 100000,
    },
    expectedOptimizations: [
        'k1-qbi-deduction',
        'k1-se-tax-info',
        'augusta-rule-14-day-rental',
        'amt-exposure',
        'amt-iso-trigger',
        'cg-niit',
        'state-ca-mental-health-tax',
    ],
};

/**
 * Freelancer with Schedule C and Multiple Income Streams
 */
export const FREELANCER_PROFILE = {
    name: '1099 Freelancer/Consultant',
    description: 'Self-employed consultant with home office and business vehicle',
    form: {
        filingStatus: 'single',
        state: 'NY',

        // No W-2 Income (pure freelancer)
        totalWages: 0,

        // Schedule C Business
        hasScheduleC: true,
        scheduleC: {
            grossReceipts: 175000,
            expenses: 35000,
            netProfit: 140000,
            homeOfficeExpense: 5000,
            vehicleExpense: 8000,
            depreciation: 15000,
        },

        // Home office indicators
        hasHomeOffice: true,
        homeOfficeSquareFeet: 250,
        homeSquareFeet: 2000,

        // Business vehicle
        hasBusinessVehicle: true,
        businessMiles: 12000,

        // Self-employed health insurance
        selfEmployedHealthInsurance: 8500,

        // Retirement (not maxed)
        hasSEP: false,
        retirement401k: 0,
        traditionalIra: 3000,

        // HSA
        hasHDHP: true,
        hsaContributions: 2000,

        // Small investment gains
        hasScheduleD: true,
        scheduleD: {
            longTermGain: 5000,
            shortTermLoss: 2000,
        },

        // Home ownership
        ownsHome: true,
        mortgageInterest: 12000,
        realEstateTaxes: 6000,
    },
    expectedOptimizations: [
        'se-qbi-deduction',
        'se-home-office',
        'se-sep-ira',
        'se-solo-401k',
        'se-health-insurance',
        'ret-hsa-maximize',
        'augusta-rule-14-day-rental',
    ],
};

/**
 * Real Estate Investor with Multiple Properties
 */
export const REAL_ESTATE_INVESTOR_PROFILE = {
    name: 'Real Estate Investor',
    description: 'Multiple rental properties with passive losses and depreciation',
    form: {
        filingStatus: 'married',
        state: 'TX',

        // W-2 Income
        totalWages: 200000,

        // Schedule E - Rental Properties
        hasScheduleE: true,
        scheduleE: {
            rentalIncome: 180000,
            rentalExpenses: 220000, // Higher expenses = loss
            depreciation: 75000,
            netIncome: -40000, // Net rental loss
        },

        // Real Estate Professional Status indicators
        realEstateHours: 800, // Not enough for REP status (needs 750 and more than other work)
        otherWorkHours: 1800,

        // Property sale
        homeSaleGain: 350000, // Selling investment property

        // Capital improvements tracked
        propertyImprovements: 150000,

        // Home ownership
        ownsHome: true,
        mortgageInterest: 18000,
        realEstateTaxes: 25000,

        // 1031 Exchange consideration
        considering1031: true,
    },
    expectedOptimizations: [
        'cg-home-partial-exclusion',
        'cg-installment-sale',
        'state-tx-no-income-tax',
    ],
};

/**
 * W-2 Employee with Side Business
 */
export const W2_SIDE_BUSINESS_PROFILE = {
    name: 'W-2 with Side Hustle',
    description: 'Full-time employee with growing side business',
    form: {
        filingStatus: 'married',
        state: 'CA',

        // W-2 Income (main job)
        totalWages: 180000,

        // Spouse W-2
        spouseWages: 120000,

        // Schedule C (side business)
        hasScheduleC: true,
        scheduleC: {
            grossReceipts: 50000,
            expenses: 15000,
            netProfit: 35000,
        },

        // Business considerations
        consideringSCorp: false,
        hasHomeOffice: true,
        homeOfficeSquareFeet: 150,

        // Retirement - employer 401k
        has401k: true,
        retirement401k: 15000, // Not maxed
        spouseRetirement401k: 20000,

        // Children
        dependents: [
            { name: 'Child 1', age: 8, qualifyingChild: true, ssn: 'xxx-xx-1234' },
            { name: 'Child 2', age: 5, qualifyingChild: true, ssn: 'xxx-xx-5678' },
        ],

        // Childcare
        childCareExpenses: 15000,

        // 529 Contributions
        contributions529: 10000,

        // Home
        ownsHome: true,
        mortgageInterest: 22000,
        realEstateTaxes: 12000,
    },
    expectedOptimizations: [
        'se-qbi-deduction',
        'se-solo-401k',
        'ret-401k-maximize',
        'credits-child-care',
        'state-529-deduction',
        'augusta-rule-14-day-rental',
    ],
};

/**
 * Retiree with Investment Income
 */
export const RETIREE_PROFILE = {
    name: 'Retiree with Investments',
    description: 'Retired individual with pension, Social Security, and investments',
    form: {
        filingStatus: 'married',
        state: 'FL',
        age: 68,
        spouseAge: 66,

        // No W-2
        totalWages: 0,

        // Pension
        pensionIncome: 45000,

        // Social Security
        socialSecurityBenefits: 36000,

        // Investment Income
        taxableInterest: 15000,
        taxExemptInterest: 25000,
        ordinaryDividends: 40000,
        qualifiedDividends: 35000,

        // IRA distributions
        iraDistributions: 30000,
        rothConversion: 0,

        // Capital gains
        hasScheduleD: true,
        scheduleD: {
            longTermGain: 25000,
            shortTermGain: 0,
        },
        capitalGainLoss: 25000,

        // Home (paid off)
        ownsHome: true,
        mortgageInterest: 0,
        realEstateTaxes: 8000,

        // Medical expenses (higher for retirees)
        medicalExpenses: 15000,
        agiForMedical: 150000,
    },
    expectedOptimizations: [
        'cg-tax-gain-harvesting', // May qualify for 0% bracket
        'ret-roth-conversion',
        'state-fl-no-income-tax',
    ],
};

/**
 * S-Corp Owner with Reasonable Compensation Issues
 */
export const SCORP_OWNER_PROFILE = {
    name: 'S-Corp Owner',
    description: 'S-Corp owner with distribution/salary ratio concerns',
    form: {
        filingStatus: 'single',
        state: 'CA',

        // W-2 from S-Corp (low)
        totalWages: 50000,

        // K-1 from S-Corp (high distributions)
        hasSCorp: true,
        sCorpIncome: 250000,
        sCorpW2Wages: 50000,

        // Schedule K-1
        hasScheduleK1: true,
        scheduleK1: {
            ordinaryIncome: 250000,
            section199A: {
                w2Wages: 50000,
                ubia: 100000,
                isSSTB: false,
            },
        },

        // Home
        ownsHome: true,
        mortgageInterest: 15000,
        realEstateTaxes: 10000,

        // Itemized
        itemizedDeductions: true,
        stateLocalTaxes: 35000,
        charitableContributions: 15000,
    },
    expectedOptimizations: [
        'k1-qbi-deduction',
        'k1-scorp-reasonable-comp', // Should flag distribution ratio
        'augusta-rule-14-day-rental',
        'state-ca-mental-health-tax', // Income > $1M when combined
    ],
};

/**
 * Crypto Investor with DeFi Activity
 */
export const CRYPTO_INVESTOR_PROFILE = {
    name: 'Crypto Investor with DeFi',
    description: 'Active crypto trader with staking, DeFi, and NFT activity',
    form: {
        filingStatus: 'single',
        state: 'WA',

        // W-2 Income
        totalWages: 120000,

        // Cryptocurrency
        hasCryptocurrency: true,
        cryptocurrency: {
            gains: 45000,
            losses: 15000,
            costBasisMethod: 'fifo',
            staking: 5000,
            airdrops: 2000,
            shortTermGains: 30000,
            hasNFTs: true,
            nftGains: 8000,
        },
        cryptoGains: 45000,
        cryptoLosses: 15000,
        stakingIncome: 5000,
        airdropValue: 2000,

        // Has DeFi activity
        hasDeFi: true,
    },
    expectedOptimizations: [
        'crypto-cost-basis-method',
        'crypto-tax-loss-harvesting',
        'crypto-staking-mining-income',
        'crypto-airdrop-reporting',
        'crypto-holding-period',
        'crypto-nft-taxes',
        'crypto-defi-taxes',
    ],
};

/**
 * US Expat Living Abroad
 */
export const US_EXPAT_PROFILE = {
    name: 'US Expat',
    description: 'American living and working abroad with foreign accounts',
    form: {
        filingStatus: 'married',
        state: null, // No state residence

        // Foreign earned income
        hasForeignIncome: true,
        foreignEarnedIncome: 180000,
        foreignTaxPaid: 35000,
        livesAbroad: true,
        meetsPhysicalPresence: true,
        daysOutsideUS: 340,

        // Foreign housing
        foreignHousingExpenses: 48000,

        // Foreign accounts
        hasForeignAccounts: true,
        foreignBankAccounts: true,
        maxForeignAccountValue: 150000,
        totalForeignAssets: 250000,

        // Foreign country
        foreignCountry: 'UK',

        // No US property
        ownsHome: false,
    },
    expectedOptimizations: [
        'intl-feie-eligible',
        'intl-foreign-tax-credit',
        'intl-feie-vs-ftc',
        'intl-foreign-housing',
        'intl-fbar-requirement',
        'intl-fatca-8938',
        'intl-treaty-benefits',
    ],
};

/**
 * NY Business Owner Eligible for PTET
 */
export const NY_PTET_PROFILE = {
    name: 'NY Business Owner (PTET)',
    description: 'New York S-Corp owner eligible for PTET election',
    form: {
        filingStatus: 'married',
        state: 'NY',

        // W-2 from S-Corp
        totalWages: 150000,

        // S-Corp K-1 income
        hasSCorp: true,
        hasScheduleK1: true,
        sCorpIncome: 400000,
        partnershipIncome: 0,
        scheduleK1: {
            ordinaryIncome: 400000,
        },

        // High SALT exposure
        stateLocalTaxes: 85000, // Way over $40k cap

        // Home
        ownsHome: true,
        mortgageInterest: 30000,
        realEstateTaxes: 25000,
        itemizedDeductions: true,
    },
    expectedOptimizations: [
        'ptet-ny-opportunity',
        'k1-qbi-deduction',
    ],
};

/**
 * Real Estate Professional (Qualifies)
 */
export const REP_QUALIFIED_PROFILE = {
    name: 'Qualified Real Estate Professional',
    description: 'Full-time real estate professional with rental losses',
    form: {
        filingStatus: 'married',
        state: 'NV',

        // Minimal W-2 (spouse)
        totalWages: 50000,

        // Rental properties with losses
        hasScheduleE: true,
        hasRentalIncome: true,
        scheduleE: {
            rentalIncome: 120000,
            rentalExpenses: 180000,
            depreciation: 60000,
            netIncome: -60000,
        },

        // REP qualification
        realEstateHours: 1200,
        otherWorkHours: 400,
        numberOfRentalProperties: 4,
        rentalPropertyHours: 600,

        // No suspended losses
        suspendedPassiveLosses: 0,

        // Home
        ownsHome: true,
    },
    expectedOptimizations: [
        'rep-status-qualified',
        'rep-grouping-election',
        'rep-material-participation',
    ],
};

/**
 * All test profiles for batch testing
 */
export const ALL_TEST_PROFILES = [
    HIGH_NET_WORTH_PROFILE,
    FREELANCER_PROFILE,
    REAL_ESTATE_INVESTOR_PROFILE,
    W2_SIDE_BUSINESS_PROFILE,
    RETIREE_PROFILE,
    SCORP_OWNER_PROFILE,
    CRYPTO_INVESTOR_PROFILE,
    US_EXPAT_PROFILE,
    NY_PTET_PROFILE,
    REP_QUALIFIED_PROFILE,
];

/**
 * Run all test profiles and return results
 */
export function runTestProfiles(analyzeFunction) {
    return ALL_TEST_PROFILES.map(profile => {
        try {
            const result = analyzeFunction(profile.form);
            const foundOptIds = result.optimizations.map(o => o.id);
            const expectedFound = profile.expectedOptimizations.filter(id => foundOptIds.includes(id));
            const expectedMissing = profile.expectedOptimizations.filter(id => !foundOptIds.includes(id));

            return {
                profileName: profile.name,
                success: expectedMissing.length === 0,
                totalOptimizations: result.optimizations.length,
                totalSavings: result.totalPotentialSavings,
                expectedFound: expectedFound.length,
                expectedMissing,
                unexpectedFound: foundOptIds.filter(id => !profile.expectedOptimizations.includes(id)),
            };
        } catch (error) {
            return {
                profileName: profile.name,
                success: false,
                error: error.message,
            };
        }
    });
}

