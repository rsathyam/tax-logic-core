/**
 * Crypto Tax Optimizer
 * Analyzes cryptocurrency gains/losses, cost basis methods, and reporting requirements
 * 
 * IRS Authority:
 * - IRS Notice 2014-21 (crypto as property)
 * - Rev. Rul. 2019-24 (hard forks, airdrops)
 * - Form 8949 / Schedule D
 */

import { calculateTotalTax } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';

// Cost basis methods
export const COST_BASIS_METHODS = {
    FIFO: 'fifo',           // First In, First Out (IRS default)
    LIFO: 'lifo',           // Last In, First Out
    HIFO: 'hifo',           // Highest In, First Out (tax optimal)
    SPECIFIC_ID: 'specific', // Specific Identification
};

// Crypto tax thresholds
const CRYPTO_THRESHOLDS = {
    reportingThreshold: 10000,  // Above this, broker 1099 required
    washSaleExempt: true,       // Crypto currently exempt from wash sale rule
    stakingIncome: true,        // Staking rewards are ordinary income
};

/**
 * Analyze all crypto tax optimization opportunities
 */
export function analyzeCryptoTaxOptimizations(form) {
    const optimizations = [];

    // Check for crypto holdings/transactions
    const hasCrypto = form.hasCryptocurrency || form.hasCrypto ||
        form.cryptoGains || form.cryptoLosses;

    if (!hasCrypto) return optimizations;

    // Get crypto details
    const cryptoData = form.cryptocurrency || form.crypto || {};
    const cryptoGains = parseFloat(form.cryptoGains) || parseFloat(cryptoData.gains) || 0;
    const cryptoLosses = parseFloat(form.cryptoLosses) || parseFloat(cryptoData.losses) || 0;
    const stakingIncome = parseFloat(form.stakingIncome) || parseFloat(cryptoData.staking) || 0;
    const miningIncome = parseFloat(form.miningIncome) || parseFloat(cryptoData.mining) || 0;
    const airdropValue = parseFloat(form.airdropValue) || parseFloat(cryptoData.airdrops) || 0;

    // 1. Cost Basis Method Optimization
    const costBasisOpt = analyzeCostBasisMethod(form, cryptoData, cryptoGains);
    if (costBasisOpt) optimizations.push(costBasisOpt);

    // 2. Crypto Loss Harvesting (No Wash Sale!)
    const lossHarvestOpt = analyzeCryptoLossHarvesting(form, cryptoLosses, cryptoGains);
    if (lossHarvestOpt) optimizations.push(lossHarvestOpt);

    // 3. Staking/Mining Income Classification
    const stakingOpt = analyzeStakingMiningIncome(form, stakingIncome, miningIncome);
    if (stakingOpt) optimizations.push(stakingOpt);

    // 4. Airdrop/Fork Reporting
    const airdropOpt = analyzeAirdropReporting(form, airdropValue);
    if (airdropOpt) optimizations.push(airdropOpt);

    // 5. Holding Period Optimization
    const holdingOpt = analyzeCryptoHoldingPeriod(form, cryptoData);
    if (holdingOpt) optimizations.push(holdingOpt);

    // 6. NFT Tax Considerations
    const nftOpt = analyzeNFTTaxes(form, cryptoData);
    if (nftOpt) optimizations.push(nftOpt);

    // 7. DeFi Activity
    const defiOpt = analyzeDeFiTaxes(form, cryptoData);
    if (defiOpt) optimizations.push(defiOpt);

    return optimizations;
}

/**
 * Analyze cost basis method selection
 */
function analyzeCostBasisMethod(form, cryptoData, gains) {
    if (gains <= 0) return null;

    const currentMethod = cryptoData.costBasisMethod || 'fifo';

    // HIFO generally produces lowest gains
    if (currentMethod !== COST_BASIS_METHODS.HIFO) {
        const estimatedSavings = gains * 0.10; // Rough estimate: HIFO saves ~10% on gains

        return {
            id: 'crypto-cost-basis-method',
            name: 'Optimize Crypto Cost Basis Method',
            category: CATEGORY.CAPITAL_GAINS,
            potentialSavings: Math.round(estimatedSavings * 0.15), // At 15% LTCG rate
            difficulty: DIFFICULTY.MEDIUM,
            description: 'Use HIFO (Highest In, First Out) to minimize taxable gains.',
            details: [
                `Current method: ${currentMethod.toUpperCase()}`,
                `Crypto gains: $${gains.toLocaleString()}`,
                'HIFO sells highest-cost lots first = lower gains',
                'Must use Specific Identification and document in advance',
            ],
            methods: [
                { name: 'FIFO', desc: 'First In, First Out - IRS default, often highest gains' },
                { name: 'LIFO', desc: 'Last In, First Out - may help in rising markets' },
                { name: 'HIFO', desc: 'Highest In, First Out - typically lowest gains' },
                { name: 'Specific ID', desc: 'Choose exact lots - most control' },
            ],
            requirements: [
                'Document cost basis method BEFORE each sale',
                'Keep detailed records of all purchases',
                'Use crypto tax software (CoinTracker, Koinly, TaxBit)',
                'Be consistent in your chosen method',
            ],
            authority: {
                citation: 'IRS Notice 2014-21 • Publication 550 • Form 8949',
                details: [
                    'IRS Notice 2014-21: Cryptocurrency treated as property',
                    'Treas. Reg. §1.1012-1: Specific identification requirements',
                    'Publication 550: Capital gains on property',
                ],
                url: 'https://www.irs.gov/pub/irs-drop/n-14-21.pdf'
            },
            timeline: 'Before Next Sale',
        };
    }

    return null;
}

/**
 * Analyze crypto-specific loss harvesting (NO WASH SALE RULE!)
 */
function analyzeCryptoLossHarvesting(form, losses, gains) {
    // Crypto is currently EXEMPT from wash sale rule
    // This is a major tax advantage over stocks

    if (losses <= 0) return null;

    const currentTax = calculateTotalTax(form);
    const marginalRate = getMarginalRate(currentTax.taxableIncome);

    const netPosition = gains - losses;
    const additionalLossDeduction = netPosition < 0 ? Math.min(Math.abs(netPosition), 3000) : 0;
    const taxSavings = additionalLossDeduction * marginalRate;

    return {
        id: 'crypto-tax-loss-harvesting',
        name: 'Crypto Tax-Loss Harvesting (No Wash Sale Rule!)',
        category: CATEGORY.CAPITAL_GAINS,
        potentialSavings: Math.round(taxSavings + (Math.min(gains, losses) * 0.15)),
        difficulty: DIFFICULTY.EASY,
        description: 'Harvest crypto losses and immediately rebuy - wash sale rule does NOT apply to crypto!',
        details: [
            `Crypto losses: $${losses.toLocaleString()}`,
            `Crypto gains: $${gains.toLocaleString()}`,
            'KEY ADVANTAGE: No 30-day waiting period for crypto',
            'Sell losers, immediately rebuy same crypto',
            'Resets cost basis higher for future gains',
        ],
        strategy: [
            'Identify crypto positions with unrealized losses',
            'Sell to realize the loss',
            'Immediately repurchase the same cryptocurrency',
            'Loss offsets gains; excess up to $3,000 offsets income',
            'Remaining losses carry forward indefinitely',
        ],
        benefits: [
            '✅ NO wash sale rule for cryptocurrency (yet)',
            '✅ Can rebuy immediately after selling',
            '✅ Resets cost basis to current lower price',
            '✅ Losses offset gains $ for $',
        ],
        warnings: [
            '⚠️ Congress may apply wash sale rules to crypto in future',
            '⚠️ Track all transactions carefully for basis',
            '⚠️ Some jurisdictions may have different rules',
        ],
        authority: {
            citation: 'IRS Notice 2014-21 • IRC §1091 (wash sale - stocks only)',
            details: [
                'IRS Notice 2014-21: Crypto is property, not securities',
                'IRC §1091: Wash sale applies to "stock or securities"',
                'Crypto not defined as securities = wash sale exempt',
            ],
            url: 'https://www.irs.gov/pub/irs-drop/n-14-21.pdf'
        },
        timeline: 'Before Dec 31',
    };
}

/**
 * Analyze staking and mining income
 */
function analyzeStakingMiningIncome(form, stakingIncome, miningIncome) {
    const totalCryptoIncome = stakingIncome + miningIncome;

    if (totalCryptoIncome <= 0) return null;

    const currentTax = calculateTotalTax(form);
    const marginalRate = getMarginalRate(currentTax.taxableIncome);

    return {
        id: 'crypto-staking-mining-income',
        name: 'Staking & Mining Income Reporting',
        category: CATEGORY.SELF_EMPLOYMENT,
        potentialSavings: 0, // Informational
        difficulty: DIFFICULTY.MEDIUM,
        description: 'Staking rewards and mining income are taxable as ordinary income when received.',
        details: [
            stakingIncome > 0 ? `Staking rewards: $${stakingIncome.toLocaleString()}` : null,
            miningIncome > 0 ? `Mining income: $${miningIncome.toLocaleString()}` : null,
            `Total crypto income: $${totalCryptoIncome.toLocaleString()}`,
            `Estimated tax: $${Math.round(totalCryptoIncome * marginalRate).toLocaleString()}`,
        ].filter(Boolean),
        taxTreatment: [
            'Staking rewards: Ordinary income at FMV when received',
            'Mining income: Ordinary income + potential SE tax if business',
            'Cost basis = FMV at time of receipt',
            'Future sale: Capital gain/loss from that basis',
        ],
        isMiner: miningIncome > 0,
        minerConsiderations: miningIncome > 0 ? [
            'If mining is a business: SE tax applies (15.3%)',
            'Can deduct mining expenses (electricity, equipment)',
            'Equipment may qualify for Section 179 depreciation',
            'Consider LLC or S-Corp structure for large operations',
        ] : undefined,
        authority: {
            citation: 'Rev. Rul. 2019-24 • IRS Notice 2014-21',
            details: [
                'Rev. Rul. 2019-24: Airdrops/rewards taxable at receipt',
                'IRS Notice 2014-21: Mining income is taxable',
                'Schedule C if mining is trade or business',
            ],
            url: 'https://www.irs.gov/pub/irs-drop/rr-19-24.pdf'
        },
        isInformational: true,
        timeline: 'This Return',
        formImpact: [
            'Schedule 1 (or Schedule C if business)',
            'Form 8949 / Schedule D for future sales',
        ],
    };
}

/**
 * Analyze airdrop and hard fork reporting
 */
function analyzeAirdropReporting(form, airdropValue) {
    if (airdropValue <= 0) return null;

    return {
        id: 'crypto-airdrop-reporting',
        name: 'Airdrop & Hard Fork Income Reporting',
        category: CATEGORY.INCOME_TIMING,
        potentialSavings: 0,
        difficulty: DIFFICULTY.MEDIUM,
        description: 'Airdrops and hard fork tokens are taxable income when you gain dominion and control.',
        details: [
            `Airdrop/fork value received: $${airdropValue.toLocaleString()}`,
            'Taxable at FMV when you gain control',
            'Your cost basis = FMV at time of receipt',
        ],
        taxRules: [
            'Airdrop: Taxable when you can access/sell the tokens',
            'Hard fork: Taxable when new coin is accessible',
            'Value at zero if not tradeable anywhere',
            'Document the FMV at time of receipt',
        ],
        authority: {
            citation: 'Rev. Rul. 2019-24 • IRS FAQ Q21-Q24',
            details: [
                'Rev. Rul. 2019-24: Defines airdrop taxation',
                'IRS FAQ: Hard fork taxation timing',
            ],
            url: 'https://www.irs.gov/pub/irs-drop/rr-19-24.pdf'
        },
        isInformational: true,
        timeline: 'This Return',
    };
}

/**
 * Analyze crypto holding period for long-term vs short-term
 */
function analyzeCryptoHoldingPeriod(form, cryptoData) {
    const shortTermGains = parseFloat(cryptoData.shortTermGains) || 0;

    if (shortTermGains <= 1000) return null;

    const currentTax = calculateTotalTax(form);
    const ordinaryRate = getMarginalRate(currentTax.taxableIncome);
    const ltcgRate = 0.15;
    const excessTax = shortTermGains * (ordinaryRate - ltcgRate);

    return {
        id: 'crypto-holding-period',
        name: 'Crypto Short-Term Gains Taxed Higher',
        category: CATEGORY.CAPITAL_GAINS,
        potentialSavings: 0, // Future planning
        difficulty: DIFFICULTY.EASY,
        description: 'Your short-term crypto gains are taxed at ordinary income rates (higher).',
        details: [
            `Short-term crypto gains: $${shortTermGains.toLocaleString()}`,
            `Your marginal rate: ${(ordinaryRate * 100).toFixed(0)}%`,
            `Long-term rate would be: ${(ltcgRate * 100).toFixed(0)}%`,
            `Extra tax from short-term: ~$${Math.round(excessTax).toLocaleString()}`,
        ],
        strategy: [
            'Hold crypto > 1 year for long-term capital gains',
            'LTCG rates: 0%, 15%, or 20% (vs up to 37% ordinary)',
            'Plan sales around holding period',
            'Use HIFO to sell longest-held lots first',
        ],
        authority: {
            citation: 'IRC §1(h) • IRS Notice 2014-21',
        },
        isInformational: true,
        timeline: 'Future Planning',
    };
}

/**
 * Analyze NFT tax considerations
 */
function analyzeNFTTaxes(form, cryptoData) {
    const hasNFTs = form.hasNFTs || cryptoData.hasNFTs;
    const nftGains = parseFloat(form.nftGains) || parseFloat(cryptoData.nftGains) || 0;

    if (!hasNFTs && nftGains <= 0) return null;

    return {
        id: 'crypto-nft-taxes',
        name: 'NFT Tax Treatment',
        category: CATEGORY.CAPITAL_GAINS,
        potentialSavings: 0,
        difficulty: DIFFICULTY.HARD,
        description: 'NFTs may be subject to collectibles tax rate (28%) rather than standard LTCG rates.',
        details: [
            nftGains > 0 ? `NFT gains: $${nftGains.toLocaleString()}` : 'NFT holdings detected',
            'IRS may classify NFTs as "collectibles"',
            'Collectibles max rate: 28% (vs 20% standard LTCG)',
        ],
        considerations: [
            'Art/collectible NFTs: Likely 28% rate',
            'Gaming/utility NFTs: May qualify for 20% rate',
            'NFT creator income: Ordinary income + SE tax',
            'Royalties from NFT sales: Ordinary income',
        ],
        taxTreatment: {
            buyer: 'Capital gain/loss on sale (possibly collectibles rate)',
            creator: 'Ordinary income on initial sale + royalties',
            royalties: 'Ordinary income when received',
        },
        authority: {
            citation: 'IRS Notice 2023-27 • IRC §408(m)',
            details: [
                'IRS Notice 2023-27: Guidance on NFT collectibles',
                'IRC §408(m): Definition of collectibles',
            ],
            url: 'https://www.irs.gov/pub/irs-drop/n-23-27.pdf'
        },
        isInformational: true,
        timeline: 'This Return',
    };
}

/**
 * Analyze DeFi activity taxes
 */
function analyzeDeFiTaxes(form, cryptoData) {
    const hasDeFi = form.hasDeFi || cryptoData.hasDeFi;
    const lpRewards = parseFloat(cryptoData.lpRewards) || 0;
    const yieldFarming = parseFloat(cryptoData.yieldFarming) || 0;

    if (!hasDeFi && lpRewards <= 0 && yieldFarming <= 0) return null;

    return {
        id: 'crypto-defi-taxes',
        name: 'DeFi Activity Tax Implications',
        category: CATEGORY.CAPITAL_GAINS,
        potentialSavings: 0,
        difficulty: DIFFICULTY.HARD,
        description: 'DeFi activities create complex tax events that require careful tracking.',
        details: [
            lpRewards > 0 ? `LP rewards: $${lpRewards.toLocaleString()}` : null,
            yieldFarming > 0 ? `Yield farming: $${yieldFarming.toLocaleString()}` : null,
            'Each DeFi interaction may be a taxable event',
        ].filter(Boolean),
        taxEvents: [
            'Swap/Trade: Capital gain/loss on each trade',
            'LP Deposit: May be taxable swap (impermanent loss)',
            'LP Withdrawal: Capital event on position',
            'Yield/Rewards: Ordinary income when received',
            'Borrowing: NOT taxable (loan proceeds)',
            'Interest paid: NOT deductible (personal)',
        ],
        recommendations: [
            'Use DeFi tax software (DeBank, Zerion integration)',
            'Track every transaction with timestamps',
            'Document cost basis for all tokens received',
            'Consider tax implications before complex DeFi moves',
        ],
        authority: {
            citation: 'IRS Notice 2014-21 • General tax principles',
        },
        isInformational: true,
        timeline: 'This Return & Ongoing',
    };
}

/**
 * Helper: Get marginal tax rate
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
