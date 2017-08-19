import React from 'react';
import PropTypes from 'prop-types';
import { WrapperStyled } from './styles/WrapperStyled';
import { DataFlowArrowStyled } from './styles/DataFlowArrowStyled';
import { ArrowStyled } from './styles/ArrowStyled';
import { PathStyled } from './styles/PathStyled';
import constants from '../styles/constants';

const propTypes = {
  start: PropTypes.arrayOf({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  end: PropTypes.arrayOf({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  colorScheme: PropTypes.oneOf([
    'default',
    'string',
    'bool',
    'number',
    'array',
    'object',
  ]),
  focused: PropTypes.bool,
};

const defaultProps = {
  start: { x: 0, y: 0 },
  end: { x: 200, y: 150 },
  colorScheme: 'default',
  focused: false,
};

// Docs https://developer.mozilla.org/ru/docs/Web/SVG/Tutorial/Paths
export const DataFlowArrow = props => {
  const width = Math.abs(props.end.x - props.start.x);
  const height = Math.abs(props.end.y - props.start.y);
  const color = constants.color[props.colorScheme];
  const strokeWidth = props.focused ? 3 : 2;
  const xPositive = props.start.x < props.end.x;
  const yPositive = props.start.y < props.end.y;
  const xMin = xPositive ? props.start.x : props.end.x;
  const yMin = yPositive ? props.start.y : props.end.y;
  const transformX = !xPositive ? 'scaleX(-1)' : '';
  const transformY = !yPositive ? 'scaleY(-1)' : '';
  
  const pathStyles = {
    width: `${width}px`,
    height: `${height}px`,
    top: `${yMin}px`,
    left: `${xMin}px`,
    transform: `${transformX} ${transformY}`,
  };
  
  const arHeight = 14;
  const arWidth = 20;
  const arGroove = 3;
  const arNarrow = arWidth - arGroove;
  
  const arrow = (
    <ArrowStyled
      fill={color}
      points={`
        ${width} ${height - arHeight / 2},
        ${width - arWidth} ${height - arHeight},
        ${width - arNarrow} ${height - arHeight / 2},
        ${width - arWidth} ${height}
      `}
    />
  );
  
  const curveShoulder = width / 5;
  const centerX = (width - arNarrow) / 2;
  const centerY = (height - strokeWidth + arHeight) / 2;
  const pathXStart = curveShoulder;
  const pathYStart = strokeWidth / 2;
  const pathXEnd = width - arNarrow;
  const pathYEnd = height - arHeight / 2;
  const startCurve = `10 ${pathYStart} Q${pathXStart} ${pathYStart} ${centerX} ${centerY}`;
  const endCurve = `T${pathXEnd} ${pathYEnd}`;
  
  return (
    <DataFlowArrowStyled style={pathStyles}>
      <WrapperStyled
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g>
          ${arrow}
          <PathStyled
            strokeWidth={strokeWidth}
            stroke={color}
            d={`M0 ${strokeWidth / 2} ${startCurve} ${endCurve}`}
          />
        </g>
      </WrapperStyled>
    </DataFlowArrowStyled>
  );
};

DataFlowArrow.displayName = 'DataFlowArrow';
DataFlowArrow.propTypes = propTypes;
DataFlowArrow.defaultProps = defaultProps;
