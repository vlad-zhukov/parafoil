/* eslint-disable no-mixed-operators */

import React from 'react';
import {getHandleFor, killEvent, stepMultiplier} from './helpers';
import * as SliderConstants from './constants';
import {propTypes, defaultProps} from './propTypes';

export default class Parafoil extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {algorithm, max, min, values} = props;
        this.state = {
            handlePos: values.map(value => algorithm.getPosition(value, min, max)),
            handleDimensions: 0,
            sliderBox: {},
            slidingIndex: null,
            values,
        };
    }

    componentWillReceiveProps(nextProps) {
        const {disabled, min, max} = this.props;
        const {values, slidingIndex} = this.state;

        const minMaxChanged = nextProps.min !== min || nextProps.max !== max;

        const valuesChanged =
            values.length !== nextProps.values.length || values.some((value, idx) => nextProps.values[idx] !== value);

        const willBeDisabled = nextProps.disabled && !disabled;

        if (minMaxChanged || valuesChanged) {
            this.updateNewValues(nextProps);
        }

        if (willBeDisabled && slidingIndex !== null) {
            this.endSlide();
        }
    }

    getPublicState = () => {
        const {min, max} = this.props;
        const {values} = this.state;

        return {max, min, values};
    };

    getSliderBoundingBox = () => {
        const node = this.parafoil.getDOMNode ? this.parafoil.getDOMNode() : this.parafoil;
        const rect = node.getBoundingClientRect();

        return {
            height: rect.height || node.clientHeight,
            left: rect.left,
            top: rect.top,
            width: rect.width || node.clientWidth,
        };
    };

    getProgressStyle = (idx) => {
        const {handlePos} = this.state;

        const value = handlePos[idx];

        if (idx === 0) {
            return this.props.orientation === 'vertical' ? {height: `${value}%`} : {width: `${value}%`};
        }

        const prevValue = handlePos[idx - 1];
        const diffValue = value - prevValue;

        return this.props.orientation === 'vertical'
            ? {height: `${diffValue}%`, top: `${prevValue}%`}
            : {left: `${prevValue}%`, width: `${diffValue}%`};
    };

    getMinValue = (idx) => {
        const {values} = this.state;
        const {min} = this.props;
        return values[idx - 1] ? Math.max(min, values[idx - 1]) : min;
    };

    getMaxValue = (idx) => {
        const {values} = this.state;
        const {max} = this.props;
        return values[idx + 1] ? Math.min(max, values[idx + 1]) : max;
    };

    getHandleDimensions = (ev, sliderBox) => {
        const handleNode = ev.currentTarget || null;

        if (!handleNode) return 0;

        return this.props.orientation === 'vertical'
            ? handleNode.clientHeight / sliderBox.height * SliderConstants.PERCENT_FULL / 2
            : handleNode.clientWidth / sliderBox.width * SliderConstants.PERCENT_FULL / 2;
    };

    getClosestSnapPoint = (value) => {
        const {snapPoints} = this.props;

        if (!snapPoints.length) {
            return value;
        }

        return snapPoints.reduce((snapTo, snap) => {
            if (Math.abs(snapTo - value) < Math.abs(snap - value)) {
                return snapTo;
            }
            return snap;
        });
    };

    getSnapPosition = (positionPercent) => {
        if (!this.props.snap) {
            return positionPercent;
        }

        const {algorithm, max, min} = this.props;

        const value = algorithm.getValue(positionPercent, min, max);
        const snapValue = this.getClosestSnapPoint(value);
        return algorithm.getPosition(snapValue, min, max);
    };

    getNextPositionForKey = (idx, keyCode) => {
        const {handlePos, values} = this.state;
        const {algorithm, max, min, snapPoints} = this.props;

        const shouldSnap = this.props.snap;

        let proposedValue = values[idx];
        let proposedPercentage = handlePos[idx];
        const originalPercentage = proposedPercentage;
        let stepValue = 1;

        if (max >= 100) {
            proposedPercentage = Math.round(proposedPercentage);
        }
        else {
            stepValue = 100 / (max - min);
        }

        let currentIndex = null;

        if (shouldSnap) {
            currentIndex = snapPoints.indexOf(this.getClosestSnapPoint(values[idx]));
        }

        if (stepMultiplier[keyCode]) {
            proposedPercentage += stepMultiplier[keyCode](stepValue);

            if (shouldSnap) {
                if (proposedPercentage > originalPercentage) {
                    // move cursor right unless overflow
                    if (currentIndex < snapPoints.length - 1) {
                        proposedValue = snapPoints[currentIndex + 1];
                    }
                    // move cursor left unless there is overflow
                }
                else if (currentIndex > 0) {
                    proposedValue = snapPoints[currentIndex - 1];
                }
            }
        }
        else if (keyCode === SliderConstants.KEYS.HOME) {
            proposedPercentage = SliderConstants.PERCENT_EMPTY;

            if (shouldSnap) {
                [proposedValue] = snapPoints;
            }
        }
        else if (keyCode === SliderConstants.KEYS.END) {
            proposedPercentage = SliderConstants.PERCENT_FULL;

            if (shouldSnap) {
                proposedValue = snapPoints[snapPoints.length - 1];
            }
        }
        else {
            return null;
        }

        return shouldSnap ? algorithm.getPosition(proposedValue, min, max) : proposedPercentage;
    };

    getNextState = (idx, proposedPosition) => {
        const {handlePos} = this.state;
        const {max, min} = this.props;

        const actualPosition = this.validatePosition(idx, proposedPosition);

        const nextHandlePos = handlePos.map((pos, index) => (index === idx ? actualPosition : pos));

        return {
            handlePos: nextHandlePos,
            values: nextHandlePos.map(pos => this.props.algorithm.getValue(pos, min, max)),
        };
    };

    getClosestHandle = (positionPercent) => {
        const {handlePos} = this.state;

        return handlePos.reduce((closestIdx, node, idx) => {
            const challenger = Math.abs(handlePos[idx] - positionPercent);
            const current = Math.abs(handlePos[closestIdx] - positionPercent);
            return challenger < current ? idx : closestIdx;
        }, 0);
    };

    setStartSlide = (ev) => {
        const sliderBox = this.getSliderBoundingBox();

        this.setState({
            handleDimensions: this.getHandleDimensions(ev, sliderBox),
            sliderBox,
            slidingIndex: getHandleFor(ev),
        });
    };

    setRef = (ref) => {
        this.parafoil = ref;
    };

    startMouseSlide = (ev) => {
        if (this.props.disabled === true) {
            return;
        }

        this.setStartSlide(ev, ev.clientX, ev.clientY);

        if (typeof document.addEventListener === 'function') {
            document.addEventListener('mousemove', this.handleMouseSlide, false);
            document.addEventListener('mouseup', this.endSlide, false);
        }
        else {
            document.attachEvent('onmousemove', this.handleMouseSlide);
            document.attachEvent('onmouseup', this.endSlide);
        }

        killEvent(ev);
    };

    startTouchSlide = (ev) => {
        if (this.props.disabled === true) {
            return;
        }

        if (ev.changedTouches.length > 1) return;

        const touch = ev.changedTouches[0];

        this.setStartSlide(ev, touch.clientX, touch.clientY);

        document.addEventListener('touchmove', this.handleTouchSlide, false);
        document.addEventListener('touchend', this.endSlide, false);

        if (this.props.onSliderDragStart) this.props.onSliderDragStart();

        killEvent(ev);
    };

    handleMouseSlide = (ev) => {
        if (this.state.slidingIndex === null) return;
        this.handleSlide(ev.clientX, ev.clientY);
        killEvent(ev);
    };

    handleTouchSlide = (ev) => {
        if (this.state.slidingIndex === null) return;

        if (ev.changedTouches.length > 1) {
            this.endSlide();
            return;
        }

        const touch = ev.changedTouches[0];

        this.handleSlide(touch.clientX, touch.clientY);
        killEvent(ev);
    };

    handleSlide = (x, y) => {
        const {slidingIndex: idx, sliderBox} = this.state;
        const {orientation, onSliderDragMove} = this.props;

        const positionPercent =
            orientation === 'vertical'
                ? (y - sliderBox.top) / sliderBox.height * SliderConstants.PERCENT_FULL
                : (x - sliderBox.left) / sliderBox.width * SliderConstants.PERCENT_FULL;

        this.slideTo(idx, positionPercent);

        if (this.canMove(idx, positionPercent)) {
            if (onSliderDragMove) onSliderDragMove();
        }
    };

    endSlide = () => {
        const {slidingIndex: idx, handlePos} = this.state;
        const {onSliderDragEnd, snap} = this.props;

        this.setState({slidingIndex: null});

        if (typeof document.removeEventListener === 'function') {
            document.removeEventListener('mouseup', this.endSlide, false);
            document.removeEventListener('touchend', this.endSlide, false);
            document.removeEventListener('touchmove', this.handleTouchSlide, false);
            document.removeEventListener('mousemove', this.handleMouseSlide, false);
        }
        else {
            document.detachEvent('onmousemove', this.handleMouseSlide);
            document.detachEvent('onmouseup', this.endSlide);
        }

        if (onSliderDragEnd) onSliderDragEnd();
        if (snap) {
            const positionPercent = this.getSnapPosition(handlePos[idx]);
            this.slideTo(idx, positionPercent, () => this.fireChangeEvent());
        }
        else {
            this.fireChangeEvent();
        }
    };

    handleClick = (ev) => {
        if (this.props.disabled === true || ev.target.getAttribute('data-handle-key')) {
            return;
        }

        // Calculate the position of the slider on the page so we can determine
        // the position where you click in relativity.
        const sliderBox = this.getSliderBoundingBox();

        const positionDecimal =
            this.props.orientation === 'vertical'
                ? (ev.clientY - sliderBox.top) / sliderBox.height
                : (ev.clientX - sliderBox.left) / sliderBox.width;

        const positionPercent = positionDecimal * SliderConstants.PERCENT_FULL;

        const handleId = this.getClosestHandle(positionPercent);

        const validPositionPercent = this.getSnapPosition(positionPercent);

        // Move the handle there
        this.slideTo(handleId, validPositionPercent, () => this.fireChangeEvent());

        if (this.props.onClick) this.props.onClick();
    };

    handleKeydown = (ev) => {
        if (this.props.disabled === true) {
            return;
        }

        const idx = getHandleFor(ev);

        if (ev.keyCode === SliderConstants.KEYS.ESC) {
            ev.currentTarget.blur();
            return;
        }

        const proposedPercentage = this.getNextPositionForKey(idx, ev.keyCode);

        if (proposedPercentage === null) return;

        if (this.canMove(idx, proposedPercentage)) {
            this.slideTo(idx, proposedPercentage, () => this.fireChangeEvent());
            if (this.props.onKeyPress) this.props.onKeyPress();
        }

        killEvent(ev);
    };

    // Make sure the proposed position respects the bounds and
    // does not collide with other handles too much.
    validatePosition = (idx, proposedPosition) => {
        const {handlePos, handleDimensions} = this.state;

        const handlePosMax = handlePos[idx + 1];
        const handlePosMin = handlePos[idx - 1];

        const minv = Math.min(
            proposedPosition,
            // 100% is the highest value
            handlePosMax !== undefined ? handlePosMax - handleDimensions : SliderConstants.PERCENT_FULL
        );

        return Math.max(
            minv,
            // 0% is the lowest value
            handlePosMin !== undefined ? handlePosMin + handleDimensions : SliderConstants.PERCENT_EMPTY
        );
    };

    validateValues = (proposedValues, props) => {
        const {max, min} = props || this.props;

        return proposedValues.map((value, idx, values) => {
            const realValue = Math.max(Math.min(value, max), min);

            if (values.length && realValue < values[idx - 1]) {
                return values[idx - 1];
            }

            return realValue;
        });
    };

    // Can we move the slider to the given position?
    canMove = (idx, proposedPosition) => {
        const {handlePos, handleDimensions} = this.state;

        if (proposedPosition < SliderConstants.PERCENT_EMPTY) return false;
        if (proposedPosition > SliderConstants.PERCENT_FULL) return false;

        const nextHandlePosition = handlePos[idx + 1] !== undefined ? handlePos[idx + 1] - handleDimensions : Infinity;

        if (proposedPosition > nextHandlePosition) return false;

        const prevHandlePosition = handlePos[idx - 1] !== undefined ? handlePos[idx - 1] + handleDimensions : -Infinity;

        if (proposedPosition < prevHandlePosition) return false;

        return true;
    };

    fireChangeEvent = () => {
        const {onChange} = this.props;
        if (onChange) onChange(this.getPublicState());
    };

    slideTo = (idx, proposedPosition, onAfterSet) => {
        const nextState = this.getNextState(idx, proposedPosition);

        this.setState(nextState, () => {
            const {onValuesUpdated} = this.props;
            if (onValuesUpdated) onValuesUpdated(this.getPublicState());
            if (onAfterSet) onAfterSet();
        });
    };

    updateNewValues = (nextProps) => {
        const {slidingIndex} = this.state;

        // Don't update while the slider is sliding
        if (slidingIndex !== null) {
            return;
        }

        const {max, min, values} = nextProps;
        const {algorithm} = this.props;

        const nextValues = this.validateValues(values, nextProps);

        this.setState(
            {
                handlePos: nextValues.map(value => algorithm.getPosition(value, min, max)),
                values: nextValues,
            },
            () => this.fireChangeEvent()
        );
    };

    render() {
        const {
            algorithm,
            children,
            disabled,
            handle: Handle,
            max,
            min,
            orientation,
            pitComponent: PitComponent,
            pitPoints,
            progressBar: ProgressBar,
            className,
            classNameBackground,
            classNameHandle,
            classNameProgress,
        } = this.props;
        const {handlePos, values} = this.state;

        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div className={className} ref={this.setRef} onClick={this.handleClick} role="presentation">
                <div className={classNameBackground} />
                {handlePos.map((pos, idx) => {
                    const handleStyle = orientation === 'vertical' ? {top: `${pos}%`} : {left: `${pos}%`};
                    return (
                        <Handle
                            aria-valuemax={this.getMaxValue(idx)}
                            aria-valuemin={this.getMinValue(idx)}
                            aria-valuenow={values[idx]}
                            aria-disabled={disabled}
                            data-handle-key={idx}
                            className={classNameHandle}
                            key={`handle-${idx}`} // eslint-disable-line react/no-array-index-key
                            onClick={this.killEvent}
                            onKeyDown={this.handleKeydown}
                            onMouseDown={this.startMouseSlide}
                            onTouchStart={this.startTouchSlide}
                            role="slider"
                            style={handleStyle}
                            tabIndex={0}
                        />
                    );
                })}
                {handlePos.map((node, idx, arr) => {
                    if (idx === 0 && arr.length > 1) {
                        return null;
                    }
                    return (
                        <ProgressBar
                            className={classNameProgress}
                            key={`progress-bar-${idx}`} // eslint-disable-line react/no-array-index-key
                            style={this.getProgressStyle(idx)}
                        />
                    );
                })}
                {PitComponent &&
                    pitPoints.map((n) => {
                        const pos = algorithm.getPosition(n, min, max);
                        const pitStyle = orientation === 'vertical' ? {top: `${pos}%`} : {left: `${pos}%`};
                        return (
                            <PitComponent key={`pit-${n}`} style={pitStyle}>
                                {n}
                            </PitComponent>
                        );
                    })}
                {children}
            </div>
        );
    }
}
