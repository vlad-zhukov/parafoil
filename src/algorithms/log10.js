/* eslint-disable no-mixed-operators */

export default {
    getPosition(value, min, max) {
        const minv = Math.log(min);
        const maxv = Math.log(max);

        const scale = (maxv - minv) / 100;

        return (Math.log(value) - minv) / scale;
    },
    getValue(pos, min, max) {
        if (pos === 0) return min;
        if (pos === 100) return max;

        const minv = Math.log(min);
        const maxv = Math.log(max);

        // calculate adjustment factor
        const scale = (maxv - minv) / 100;

        return Math.floor(Math.exp(minv + scale * pos)) || 0;
    },
};
