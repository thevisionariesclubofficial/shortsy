/**
 * legalLinks.ts
 * -------------
 * Firebase Storage public URLs for all Shortsy legal documents.
 *
 * HOW TO UPDATE:
 *   1. cd shortsy/legalDocs
 *   2. node uploadLegalDocs.mjs
 *   3. Copy the printed URLs here.
 */

export const LEGAL_LINKS = {
  termsOfService: 'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/legal%20documents%2Fterms-of-service.html?alt=media&token=630efbcd-ff51-444e-8e56-89a98ba7e782',
  privacyPolicy:  'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/legal%20documents%2Fprivacy-policy.html?alt=media&token=cc76dec6-a07c-4da0-9617-35a37d94b82a',
  refundPolicy:   'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/legal%20documents%2Frefund-policy.html?alt=media&token=576d5088-1bc5-438d-ad2c-53759e82ba0f',
  cookiePolicy:   'https://firebasestorage.googleapis.com/v0/b/shortsy-7c19f.firebasestorage.app/o/legal%20documents%2Fcookie-policy.html?alt=media&token=92995de8-15d8-46d2-ad7e-38ad2f0c5162',
};
