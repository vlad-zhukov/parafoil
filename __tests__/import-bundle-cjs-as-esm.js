import {Parafoil, algorithms} from '../dist/parafoil.cjs';

test('import-bundle-cjs-as-esm', () => {
    expect(typeof Parafoil).toBe('function');
    expect(typeof algorithms).toBe('object');
});
