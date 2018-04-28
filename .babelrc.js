const env = process.env.BABEL_ENV || process.env.NODE_ENV;

const presets = ['@babel/preset-react', '@babel/preset-stage-3'];
const plugins = [];

if (env === 'test') {
    presets.unshift([
        '@babel/preset-env',
        {
            targets: {node: 'current'},
            loose: true,
        }
    ]);
}

if (env === 'production') {
    presets.unshift([
        '@babel/preset-env',
        {
            targets: {node: '6.6', browsers: ['> 1%']},
            modules: false,
            loose: true,
        }
    ]);
}

module.exports = {presets, plugins};
