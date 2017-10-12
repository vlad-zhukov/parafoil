const {Parafoil, algorithms} = require('../dist/parafoil.cjs');

test('import-bundle-cjs', () => {
    expect(typeof Parafoil).toBe('function');
    expect(typeof algorithms).toBe('object');
});
