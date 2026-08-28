const handler = require('../../actions/list-banking-products/index.js')

describe('list_banking_products handler', () => {
    test('content is an array with a text block', async () => {
        const out = await handler({})
        expect(out).toHaveProperty('content')
        expect(Array.isArray(out.content)).toBe(true)
        expect(out.content[0]).toMatchObject({ type: 'text', text: expect.any(String) })
    })

    test('"What mortgage and savings products does SecurBank offer for first-time buyers?" returns products', async () => {
        const out = await handler({})
        expect(out.content[0].text.length).toBeGreaterThan(0)
        expect(out.structuredContent.products.length).toBeGreaterThan(0)
    })

    test('structuredContent is a plain object, not a bare array', async () => {
        const out = await handler({})
        expect(typeof out.structuredContent).toBe('object')
        expect(Array.isArray(out.structuredContent)).toBe(false)
        expect(Array.isArray(out.structuredContent.products)).toBe(true)
    })

    test('filters by category', async () => {
        const out = await handler({ category: 'Mortgage' })
        const { products } = out.structuredContent
        expect(products.length).toBeGreaterThan(0)
        expect(products.every((p) => p.category === 'Mortgage')).toBe(true)
    })

    test('returns empty product list for a category with no matches', async () => {
        const out = await handler({ category: 'Auto Loan' })
        expect(out.structuredContent.products).toEqual([])
        expect(out.content[0].text).toMatch(/no banking products/i)
    })

    test('no category returns the full product catalog', async () => {
        const out = await handler({})
        expect(out.structuredContent.products.length).toBe(10)
    })
})
