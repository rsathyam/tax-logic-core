# Architecture Overview

This document describes the architecture of tax-logic-core, an open-source US federal tax calculation engine.

## 📁 Project Structure

```
tax-logic-core/
├── src/
│   ├── index.js                 # Main entry point, re-exports all modules
│   ├── calculations/            # Core tax math
│   │   ├── index.js            # Exports calculation functions
│   │   └── calculateTax.js     # Main tax calculation engine
│   ├── optimizations/           # Tax optimization strategies
│   │   ├── index.js            # Exports all optimizers
│   │   ├── taxOptimizer.js     # Main orchestrator
│   │   ├── filingStatusOptimizer.js
│   │   ├── deductionOptimizer.js
│   │   ├── retirementOptimizer.js
│   │   ├── creditsOptimizer.js
│   │   ├── selfEmploymentOptimizer.js
│   │   ├── capitalGainsOptimizer.js
│   │   ├── stateOptimizer.js
│   │   ├── augustaRuleOptimizer.js
│   │   ├── k1Optimizer.js
│   │   ├── amtOptimizer.js
│   │   ├── cryptoTaxOptimizer.js
│   │   ├── realEstateProfessionalOptimizer.js
│   │   ├── internationalTaxOptimizer.js
│   │   └── statePTETOptimizer.js
│   └── utils/                   # Shared utilities
│       ├── index.js            # Exports utilities
│       ├── taxAuthority.js     # IRS citations database
│       └── testProfiles.js     # Test scenarios
├── package.json
├── README.md
├── CONTRIBUTING.md
├── ARCHITECTURE.md              # This file
└── LICENSE
```

---

## 🧮 Core Calculation Flow

The main calculation flow follows IRS Form 1040:

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INPUT (form)                       │
│   Wages, Interest, Dividends, Self-Employment, etc.         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 1: CALCULATE TOTAL INCOME                  │
│   • Sum all income sources (Lines 1-8 of Form 1040)         │
│   • Handle Schedule C (self-employment)                      │
│   • Handle Schedule E (rental/passive)                       │
│   • Handle Schedule D (capital gains)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 2: CALCULATE ADJUSTMENTS                   │
│   • "Above the line" deductions (Schedule 1)                │
│   • HSA, IRA, Self-employment tax deduction                 │
│   • NEW 2025: Tips, Overtime, Auto Loan, Senior Bonus       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 3: CALCULATE AGI                           │
│   • AGI = Total Income - Adjustments                        │
│   • AGI is used for many phase-out calculations             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 4: CALCULATE DEDUCTION                     │
│   • Choose: Standard Deduction OR Itemized                  │
│   • Handle SALT cap ($40k after OBBBA 2025)                 │
│   • Calculate QBI deduction (§199A)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 5: CALCULATE TAXABLE INCOME                │
│   • Taxable Income = AGI - Deduction - QBI                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 6: CALCULATE TAX                           │
│   • Ordinary income → Tax brackets                          │
│   • Qualified dividends/LTCG → Capital gains rates          │
│   • Self-employment → SE tax (15.3%)                        │
│   • High earners → NIIT (3.8%)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 7: APPLY CREDITS                           │
│   • Non-refundable (can reduce to $0)                       │
│   • Refundable (can go negative = refund)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      OUTPUT: finalTax                        │
│   Plus: AGI, deduction, taxableIncome, breakdown, etc.      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Optimization Engine Flow

The optimizer analyzes a tax form and suggests improvements:

```
┌────────────────────────────────────────────────────────────┐
│                   analyzeTaxOptimizations(form)             │
│                                                             │
│  1. Calculate current tax baseline                         │
│  2. Run each optimizer module (in parallel)                │
│  3. Collect all recommendations                            │
│  4. Filter to positive savings                             │
│  5. Sort by potential savings (descending)                 │
│  6. Return summary                                          │
└────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Filing Status   │ │ Deductions      │ │ Retirement      │
│ Optimizer       │ │ Optimizer       │ │ Optimizer       │
│                 │ │                 │ │                 │
│ • Single→HOH    │ │ • Std vs Item   │ │ • Max 401k      │
│ • MFJ vs MFS    │ │ • SALT cap      │ │ • IRA           │
└─────────────────┘ │ • Bunching      │ │ • HSA           │
                    └─────────────────┘ │ • Roth conv     │
          ┌───────────────────┐         └─────────────────┘
          ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│ Credits         │ │ Self-Employment │
│ Optimizer       │ │ Optimizer       │
│                 │ │                 │
│ • Child credit  │ │ • QBI deduction │
│ • EITC          │ │ • S-Corp elect  │
│ • Education     │ │ • SEP vs Solo   │
└─────────────────┘ │ • Home office   │
                    └─────────────────┘
          ┌───────────────────┐
          ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Capital Gains   │ │ State Tax       │ │ Special Cases   │
│ Optimizer       │ │ Optimizer       │ │                 │
│                 │ │                 │ │ • Augusta Rule  │
│ • Loss harvest  │ │ • No-tax states │ │ • K-1 / QBI     │
│ • 0% bracket    │ │ • PTET          │ │ • AMT           │
│ • NIIT          │ │ • Credits       │ │ • Crypto        │
│ • Wash sales    │ │ • 529           │ │ • International │
└─────────────────┘ └─────────────────┘ │ • REP Status    │
                                        └─────────────────┘
```

---

## 📊 Optimization Object Structure

Each optimization recommendation follows this structure:

```javascript
{
    // IDENTITY
    id: 'ret-401k-maximize',           // Unique identifier
    name: 'Maximize 401(k) Contributions',  // Display name
    
    // CLASSIFICATION
    category: CATEGORY.RETIREMENT,      // For grouping/filtering
    difficulty: DIFFICULTY.EASY,        // Implementation effort
    
    // VALUE
    potentialSavings: 5500,             // Estimated tax savings ($)
    
    // EXPLANATION
    description: 'Increase 401(k) contributions to reduce taxable income',
    details: [
        'Current contribution: $15,000',
        'Maximum allowed: $23,500',
        'Additional room: $8,500',
    ],
    
    // IMPLEMENTATION
    requirements: [
        'Employer-sponsored 401(k) plan',
        'Sufficient cash flow',
    ],
    nextSteps: [
        'Contact HR to increase contribution percentage',
        'Deadline: Before year-end payroll',
    ],
    
    // LEGAL AUTHORITY (Required!)
    authority: {
        citation: 'IRC §402(g) • Publication 590-A',
        details: [
            'IRC §402(g): 401(k) contribution limits',
            '2025 limit: $23,500 (under 50)',
            '2025 catch-up: $7,500 (50+)',
        ],
        url: 'https://www.irs.gov/retirement-plans/401k-plans'
    },
    
    // TIMING
    timeline: 'Before Year-End',
    
    // FOR WHAT-IF SCENARIOS
    formOverrides: {
        retirement401k: 23500,  // Apply this change to recalculate
    },
    
    // OPTIONAL FLAGS
    auditRisk: 'LOW',
    auditNotes: 'Well-documented, standard strategy',
    isInformational: false,     // True = just for awareness, no action needed
    isWarning: false,           // True = potential compliance issue
}
```

---

## 🔐 Design Principles

### 1. Transparency Over Magic

Every calculation should be traceable. No "black box" math.

```javascript
// ✅ GOOD - Every step is visible
const taxableBase = netSelfEmploymentIncome * 0.9235;  // IRC §1402(a)(12)
const ssTax = Math.min(taxableBase, ssWageBase) * 0.124;  // 12.4% SS rate
const medicareTax = taxableBase * 0.029;  // 2.9% Medicare rate

// ❌ BAD - Magic number, unclear calculation
const seTax = income * 0.153 * 0.9235;
```

### 2. IRS Authority Required

Every tax calculation MUST cite its legal basis:
- IRC section
- Publication
- Form/line number
- Treasury Regulation (when applicable)

### 3. Fail Gracefully

Optimizer modules are isolated. One failure doesn't break others:

```javascript
try {
    const results = analyzeRetirementOptimizations(form);
    allOptimizations.push(...results);
} catch (e) {
    console.warn('Retirement optimizer error:', e);
    // Other optimizers continue running
}
```

### 4. No Tax Advice

The code provides calculations and information, NOT advice:

```javascript
// ✅ GOOD - Factual
name: 'QBI Deduction May Apply',
description: 'IRC §199A allows a 20% deduction on qualified business income'

// ❌ BAD - Advice
name: 'You Should Take QBI Deduction',
description: 'This is a great tax break you should definitely use'
```

### 5. Testability

All functions should be pure and testable:

```javascript
// Input → Output (no side effects)
const result = calculateBracketTax(60000, TAX_BRACKETS_2025.single);
expect(result).toBe(8114);
```

---

## 📦 Module Responsibilities

### `calculations/calculateTax.js`

**Purpose**: Core tax math following Form 1040 flow

**Exports**:
- `TAX_BRACKETS_2025` - Income tax brackets
- `STANDARD_DEDUCTIONS_2025` - Standard deduction amounts
- `CAPITAL_GAINS_BRACKETS_2025` - Capital gains tax brackets
- `calculateBracketTax()` - Progressive bracket calculation
- `calculateCapitalGainsTax()` - Capital gains with stacking
- `calculateSelfEmploymentTax()` - Schedule SE calculation
- `calculateNIIT()` - Net Investment Income Tax
- `calculateTotalTax()` - Main Form 1040 calculation
- `calculateTaxWithOverrides()` - What-if scenarios

### `optimizations/taxOptimizer.js`

**Purpose**: Orchestrate all optimization modules

**Exports**:
- `DIFFICULTY` - Easy/Medium/Hard enum
- `CATEGORY` - Optimization category enum
- `analyzeTaxOptimizations()` - Main entry point
- `runWhatIfScenario()` - Compare scenarios
- `getOptimizationsByCategory()` - Filter helper
- `getOptimizationsByDifficulty()` - Filter helper
- `formatCurrency()` - Display formatting
- `calculateEffectiveRate()` - Rate calculation

### `utils/taxAuthority.js`

**Purpose**: Centralized IRS citation database

**Exports**:
- `TAX_AUTHORITY` - Object containing all citations
- `getCitation()` - Get citation by key
- `getAuthority()` - Get full authority object
- `formatAuthorityForDisplay()` - Format for UI

### `utils/testProfiles.js`

**Purpose**: Test scenarios for verification

**Exports**:
- `HIGH_NET_WORTH_PROFILE`
- `FREELANCER_PROFILE`
- `REAL_ESTATE_INVESTOR_PROFILE`
- `W2_SIDE_BUSINESS_PROFILE`
- `RETIREE_PROFILE`
- `SCORP_OWNER_PROFILE`
- `CRYPTO_INVESTOR_PROFILE`
- `US_EXPAT_PROFILE`
- `NY_PTET_PROFILE`
- `REP_QUALIFIED_PROFILE`
- `ALL_TEST_PROFILES`
- `runTestProfiles()` - Batch test runner

---

## 🔄 Adding a New Optimizer

To add a new optimization module:

1. **Create the file**: `src/optimizations/myNewOptimizer.js`

2. **Implement the analyzer function**:
```javascript
import { calculateTotalTax } from '../calculations/calculateTax.js';
import { DIFFICULTY, CATEGORY } from './taxOptimizer.js';

export function analyzeMyNewOptimizations(form) {
    const optimizations = [];
    
    // Your analysis logic here
    // Check conditions, calculate savings
    // Push optimization objects to array
    
    return optimizations;
}
```

3. **Add to main orchestrator** (`taxOptimizer.js`):
```javascript
import { analyzeMyNewOptimizations } from './myNewOptimizer';

// In analyzeTaxOptimizations():
try {
    const myOpts = analyzeMyNewOptimizations(form);
    allOptimizations.push(...myOpts);
} catch (e) {
    console.warn('My optimizer error:', e);
}
```

4. **Export from index** (`optimizations/index.js`):
```javascript
export { analyzeMyNewOptimizations } from './myNewOptimizer.js';
```

5. **Add test cases** to `testProfiles.js`

6. **Document** in README and ARCHITECTURE

---

## 🧪 Testing Strategy

### Unit Tests

Each calculation function should have unit tests:

```javascript
describe('calculateBracketTax', () => {
    it('calculates single filer at $60,000', () => {
        expect(calculateBracketTax(60000, TAX_BRACKETS_2025.single)).toBe(8114);
    });
    
    it('returns 0 for negative income', () => {
        expect(calculateBracketTax(-5000, TAX_BRACKETS_2025.single)).toBe(0);
    });
});
```

### Integration Tests

Test complete scenarios using test profiles:

```javascript
describe('High Net Worth Profile', () => {
    const result = analyzeTaxOptimizations(HIGH_NET_WORTH_PROFILE.form);
    
    it('finds AMT exposure', () => {
        expect(result.optimizations.some(o => o.id.includes('amt'))).toBe(true);
    });
});
```

### Manual Verification

Cross-check against:
- IRS Publication 17 examples
- Commercial tax software (TurboTax, H&R Block)
- CPA review

---

## 📅 Annual Update Process

Each tax year requires updates:

1. **Update brackets and thresholds**
   - Tax brackets (Rev. Proc. inflation adjustments)
   - Standard deduction amounts
   - Capital gains thresholds
   - Contribution limits (401k, IRA, HSA)
   - Phase-out thresholds

2. **Review tax law changes**
   - New legislation
   - Expired provisions
   - Modified rules

3. **Update test cases**
   - Expected values for new year
   - New scenarios for new rules

4. **Update documentation**
   - Year references
   - Changed citations

5. **Version bump**
   - Major version for significant law changes
   - Minor version for annual updates

---

## 📞 Questions?

- **Architecture questions**: Open a GitHub Discussion
- **Bug reports**: Open an Issue
- **Feature requests**: Open an Issue with `[FEATURE]` tag
- **Pull requests**: See CONTRIBUTING.md
