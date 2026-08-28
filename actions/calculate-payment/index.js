// MOCK_DATA — real product catalog from the site (samplePayload), used to
// resolve the mortgage product referenced in a request. Payment figures are
// computed locally from the input args, not read from this fixture.
// TODO: Replace MOCK_DATA with a real API call — see the TODO block below.
const ALLOWED_TERMS = [15, 20, 30];

const MOCK_DATA = [
    {
        name: 'Fixed-Rate Mortgage',
        description: 'Lock in a stable rate for 15, 20, or 30-year terms to protect against market volatility, with a 30-minute decision.',
        image_url: 'https://www.securbank.run.place/media_13d0362b5777d9597d93d6cf7be47268980f92e5b.jpg?width=1200&format=pjpg&optimize=medium',
        price: 'Rates from 5.25% APR',
        category: 'Mortgage'
    },
    {
        name: 'High Yield Savings',
        description: 'Institutional-grade savings account with automated high-yield routing, zero monthly fees, and real-time transfers.',
        image_url: 'https://www.securbank.run.place/media_1a044ecc6a78886d03194d592d1a9aa06fe0ec817.jpg?width=1200&format=pjpg&optimize=medium',
        price: '5.15% APY',
        category: 'Savings'
    },
    {
        name: 'SecurBank Premium',
        description: 'No foreign transaction fees, late fee waiver, no penalty APR, and cash back in case of robbery.',
        image_url: 'https://www.securbank.run.place/media_1d5bf5c1f6217d4e0c836372a92bca666f1a37eca.png?width=1200&format=pjpg&optimize=medium',
        price: 'No monthly fee if you spend $4,000+/period, otherwise $35/mo',
        category: 'Credit Card'
    },
    {
        name: 'SecurBank Travel Elite',
        description: 'For frequent flyers: 3x points on flights, hotels and dining, complimentary lounge access, and travel insurance.',
        price: '$25/mo',
        category: 'Credit Card'
    },
    {
        name: 'SecurBank Cashback Everyday',
        description: '5% cashback on groceries and fuel, 2% on utilities and streaming, 1% on everything else, with no rewards cap.',
        price: 'No monthly fee if you spend $1,500+/period',
        category: 'Credit Card'
    },
    {
        name: 'SecurBank Business Pro',
        description: 'Unlimited employee cards at no extra cost, 2% cashback on office supplies and software, and quarterly expense reporting.',
        price: '$15/mo',
        category: 'Credit Card'
    },
    {
        name: 'SecurBank Secured Builder',
        description: 'Rebuild or establish credit with a refundable security deposit, monthly reporting to all bureaus, and no credit history required.',
        price: 'No monthly fee',
        category: 'Credit Card'
    },
    {
        name: 'SecurBank Student Starter',
        description: 'Built for students: 1% cashback on everyday purchases, free credit score monitoring, and first-slip late-fee forgiveness.',
        price: 'No monthly fee',
        category: 'Credit Card'
    },
    {
        name: 'Adjustable Rate Mortgage (ARM)',
        description: 'Lower initial rates ideal for tactical buyers planning to move or refinance within 5-10 years.',
        image_url: 'https://www.securbank.run.place/media_1eee9f0a0f5fd8b87128d349a6be45f77fe8d80f4.jpg?width=1200&format=pjpg&optimize=medium',
        price: 'From 3.5% down payment',
        category: 'Mortgage'
    },
    {
        name: 'Jumbo Loan',
        description: 'High-value financing that exceeds conforming loan limits, with competitive rates and bespoke servicing.',
        price: 'Rates from 5.25% APR',
        category: 'Mortgage'
    }
];

module.exports = async ({ home_value, down_payment, deposit, rate, term } = {}) => {
    const effectiveDownPayment = down_payment ?? deposit;
    const numericTerm = typeof term === 'string' ? Number(term) : term;
    const missing = [];
    if (typeof home_value !== 'number' || !Number.isFinite(home_value) || home_value <= 0) missing.push('home_value');
    if (typeof effectiveDownPayment !== 'number' || !Number.isFinite(effectiveDownPayment)) missing.push('deposit');
    if (typeof rate !== 'number' || !Number.isFinite(rate)) missing.push('rate');
    if (!Number.isInteger(numericTerm) || !ALLOWED_TERMS.includes(numericTerm)) missing.push('term');

    if (missing.length > 0) {
        return {
            content: [{ type: 'text', text: `Please provide valid values for: ${missing.join(', ')}. Need home_value (USD), down_payment (%), rate (annual %), and term (years).` }],
            structuredContent: {}
        };
    }

    if (effectiveDownPayment < 3.5) {
        return {
            content: [{ type: 'text', text: 'The down payment must be at least 3.5% of the home value.' }],
            structuredContent: {}
        };
    }

    const principal = home_value - (home_value * (effectiveDownPayment / 100));
    const monthlyRate = rate / 100 / 12;
    const numPayments = numericTerm * 12;

    let monthly;
    if (monthlyRate === 0) {
        monthly = principal / numPayments;
    } else {
        const factor = Math.pow(1 + monthlyRate, numPayments);
        monthly = principal * (monthlyRate * factor) / (factor - 1);
    }

    const estimated_monthly_payment = Math.round(monthly * 100) / 100;
    const total_interest = Math.round((monthly * numPayments - principal) * 100) / 100;

    const fmt = (n) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

    return {
        content: [{ type: 'text', text: `On a ${fmt(home_value)} home with ${effectiveDownPayment}% down at ${rate}% over ${numericTerm} years, the estimated monthly payment is ${fmt(estimated_monthly_payment)}, with ${fmt(total_interest)} in total interest over the life of the loan.` }],
        // structuredContent — flat computed result matching outputSchema (widget reads keys directly, no wrapper)
        structuredContent: { estimated_monthly_payment, total_interest }
    };
};

/*
 * TODO: Replace the local calculation with a real rate/pricing API call if
 * live rates are needed (the amortization math above is standard and exact for
 * a fixed-rate loan, but current market rates and product-specific terms may
 * come from the site's API).
 *
 * Suggested endpoint pattern (update based on actual site API):
 *   GET ${process.env.API_BASE_URL}/mortgage/quote?home_value=${home_value}&down_payment=${down_payment}&rate=${rate}&term=${term}
 *
 * Environment variables to configure:
 *   API_BASE_URL   Base URL of the website's API
 *   API_KEY        API key if required (add to .env and app.config.yaml)
 *
 * Example fetch:
 *   const res = await fetch(
 *     `${process.env.API_BASE_URL}/mortgage/quote?home_value=${encodeURIComponent(home_value)}`,
 *     { headers: { 'Authorization': `Bearer ${process.env.API_KEY}` } }
 *   )
 *   if (!res.ok) throw new Error(`API error: ${res.status}`)
 *   return await res.json()
 */
