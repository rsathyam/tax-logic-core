/**
 * State Tax Rates for 2025
 * All 50 states + DC with income tax brackets, flat rates, or no-income-tax status
 */

// States with no income tax on wages/salary
export const NO_INCOME_TAX_STATES = [
    'AK', // Alaska
    'FL', // Florida
    'NV', // Nevada
    'NH', // New Hampshire (interest/dividend tax ended 2025)
    'SD', // South Dakota
    'TN', // Tennessee
    'TX', // Texas
    'WA', // Washington (but has 7% LTCG tax)
    'WY', // Wyoming
];

// States with flat income tax rates for 2025
export const FLAT_TAX_STATES = {
    AZ: { rate: 0.025, name: 'Arizona' },
    CO: { rate: 0.044, name: 'Colorado' },
    GA: { rate: 0.0539, name: 'Georgia' },
    ID: { rate: 0.058, name: 'Idaho' },
    IL: { rate: 0.0495, name: 'Illinois' },
    IN: { rate: 0.0305, name: 'Indiana' },
    KY: { rate: 0.04, name: 'Kentucky' },
    MI: { rate: 0.0425, name: 'Michigan' },
    MS: { rate: 0.044, name: 'Mississippi' },
    NC: { rate: 0.0425, name: 'North Carolina' },
    PA: { rate: 0.0307, name: 'Pennsylvania' },
    UT: { rate: 0.0455, name: 'Utah' },
};

// Massachusetts has a special millionaire's tax
export const MASSACHUSETTS_RATES = {
    name: 'Massachusetts',
    regular: 0.05,
    millionaireThreshold: 1000000,
    millionaireRate: 0.09,
};

// Washington state capital gains tax
export const WASHINGTON_CAPITAL_GAINS = {
    name: 'Washington',
    threshold: 270000,
    rate: 0.07,
    additionalThreshold: 1000000,
    additionalRate: 0.029, // Additional 2.9% for gains over $1M (2025)
};

// California mental health services tax
export const CALIFORNIA_MENTAL_HEALTH_TAX = {
    threshold: 1000000,
    rate: 0.01,
};

// States with graduated income tax brackets (2025 estimates)
export const STATE_TAX_BRACKETS = {
    AL: {
        name: 'Alabama',
        single: [
            [0, 0.02],
            [500, 0.04],
            [3000, 0.05],
        ],
        married: [
            [0, 0.02],
            [1000, 0.04],
            [6000, 0.05],
        ],
    },
    AR: {
        name: 'Arkansas',
        single: [
            [0, 0.02],
            [5099, 0.04],
            [10299, 0.044],
        ],
        married: [
            [0, 0.02],
            [5099, 0.04],
            [10299, 0.044],
        ],
    },
    CA: {
        name: 'California',
        single: [
            [0, 0.01],
            [10412, 0.02],
            [24684, 0.04],
            [38959, 0.06],
            [54081, 0.08],
            [68350, 0.093],
            [349137, 0.103],
            [418961, 0.113],
            [698271, 0.123],
            [1000000, 0.133], // Includes 1% mental health surcharge
        ],
        married: [
            [0, 0.01],
            [20824, 0.02],
            [49368, 0.04],
            [77918, 0.06],
            [108162, 0.08],
            [136700, 0.093],
            [698274, 0.103],
            [837922, 0.113],
            [1000000, 0.123],
            [1396542, 0.133],
        ],
    },
    CT: {
        name: 'Connecticut',
        single: [
            [0, 0.02],
            [10000, 0.045],
            [50000, 0.055],
            [100000, 0.06],
            [200000, 0.065],
            [250000, 0.069],
            [500000, 0.0699],
        ],
        married: [
            [0, 0.02],
            [20000, 0.045],
            [100000, 0.055],
            [200000, 0.06],
            [400000, 0.065],
            [500000, 0.069],
            [1000000, 0.0699],
        ],
    },
    DE: {
        name: 'Delaware',
        single: [
            [0, 0],
            [2000, 0.022],
            [5000, 0.039],
            [10000, 0.048],
            [20000, 0.052],
            [25000, 0.0555],
            [60000, 0.066],
        ],
        married: [
            [0, 0],
            [2000, 0.022],
            [5000, 0.039],
            [10000, 0.048],
            [20000, 0.052],
            [25000, 0.0555],
            [60000, 0.066],
        ],
    },
    DC: {
        name: 'District of Columbia',
        single: [
            [0, 0.04],
            [10000, 0.06],
            [40000, 0.065],
            [60000, 0.085],
            [250000, 0.0925],
            [500000, 0.0975],
            [1000000, 0.1075],
        ],
        married: [
            [0, 0.04],
            [10000, 0.06],
            [40000, 0.065],
            [60000, 0.085],
            [250000, 0.0925],
            [500000, 0.0975],
            [1000000, 0.1075],
        ],
    },
    HI: {
        name: 'Hawaii',
        single: [
            [0, 0.014],
            [2400, 0.032],
            [4800, 0.055],
            [9600, 0.064],
            [14400, 0.068],
            [19200, 0.072],
            [24000, 0.076],
            [36000, 0.079],
            [48000, 0.0825],
            [150000, 0.09],
            [175000, 0.10],
            [200000, 0.11],
        ],
        married: [
            [0, 0.014],
            [4800, 0.032],
            [9600, 0.055],
            [19200, 0.064],
            [28800, 0.068],
            [38400, 0.072],
            [48000, 0.076],
            [72000, 0.079],
            [96000, 0.0825],
            [300000, 0.09],
            [350000, 0.10],
            [400000, 0.11],
        ],
    },
    IA: {
        name: 'Iowa',
        single: [
            [0, 0.044],
            [6210, 0.0482],
            [31050, 0.057],
        ],
        married: [
            [0, 0.044],
            [12420, 0.0482],
            [62100, 0.057],
        ],
    },
    KS: {
        name: 'Kansas',
        single: [
            [0, 0.031],
            [15000, 0.0525],
            [30000, 0.057],
        ],
        married: [
            [0, 0.031],
            [30000, 0.0525],
            [60000, 0.057],
        ],
    },
    LA: {
        name: 'Louisiana',
        single: [
            [0, 0.0185],
            [12500, 0.035],
            [50000, 0.0425],
        ],
        married: [
            [0, 0.0185],
            [25000, 0.035],
            [100000, 0.0425],
        ],
    },
    ME: {
        name: 'Maine',
        single: [
            [0, 0.058],
            [26050, 0.0675],
            [61600, 0.0715],
        ],
        married: [
            [0, 0.058],
            [52100, 0.0675],
            [123200, 0.0715],
        ],
    },
    MD: {
        name: 'Maryland',
        single: [
            [0, 0.02],
            [1000, 0.03],
            [2000, 0.04],
            [3000, 0.0475],
            [100000, 0.05],
            [125000, 0.0525],
            [150000, 0.055],
            [250000, 0.0575],
        ],
        married: [
            [0, 0.02],
            [1000, 0.03],
            [2000, 0.04],
            [3000, 0.0475],
            [150000, 0.05],
            [175000, 0.0525],
            [225000, 0.055],
            [300000, 0.0575],
        ],
    },
    MN: {
        name: 'Minnesota',
        single: [
            [0, 0.0535],
            [31690, 0.068],
            [104090, 0.0785],
            [193240, 0.0985],
        ],
        married: [
            [0, 0.0535],
            [46330, 0.068],
            [184040, 0.0785],
            [321450, 0.0985],
        ],
    },
    MO: {
        name: 'Missouri',
        single: [
            [0, 0.02],
            [1207, 0.025],
            [2414, 0.03],
            [3621, 0.035],
            [4828, 0.04],
            [6035, 0.045],
            [7242, 0.048],
        ],
        married: [
            [0, 0.02],
            [1207, 0.025],
            [2414, 0.03],
            [3621, 0.035],
            [4828, 0.04],
            [6035, 0.045],
            [7242, 0.048],
        ],
    },
    MT: {
        name: 'Montana',
        single: [
            [0, 0.047],
            [20500, 0.059],
        ],
        married: [
            [0, 0.047],
            [41000, 0.059],
        ],
    },
    NE: {
        name: 'Nebraska',
        single: [
            [0, 0.0246],
            [3700, 0.0351],
            [22170, 0.0501],
            [35730, 0.0584],
        ],
        married: [
            [0, 0.0246],
            [7390, 0.0351],
            [44340, 0.0501],
            [71460, 0.0584],
        ],
    },
    NJ: {
        name: 'New Jersey',
        single: [
            [0, 0.014],
            [20000, 0.0175],
            [35000, 0.035],
            [40000, 0.05525],
            [75000, 0.0637],
            [500000, 0.0897],
            [1000000, 0.1075],
        ],
        married: [
            [0, 0.014],
            [20000, 0.0175],
            [50000, 0.0245],
            [70000, 0.035],
            [80000, 0.05525],
            [150000, 0.0637],
            [500000, 0.0897],
            [1000000, 0.1075],
        ],
    },
    NM: {
        name: 'New Mexico',
        single: [
            [0, 0.017],
            [5500, 0.032],
            [11000, 0.047],
            [16000, 0.049],
            [210000, 0.059],
        ],
        married: [
            [0, 0.017],
            [8000, 0.032],
            [16000, 0.047],
            [24000, 0.049],
            [315000, 0.059],
        ],
    },
    NY: {
        name: 'New York',
        single: [
            [0, 0.04],
            [8500, 0.045],
            [11700, 0.0525],
            [13900, 0.055],
            [80650, 0.06],
            [215400, 0.0685],
            [1077550, 0.0965],
            [5000000, 0.103],
            [25000000, 0.109],
        ],
        married: [
            [0, 0.04],
            [17150, 0.045],
            [23600, 0.0525],
            [27900, 0.055],
            [161550, 0.06],
            [323200, 0.0685],
            [2155350, 0.0965],
            [5000000, 0.103],
            [25000000, 0.109],
        ],
    },
    ND: {
        name: 'North Dakota',
        single: [
            [0, 0.0195],
            [44725, 0.0235],
        ],
        married: [
            [0, 0.0195],
            [74750, 0.0235],
        ],
    },
    OH: {
        name: 'Ohio',
        single: [
            [0, 0],
            [26050, 0.02765],
            [100000, 0.035],
        ],
        married: [
            [0, 0],
            [26050, 0.02765],
            [100000, 0.035],
        ],
    },
    OK: {
        name: 'Oklahoma',
        single: [
            [0, 0.0025],
            [1000, 0.0075],
            [2500, 0.0175],
            [3750, 0.0275],
            [4900, 0.0375],
            [7200, 0.0475],
        ],
        married: [
            [0, 0.0025],
            [2000, 0.0075],
            [5000, 0.0175],
            [7500, 0.0275],
            [9800, 0.0375],
            [12200, 0.0475],
        ],
    },
    OR: {
        name: 'Oregon',
        single: [
            [0, 0.0475],
            [4300, 0.0675],
            [10750, 0.0875],
            [125000, 0.099],
        ],
        married: [
            [0, 0.0475],
            [8600, 0.0675],
            [21500, 0.0875],
            [250000, 0.099],
        ],
    },
    RI: {
        name: 'Rhode Island',
        single: [
            [0, 0.0375],
            [77450, 0.0475],
            [176050, 0.0599],
        ],
        married: [
            [0, 0.0375],
            [77450, 0.0475],
            [176050, 0.0599],
        ],
    },
    SC: {
        name: 'South Carolina',
        single: [
            [0, 0],
            [3460, 0.03],
            [17330, 0.062],
        ],
        married: [
            [0, 0],
            [3460, 0.03],
            [17330, 0.062],
        ],
    },
    VT: {
        name: 'Vermont',
        single: [
            [0, 0.0335],
            [45400, 0.066],
            [110050, 0.076],
            [229550, 0.0875],
        ],
        married: [
            [0, 0.0335],
            [75850, 0.066],
            [183400, 0.076],
            [279450, 0.0875],
        ],
    },
    VA: {
        name: 'Virginia',
        single: [
            [0, 0.02],
            [3000, 0.03],
            [5000, 0.05],
            [17000, 0.0575],
        ],
        married: [
            [0, 0.02],
            [3000, 0.03],
            [5000, 0.05],
            [17000, 0.0575],
        ],
    },
    WV: {
        name: 'West Virginia',
        single: [
            [0, 0.0236],
            [10000, 0.0315],
            [25000, 0.0354],
            [40000, 0.0472],
            [60000, 0.0512],
        ],
        married: [
            [0, 0.0236],
            [10000, 0.0315],
            [25000, 0.0354],
            [40000, 0.0472],
            [60000, 0.0512],
        ],
    },
    WI: {
        name: 'Wisconsin',
        single: [
            [0, 0.035],
            [14320, 0.044],
            [28640, 0.053],
            [315310, 0.0765],
        ],
        married: [
            [0, 0.035],
            [19090, 0.044],
            [38190, 0.053],
            [420420, 0.0765],
        ],
    },
};

// All states list for dropdowns
export const ALL_STATES = [
    { abbr: 'AL', name: 'Alabama' },
    { abbr: 'AK', name: 'Alaska' },
    { abbr: 'AZ', name: 'Arizona' },
    { abbr: 'AR', name: 'Arkansas' },
    { abbr: 'CA', name: 'California' },
    { abbr: 'CO', name: 'Colorado' },
    { abbr: 'CT', name: 'Connecticut' },
    { abbr: 'DE', name: 'Delaware' },
    { abbr: 'DC', name: 'District of Columbia' },
    { abbr: 'FL', name: 'Florida' },
    { abbr: 'GA', name: 'Georgia' },
    { abbr: 'HI', name: 'Hawaii' },
    { abbr: 'ID', name: 'Idaho' },
    { abbr: 'IL', name: 'Illinois' },
    { abbr: 'IN', name: 'Indiana' },
    { abbr: 'IA', name: 'Iowa' },
    { abbr: 'KS', name: 'Kansas' },
    { abbr: 'KY', name: 'Kentucky' },
    { abbr: 'LA', name: 'Louisiana' },
    { abbr: 'ME', name: 'Maine' },
    { abbr: 'MD', name: 'Maryland' },
    { abbr: 'MA', name: 'Massachusetts' },
    { abbr: 'MI', name: 'Michigan' },
    { abbr: 'MN', name: 'Minnesota' },
    { abbr: 'MS', name: 'Mississippi' },
    { abbr: 'MO', name: 'Missouri' },
    { abbr: 'MT', name: 'Montana' },
    { abbr: 'NE', name: 'Nebraska' },
    { abbr: 'NV', name: 'Nevada' },
    { abbr: 'NH', name: 'New Hampshire' },
    { abbr: 'NJ', name: 'New Jersey' },
    { abbr: 'NM', name: 'New Mexico' },
    { abbr: 'NY', name: 'New York' },
    { abbr: 'NC', name: 'North Carolina' },
    { abbr: 'ND', name: 'North Dakota' },
    { abbr: 'OH', name: 'Ohio' },
    { abbr: 'OK', name: 'Oklahoma' },
    { abbr: 'OR', name: 'Oregon' },
    { abbr: 'PA', name: 'Pennsylvania' },
    { abbr: 'RI', name: 'Rhode Island' },
    { abbr: 'SC', name: 'South Carolina' },
    { abbr: 'SD', name: 'South Dakota' },
    { abbr: 'TN', name: 'Tennessee' },
    { abbr: 'TX', name: 'Texas' },
    { abbr: 'UT', name: 'Utah' },
    { abbr: 'VT', name: 'Vermont' },
    { abbr: 'VA', name: 'Virginia' },
    { abbr: 'WA', name: 'Washington' },
    { abbr: 'WV', name: 'West Virginia' },
    { abbr: 'WI', name: 'Wisconsin' },
    { abbr: 'WY', name: 'Wyoming' },
];

/**
 * Calculate state income tax
 */
export function calculateStateTax(taxableIncome, state, filingStatus = 'single') {
    if (!state || NO_INCOME_TAX_STATES.includes(state)) {
        return 0;
    }

    // Flat tax states
    if (FLAT_TAX_STATES[state]) {
        return taxableIncome * FLAT_TAX_STATES[state].rate;
    }

    // Massachusetts special handling
    if (state === 'MA') {
        if (taxableIncome <= MASSACHUSETTS_RATES.millionaireThreshold) {
            return taxableIncome * MASSACHUSETTS_RATES.regular;
        }
        const regularTax = MASSACHUSETTS_RATES.millionaireThreshold * MASSACHUSETTS_RATES.regular;
        const excessTax = (taxableIncome - MASSACHUSETTS_RATES.millionaireThreshold) * MASSACHUSETTS_RATES.millionaireRate;
        return regularTax + excessTax;
    }

    // Graduated bracket states
    const brackets = STATE_TAX_BRACKETS[state];
    if (!brackets) {
        return 0;
    }

    const statusBrackets = filingStatus === 'married' || filingStatus === 'widow'
        ? brackets.married
        : brackets.single;

    if (!statusBrackets) {
        return 0;
    }

    // Calculate using progressive brackets
    let tax = 0;
    for (let i = 0; i < statusBrackets.length; i++) {
        const [limit, rate] = statusBrackets[i];
        const nextLimit = statusBrackets[i + 1]?.[0] ?? Infinity;

        if (taxableIncome > nextLimit) {
            tax += (nextLimit - limit) * rate;
        } else {
            tax += Math.max(0, taxableIncome - limit) * rate;
            break;
        }
    }

    return Math.max(0, tax);
}

/**
 * Calculate Washington state capital gains tax
 */
export function calculateWashingtonCapitalGainsTax(longTermGains) {
    if (longTermGains <= WASHINGTON_CAPITAL_GAINS.threshold) {
        return 0;
    }

    let tax = 0;
    const taxableGains = longTermGains - WASHINGTON_CAPITAL_GAINS.threshold;

    if (longTermGains > WASHINGTON_CAPITAL_GAINS.additionalThreshold) {
        // Apply additional rate on gains over $1M
        const additionalGains = longTermGains - WASHINGTON_CAPITAL_GAINS.additionalThreshold;
        const regularGains = WASHINGTON_CAPITAL_GAINS.additionalThreshold - WASHINGTON_CAPITAL_GAINS.threshold;
        tax = (regularGains * WASHINGTON_CAPITAL_GAINS.rate) +
            (additionalGains * (WASHINGTON_CAPITAL_GAINS.rate + WASHINGTON_CAPITAL_GAINS.additionalRate));
    } else {
        tax = taxableGains * WASHINGTON_CAPITAL_GAINS.rate;
    }

    return tax;
}

/**
 * Get state name from abbreviation
 */
export function getStateName(abbr) {
    const state = ALL_STATES.find(s => s.abbr === abbr);
    return state ? state.name : abbr;
}
