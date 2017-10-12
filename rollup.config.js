/* eslint-disable import/no-extraneous-dependencies */

import babel from 'rollup-plugin-babel';
import {list as babelHelpersList} from 'babel-helpers';
import pkg from './package.json';

const externalHelpersWhitelist = babelHelpersList.filter(helperName => helperName !== 'asyncGenerator');

export default {
    input: './src/index.js',
    plugins: [babel({externalHelpersWhitelist})],
    external: ['react'].concat(Object.keys(pkg.dependencies)),
    sourcemap: true,
    output: [
        {
            file: pkg.main,
            format: 'cjs',
        },
        {
            file: pkg.module,
            format: 'es',
        },
    ],
};
