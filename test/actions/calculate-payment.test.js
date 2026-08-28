const handler = require('../../actions/calculate-payment/index.js');

describe('calculate_payment handler', () => {
    test('returns content block shape on happy path', async () => {
        const out = await handler({ home_value: 450000, down_payment: 20, rate: 6.2, term: 30 });
        expect(out).toHaveProperty('content');
        expect(Array.isArray(out.content)).toBe(true);
        expect(out.content[0]).toMatchObject({ type: 'text', text: expect.any(String) });
    });

    test('"what would our monthly payment run?" returns computed payment', async () => {
        // $450k home, $90k down = 20%, 6.2% over 30 years.
        const out = await handler({ home_value: 450000, down_payment: 20, rate: 6.2, term: 30 });
        const sc = out.structuredContent;
        expect(typeof sc.estimated_monthly_payment).toBe('number');
        expect(typeof sc.total_interest).toBe('number');
        // Principal $360k at 6.2%/30yr ≈ $2,205/mo.
        expect(sc.estimated_monthly_payment).toBeGreaterThan(2150);
        expect(sc.estimated_monthly_payment).toBeLessThan(2260);
        expect(sc.total_interest).toBeGreaterThan(0);
    });

    test('structuredContent is a plain object, not a bare array', async () => {
        const out = await handler({ home_value: 450000, down_payment: 20, rate: 6.2, term: 30 });
        expect(typeof out.structuredContent).toBe('object');
        expect(Array.isArray(out.structuredContent)).toBe(false);
    });

    test('returns error message when required args are missing', async () => {
        const out = await handler({});
        expect(out.content[0].text).toMatch(/home_value|down_payment|rate|term|provide/i);
        expect(Array.isArray(out.structuredContent)).toBe(false);
    });

    test('rejects a down payment below the 3.5% minimum', async () => {
        const out = await handler({ home_value: 450000, down_payment: 2, rate: 6.2, term: 30 });
        expect(out.content[0].text).toMatch(/3\.5%|down payment/i);
        expect(out.structuredContent.estimated_monthly_payment).toBeUndefined();
    });

    test('handles a 0% interest rate without dividing by zero', async () => {
        const out = await handler({ home_value: 240000, down_payment: 10, rate: 0, term: 15 });
        // Principal $216k over 180 months = $1,200/mo, $0 interest.
        expect(out.structuredContent.estimated_monthly_payment).toBeCloseTo(1200, 0);
        expect(out.structuredContent.total_interest).toBeCloseTo(0, 0);
    });

    test('accepts supported string terms and rejects unsupported terms', async () => {
        const stringTerm = await handler({ home_value: 450000, down_payment: 20, rate: 6.2, term: '30' });
        const unsupportedTerm = await handler({ home_value: 450000, down_payment: 20, rate: 6.2, term: '25' });

        expect(stringTerm.structuredContent.estimated_monthly_payment).toBeGreaterThan(0);
        expect(unsupportedTerm.content[0].text).toMatch(/term/i);
        expect(unsupportedTerm.structuredContent).toEqual({});
    });

    test('rejects non-schema term representations', async () => {
        const stringTerm = await handler({ home_value: 450000, down_payment: 20, rate: 6.2, term: '30' });
        const unsupportedTerm = await handler({ home_value: 450000, down_payment: 20, rate: 6.2, term: 25 });

        expect(stringTerm.structuredContent.estimated_monthly_payment).toBeGreaterThan(0);
        expect(unsupportedTerm.content[0].text).toMatch(/term/i);
        expect(unsupportedTerm.structuredContent).toEqual({});
    });

    test('accepts the schema field name deposit', async () => {
        const out = await handler({ home_value: 450000, deposit: 20, rate: 6.2, term: 30 });

        expect(out.structuredContent.estimated_monthly_payment).toBeGreaterThan(0);
    });
});
