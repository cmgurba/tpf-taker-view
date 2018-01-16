import DS from 'ember-data';
// import Model from 'tpf/utils/model-util';
// import {memberAction} from 'ember-api-actions';

export default DS.Model.extend({

    // Authorize a takers accounts
    // PATCH /tpf-takers/:takerId/authorize-accounts
    // authorizeAccounts: memberAction({
    //     path: 'authorize-accounts',
    //     type: 'patch'
    // }),

    takerId: Model.attr(),
    takerUuid: Model.attr(),
    isAccountVerified: Model.attr(),
    created: Model.attr(),
    updated: Model.attr(),
    isAgreementSigned: Model.attr(),
    industryType: Model.attr(),
    industryTypeOther: Model.attr(),
    annualRevenue: Model.attr(),
    yearsInBusiness: Model.attr(),
    arIsPledged: Model.attr(),
    arCredit: Model.attr(),
    arDrawn: Model.attr(),
    website: Model.attr(),
    loanPurpose: Model.attr(),
    contactName: Model.attr(),
    email: Model.attr(),
    phoneNumber: Model.attr(),
    jobTitle: Model.attr(),
    jobTitleOther: Model.attr(),
    entityType: Model.attr(),
    isInfoComplete: Model.attr(),
    isBankAccountComplete: Model.attr(),
    isFinancialsComplete: Model.attr(),
    financialInfo: Model.attr(),
    isFinancialUploaded: Model.attr(),
    connectorPreference: Model.attr(),
    isUnderwritingApproved: Model.attr(),
    isUnderwritingDisapproved: DS.attr(),
    isUnderReview: Model.attr(),
    underReviewReason: Model.attr()
});
