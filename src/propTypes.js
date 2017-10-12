import React from 'react';
import PropTypes from 'prop-types';
import * as SliderConstants from './constants';
import linear from './algorithms/linear';

const PropTypeArrOfNumber = PropTypes.arrayOf(PropTypes.number);
const PropTypeReactComponent = PropTypes.oneOfType([PropTypes.func, PropTypes.string]);

export const propTypes = {
    // the algorithm to use
    algorithm: PropTypes.shape({
        getValue: PropTypes.func,
        getPosition: PropTypes.func,
    }),
    // any children you pass in
    children: PropTypes.node,
    // standard class name you'd like to apply to the root element
    className: PropTypes.string,
    classNameBackground: PropTypes.string,
    classNameHandle: PropTypes.string,
    classNameProgress: PropTypes.string,
    // prevent the slider from moving when clicked
    disabled: PropTypes.bool,
    // a custom handle you can pass in
    handle: PropTypeReactComponent,
    // the maximum possible value
    max: PropTypes.number,
    // the minimum possible value
    min: PropTypes.number,
    // called on click
    onClick: PropTypes.func,
    // called whenever the user is done changing values on the slider
    onChange: PropTypes.func,
    // called on key press
    onKeyPress: PropTypes.func,
    // called when you finish dragging a handle
    onSliderDragEnd: PropTypes.func,
    // called every time the slider is dragged and the value changes
    onSliderDragMove: PropTypes.func,
    // called when you start dragging a handle
    onSliderDragStart: PropTypes.func,
    // called whenever the user is actively changing the values on the slider
    // (dragging, clicked, keypress)
    onValuesUpdated: PropTypes.func,
    // the orientation
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
    // a component for rendering the pits
    pitComponent: PropTypeReactComponent,
    // the points that pits are rendered on
    pitPoints: PropTypeArrOfNumber,
    // a custom progress bar you can pass in
    progressBar: PropTypeReactComponent,
    // should we snap?
    snap: PropTypes.bool,
    // the points we should snap to
    snapPoints: PropTypeArrOfNumber,
    // the values
    values: PropTypeArrOfNumber,
};

export const defaultProps = {
    algorithm: linear,
    className: '',
    classNameBackground: '',
    classNameHandle: '',
    classNameProgress: '',
    children: null,
    disabled: false,
    handle: props => <button {...props} type="button" />,
    max: SliderConstants.PERCENT_FULL,
    min: SliderConstants.PERCENT_EMPTY,
    onClick: null,
    onChange: null,
    onKeyPress: null,
    onSliderDragEnd: null,
    onSliderDragMove: null,
    onSliderDragStart: null,
    onValuesUpdated: null,
    orientation: 'horizontal',
    pitComponent: null,
    pitPoints: [],
    progressBar: 'div',
    snap: false,
    snapPoints: [],
    values: [SliderConstants.PERCENT_EMPTY],
};
