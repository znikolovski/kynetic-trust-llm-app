const handler = require('../../actions/get-product-details/index.js');

describe('get_product_details handler', () => {
    test('content is an array of text blocks on happy path', async () => {
        const out = await handler({ product_name: 'Fixed-Rate Mortgage' });
        expect(out).toHaveProperty('content');
        expect(Array.isArray(out.content)).toBe(true);
        expect(out.content[0]).toMatchObject({ type: 'text', text: expect.any(String) });
    });

    test('"Walk me through SecurBank\'s Fixed-Rate Mortgage" returns product details', async () => {
        const out = await handler({ product_name: 'Fixed-Rate Mortgage' });
        expect(out.content[0].text).toMatch(/Fixed-Rate Mortgage/);
        expect(out.structuredContent.name).toBe('Fixed-Rate Mortgage');
        expect(out.structuredContent.price).toBe('Rates from 5.25% APR');
        expect(out.structuredContent.category).toBe('Mortgage');
    });

    test('structuredContent is a plain object, not a bare array', async () => {
        const out = await handler({ product_name: 'Fixed-Rate Mortgage' });
        expect(typeof out.structuredContent).toBe('object');
        expect(Array.isArray(out.structuredContent)).toBe(false);
    });

    test('matches a product by case-insensitive partial name', async () => {
        const out = await handler({ product_name: 'jumbo' });
        expect(out.structuredContent.name).toBe('Jumbo Loan');
    });

    test('returns error message when required arg is missing', async () => {
        const out = await handler({});
        expect(out.content[0].text).toMatch(/product_name|provide/i);
        expect(typeof out.structuredContent).toBe('object');
        expect(Array.isArray(out.structuredContent)).toBe(false);
    });

    test('unknown product returns a not-found message and empty structuredContent', async () => {
        const out = await handler({ product_name: 'Nonexistent Product XYZ' });
        expect(out.content[0].text).toMatch(/No results found/i);
        expect(out.structuredContent).toEqual({});
    });
});
