/* eslint-disable no-mixed-operators */

export default {
    getPosition(value, min, max) {
        return (value - min) / (max - min) * 100;
    },
    getValue(pos, min, max) {
        if (pos === 0) return min;
        if (pos === 100) return max;

        const decimal = pos / 100;

        return Math.round((max - min) * decimal + min);
    },
};
