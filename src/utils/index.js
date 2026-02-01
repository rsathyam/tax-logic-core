/**
 * Tax Logic Core - Utilities
 * IRS Authority Citations and Test Profiles
 */

export {
    TAX_AUTHORITY,
    getCitation,
    getAuthority,
    formatAuthorityForDisplay,
} from './taxAuthority.js';

export {
    ALL_TEST_PROFILES,
    HIGH_NET_WORTH_PROFILE,
    FREELANCER_PROFILE,
    REAL_ESTATE_INVESTOR_PROFILE,
    W2_SIDE_BUSINESS_PROFILE,
    RETIREE_PROFILE,
    SCORP_OWNER_PROFILE,
    runTestProfiles,
} from './testProfiles.js';
