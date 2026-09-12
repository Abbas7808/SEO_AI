/**
 * Plan Limits & Manual Payment Approval Engine
 * Manages 3-trial demo audits, screenshot proof submissions,
 * and owner admin approvals for SiteGlow AI (Powered by Nextsoft).
 */

export const MAX_FREE_AUDITS = 3;
export const ADMIN_PASSCODE = 'NEXTSOFT_ADMIN_2025';

// Owner payment details configuration
export const PAYMENT_METHODS = [
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    badge: 'Instant Mobile Wallet',
    accountTitle: 'Munim Abbas / Nextsoft',
    accountNumber: '0334-9876543',
    instructions: 'Send payment via EasyPaisa App or retailer, copy the Transaction ID (TID), and upload payment receipt screenshot.'
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    badge: 'Mobile Account',
    accountTitle: 'Munim Abbas / Nextsoft',
    accountNumber: '0300-1234567',
    instructions: 'Transfer via JazzCash App, note the TID reference, and attach the completion screenshot.'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer (IBAN / Wire)',
    badge: 'Commercial Bank',
    bankName: 'Meezan Bank / HBL',
    accountTitle: 'Nextsoft Technologies',
    accountNumber: '01020304050607',
    iban: 'PK36MEZN0001020304050607',
    instructions: 'Transfer via online banking or ATM, take a screenshot or photo of the payment slip, and upload below.'
  },
  {
    id: 'paypal_crypto',
    name: 'PayPal / Crypto (USDT)',
    badge: 'International / USD',
    paypalEmail: 'payments@nexsoft.site',
    cryptoAddress: 'USDT (TRC-20): TNextsoftPlatformPaymentWallet7788',
    instructions: 'Send equivalent USD ($19 for Pro, $49 for Agency) and upload transfer confirmation screenshot.'
  }
];

export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free Demo Trial',
    priceUsd: 0,
    pricePkr: 0,
    billingCycle: 'Trial',
    auditsAllowed: 3,
    maxPages: 5,
    features: [
      '3 Website Project Audits Total',
      'Up to 5 Crawled Pages per Audit',
      'Mobile & Desktop SEO Score',
      'Basic On-Page & Technical Diagnosis',
      'Illuminated Backlit Words Cloud'
    ],
    lockedFeatures: [
      'Deep Crawl (up to 50 pages)',
      'White-Label PDF Client Reports',
      'Antigravity 1-Click Code Patch Downloads',
      'Competitor Head-to-Head Comparison',
      'Priority AI Agent Council Consultation'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Specialist',
    priceUsd: 19,
    pricePkr: 2999,
    billingCycle: 'monthly',
    popular: true,
    auditsAllowed: 'Unlimited',
    maxPages: 50,
    features: [
      'Unlimited Website Project Audits',
      'Deep Crawl (up to 50 pages per scan)',
      'Antigravity 1-Click Code Patch Downloads',
      'White-Label PDF Client Reports with Branding',
      'Autonomous Multi-Agent AI Council Reviews',
      'Full Competitor Head-to-Head Comparison',
      'Core Web Vitals & Technology Stack Detection',
      'Priority Email & Community Support'
    ]
  },
  {
    id: 'agency',
    name: 'Agency Enterprise',
    priceUsd: 49,
    pricePkr: 6999,
    billingCycle: 'monthly',
    auditsAllowed: 'Unlimited',
    maxPages: 100,
    features: [
      'Everything in Pro Specialist',
      'Custom Agency Client Branding & Logo on Reports',
      'Deep 100-Page Website Auditing',
      'Multiple Team Member Seats',
      'Automated Weekly Scheduled Audit Alerts',
      'Direct WhatsApp & Priority Support from Nextsoft'
    ]
  }
];

// Project Owner Account Configuration (Munim Abbas)
export const OWNER_ACCOUNT = {
  name: 'Munim Abbas',
  email: 'munimabbas@nexsoft.site',
  role: 'owner',
  title: 'Project Owner & Founder',
  plan: 'agency',
  isOwner: true
};

export const OWNER_EMAILS = [
  'munimabbas@nexsoft.site',
  'munim@nexsoft.site',
  'munim.abbas@nexsoft.site',
  'munimabbas@gmail.com',
  'munim@audit.local'
];

/**
 * Check if given user or active session belongs to the project owner (Munim Abbas)
 */
export function isProjectOwner(userEmail = '') {
  try {
    const email = (userEmail || '').toLowerCase().trim();
    if (OWNER_EMAILS.includes(email) || email.includes('munim')) {
      return true;
    }
    const activeUser = JSON.parse(localStorage.getItem('seo_user') || 'null');
    if (activeUser?.isOwner || activeUser?.role === 'owner') {
      return true;
    }
    if (activeUser?.name?.toLowerCase().includes('munim abbas')) {
      return true;
    }
    if (activeUser?.email) {
      const uEmail = activeUser.email.toLowerCase().trim();
      if (OWNER_EMAILS.includes(uEmail) || uEmail.includes('munim')) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

/**
 * Get active user plan status ('free' | 'pro' | 'agency')
 */
export function getUserPlan(userEmail = '') {
  // Project owner Munim Abbas has permanent top-tier Enterprise/Agency plan
  if (isProjectOwner(userEmail)) {
    return 'agency';
  }

  try {
    // 1. Check if user is manually granted pro in approved members list
    const approvedMembers = JSON.parse(localStorage.getItem('seo_approved_members') || '{}');
    const email = userEmail.toLowerCase().trim();

    if (email && approvedMembers[email]) {
      return approvedMembers[email].plan || 'pro';
    }

    // 2. Check active user profile stored in localStorage
    const activeUser = JSON.parse(localStorage.getItem('seo_user') || 'null');
    if (activeUser?.plan) {
      return activeUser.plan;
    }
    if (activeUser?.email && approvedMembers[activeUser.email.toLowerCase().trim()]) {
      return approvedMembers[activeUser.email.toLowerCase().trim()].plan || 'pro';
    }

    // 3. Check persistent device plan
    const devicePlan = localStorage.getItem('seo_device_plan');
    if (devicePlan && devicePlan !== 'free') {
      return devicePlan;
    }
  } catch (e) {}

  return 'free';
}

/**
 * Get count of project audits conducted so far
 */
export function getTrialUsage(userEmail = '') {
  const isOwner = isProjectOwner(userEmail);
  const plan = isOwner ? 'agency' : getUserPlan(userEmail);
  const isPro = isOwner || plan === 'pro' || plan === 'agency';

  let auditsCount = 0;
  try {
    const list = JSON.parse(localStorage.getItem('seo_audits_list') || '[]');
    auditsCount = list.length;
  } catch (e) {}

  const auditsRemaining = isPro ? 999999 : Math.max(0, MAX_FREE_AUDITS - auditsCount);
  const isLimitReached = !isPro && auditsCount >= MAX_FREE_AUDITS;

  return {
    plan,
    isPro,
    isOwner,
    auditsCount,
    maxFreeAudits: MAX_FREE_AUDITS,
    auditsRemaining,
    isLimitReached,
    percentageUsed: isPro ? 100 : Math.min(100, Math.round((auditsCount / MAX_FREE_AUDITS) * 100))
  };
}

/**
 * Check if the user is allowed to start a new audit
 */
export function canPerformAudit(userEmail = '') {
  if (isProjectOwner(userEmail)) return true;
  const usage = getTrialUsage(userEmail);
  return !usage.isLimitReached;
}

/**
 * Customer submits a payment request with screenshot proof
 */
export function submitPaymentProof(data) {
  const {
    name,
    email,
    plan = 'pro',
    paymentMethod,
    transactionId,
    amount,
    screenshotBase64,
    notes = ''
  } = data;

  const request = {
    id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    plan,
    paymentMethod,
    transactionId: transactionId.trim(),
    amount: amount || (plan === 'agency' ? '$49 / 6,999 PKR' : '$19 / 2,999 PKR'),
    screenshot: screenshotBase64,
    notes: notes.trim(),
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    submittedAt: new Date().toISOString()
  };

  try {
    const requests = JSON.parse(localStorage.getItem('seo_payment_requests') || '[]');
    // Add to top
    requests.unshift(request);
    localStorage.setItem('seo_payment_requests', JSON.stringify(requests));

    // Save pending status for this user
    localStorage.setItem(`seo_pending_payment_${request.email}`, JSON.stringify(request));
  } catch (e) {
    console.error('Failed to save payment proof:', e);
    throw new Error('Storage error while saving payment proof.');
  }

  return request;
}

/**
 * Retrieve all payment requests for Admin review
 */
export function getAllPaymentRequests() {
  try {
    return JSON.parse(localStorage.getItem('seo_payment_requests') || '[]');
  } catch (e) {
    return [];
  }
}

/**
 * Owner approves a payment request
 */
export function approvePaymentRequest(requestId) {
  try {
    const requests = JSON.parse(localStorage.getItem('seo_payment_requests') || '[]');
    const req = requests.find(r => r.id === requestId);
    if (!req) return false;

    req.status = 'approved';
    req.approvedAt = new Date().toISOString();
    localStorage.setItem('seo_payment_requests', JSON.stringify(requests));

    // Activate member
    manualActivateMember(req.email, req.plan);

    // Clean pending
    localStorage.removeItem(`seo_pending_payment_${req.email}`);
    return true;
  } catch (e) {
    console.error('Failed to approve payment:', e);
    return false;
  }
}

/**
 * Owner rejects a payment request
 */
export function rejectPaymentRequest(requestId, reason = 'Payment could not be verified') {
  try {
    const requests = JSON.parse(localStorage.getItem('seo_payment_requests') || '[]');
    const req = requests.find(r => r.id === requestId);
    if (!req) return false;

    req.status = 'rejected';
    req.rejectionReason = reason;
    req.rejectedAt = new Date().toISOString();
    localStorage.setItem('seo_payment_requests', JSON.stringify(requests));

    localStorage.removeItem(`seo_pending_payment_${req.email}`);
    return true;
  } catch (e) {
    console.error('Failed to reject payment:', e);
    return false;
  }
}

/**
 * Manually activate any customer email as Pro or Enterprise immediately
 */
export function manualActivateMember(email, plan = 'pro') {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail) return false;

  try {
    // 1. Add to approved members
    const approvedMembers = JSON.parse(localStorage.getItem('seo_approved_members') || '{}');
    approvedMembers[cleanEmail] = {
      plan,
      activatedAt: new Date().toISOString(),
      status: 'active'
    };
    localStorage.setItem('seo_approved_members', JSON.stringify(approvedMembers));

    // 2. If active user matches this email, update user session
    const activeUser = JSON.parse(localStorage.getItem('seo_user') || 'null');
    if (activeUser && activeUser.email?.toLowerCase().trim() === cleanEmail) {
      activeUser.plan = plan;
      localStorage.setItem('seo_user', JSON.stringify(activeUser));
      localStorage.setItem('seo_device_plan', plan);
    } else {
      // Also update device plan
      localStorage.setItem('seo_device_plan', plan);
    }

    // 3. Update in local registered users list if present
    const localUsers = JSON.parse(localStorage.getItem('seo_local_users') || '[]');
    const userIdx = localUsers.findIndex(u => u.email.toLowerCase() === cleanEmail);
    if (userIdx >= 0) {
      localUsers[userIdx].plan = plan;
      localStorage.setItem('seo_local_users', JSON.stringify(localUsers));
    }

    return true;
  } catch (e) {
    console.error('Failed to activate member:', e);
    return false;
  }
}

/**
 * Generate unique one-time Pro License Keys for clients
 */
export function generateLicenseKey(plan = 'pro') {
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const key = `NEXTSOFT-${plan.toUpperCase()}-${randomSuffix}`;

  try {
    const keys = JSON.parse(localStorage.getItem('seo_license_keys') || '[]');
    keys.unshift({
      key,
      plan,
      createdAt: new Date().toISOString(),
      redeemed: false,
      redeemedBy: null
    });
    localStorage.setItem('seo_license_keys', JSON.stringify(keys));
  } catch (e) {}

  return key;
}

/**
 * Customer redeems a generated license key
 */
export function redeemLicenseKey(inputKey, userEmail = '') {
  const cleanKey = inputKey.trim().toUpperCase();
  if (!cleanKey) return { success: false, message: 'Please enter a license key.' };

  try {
    const keys = JSON.parse(localStorage.getItem('seo_license_keys') || '[]');
    const matched = keys.find(k => k.key === cleanKey && !k.redeemed);

    if (!matched) {
      return { success: false, message: 'Invalid or already redeemed license key.' };
    }

    matched.redeemed = true;
    matched.redeemedAt = new Date().toISOString();
    matched.redeemedBy = userEmail || 'Active User';
    localStorage.setItem('seo_license_keys', JSON.stringify(keys));

    // Activate member
    const plan = matched.plan || 'pro';
    if (userEmail) {
      manualActivateMember(userEmail, plan);
    } else {
      localStorage.setItem('seo_device_plan', plan);
      const activeUser = JSON.parse(localStorage.getItem('seo_user') || 'null');
      if (activeUser) {
        activeUser.plan = plan;
        localStorage.setItem('seo_user', JSON.stringify(activeUser));
      }
    }

    return {
      success: true,
      plan,
      message: `Congratulations! ${plan.toUpperCase()} membership activated successfully.`
    };
  } catch (e) {
    return { success: false, message: 'Error verifying key.' };
  }
}
