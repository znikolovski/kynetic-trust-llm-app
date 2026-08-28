// TODO: Replace MOCK_DATA with a real API call.
// See the TODO block below the handler for endpoint details.
const MOCK_DATA = [
    {
        name: 'Fixed-Rate Mortgage',
        description: 'Lock in a stable rate for 15, 20, or 30-year terms to protect against market volatility, with a 30-minute decision.',
        image_url: 'https://www.securbank.run.place/media_13d0362b5777d9597d93d6cf7be47268980f92e5b.jpg?width=1200&format=pjpg&optimize=medium',
        price: 'Rates from 5.25% APR',
        category: 'Mortgage',
    },
    {
        name: 'High Yield Savings',
        description: 'Institutional-grade savings account with automated high-yield routing, zero monthly fees, and real-time transfers.',
        image_url: 'https://www.securbank.run.place/media_1a044ecc6a78886d03194d592d1a9aa06fe0ec817.jpg?width=1200&format=pjpg&optimize=medium',
        price: '5.15% APY',
        category: 'Savings',
    },
    {
        name: 'SecurBank Premium',
        description: 'No foreign transaction fees, late fee waiver, no penalty APR, and cash back in case of robbery.',
        image_url: 'https://www.securbank.run.place/media_1d5bf5c1f6217d4e0c836372a92bca666f1a37eca.png?width=1200&format=pjpg&optimize=medium',
        price: 'No monthly fee if you spend $4,000+/period, otherwise $35/mo',
        category: 'Credit Card',
    },
    {
        name: 'SecurBank Travel Elite',
        description: 'For frequent flyers: 3x points on flights, hotels and dining, complimentary lounge access, and travel insurance.',
        price: '$25/mo',
        category: 'Credit Card',
    },
    {
        name: 'SecurBank Cashback Everyday',
        description: '5% cashback on groceries and fuel, 2% on utilities and streaming, 1% on everything else, with no rewards cap.',
        price: 'No monthly fee if you spend $1,500+/period',
        category: 'Credit Card',
    },
    {
        name: 'SecurBank Business Pro',
        description: 'Unlimited employee cards at no extra cost, 2% cashback on office supplies and software, and quarterly expense reporting.',
        price: '$15/mo',
        category: 'Credit Card',
    },
    {
        name: 'SecurBank Secured Builder',
        description: 'Rebuild or establish credit with a refundable security deposit, monthly reporting to all bureaus, and no credit history required.',
        price: 'No monthly fee',
        category: 'Credit Card',
    },
    {
        name: 'SecurBank Student Starter',
        description: 'Built for students: 1% cashback on everyday purchases, free credit score monitoring, and first-slip late-fee forgiveness.',
        price: 'No monthly fee',
        category: 'Credit Card',
    },
    {
        name: 'Adjustable Rate Mortgage (ARM)',
        description: 'Lower initial rates ideal for tactical buyers planning to move or refinance within 5-10 years.',
        image_url: 'https://www.securbank.run.place/media_1eee9f0a0f5fd8b87128d349a6be45f77fe8d80f4.jpg?width=1200&format=pjpg&optimize=medium',
        price: 'From 3.5% down payment',
        category: 'Mortgage',
    },
    {
        name: 'Jumbo Loan',
        description: 'High-value financing that exceeds conforming loan limits, with competitive rates and bespoke servicing.',
        price: 'Rates from 5.25% APR',
        category: 'Mortgage',
    },
]

module.exports = async ({ category = '' } = {}) => {
    const filterCategory = typeof category === 'string' ? category.trim() : ''

    const results = MOCK_DATA.filter((item) => {
        if (filterCategory && item.category !== filterCategory) return false
        return true
    })

    if (results.length === 0) {
        return {
            content: [{ type: 'text', text: `No banking products found${filterCategory ? ` in the "${filterCategory}" category` : ''}.` }],
            // structuredContent.products — derived from action name "list_banking_products" (bare array outputSchema rule)
            structuredContent: { products: [] },
        }
    }

    const summary = filterCategory
        ? `Found ${results.length} SecurBank ${filterCategory} product${results.length === 1 ? '' : 's'}.`
        : `Found ${results.length} SecurBank banking products across mortgages, savings, and credit cards.`

    return {
        content: [{ type: 'text', text: summary }],
        // structuredContent.products — derived from action name "list_banking_products" (bare array outputSchema rule)
        structuredContent: { products: results },
    }
}

/*
 * TODO: Replace MOCK_DATA with a real API call.
 *
 * Suggested endpoint pattern (update based on actual site API):
 *   GET ${process.env.API_BASE_URL}/products?category=${category}
 *
 * Environment variables to configure:
 *   API_BASE_URL   Base URL of the website's API
 *   API_KEY        API key if required (add to .env and app.config.yaml)
 *
 * Authentication: check the website's developer docs or network requests
 *   captured during browsing for the correct auth header pattern.
 *
 * Example fetch:
 *   const res = await fetch(
 *     `${process.env.API_BASE_URL}/products?category=${encodeURIComponent(category)}`,
 *     { headers: { 'Authorization': `Bearer ${process.env.API_KEY}` } }
 *   )
 *   if (!res.ok) throw new Error(`API error: ${res.status}`)
 *   return await res.json()
 */
