import {Parafoil, algorithms} from '../dist/parafoil.esm';

test('import-bundle-esm', () => {
    expect(typeof Parafoil).toBe('function');
    expect(typeof algorithms).toBe('object');
});
