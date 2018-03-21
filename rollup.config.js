import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default {
    input: './src/index.js',
    plugins: [babel()],
    external: ['react'].concat(Object.keys(pkg.dependencies)),
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true,
        },
    ],
};
