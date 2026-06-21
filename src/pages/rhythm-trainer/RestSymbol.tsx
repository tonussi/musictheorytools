import React from 'react';
import { NoteDuration } from '../../store/rhythmTrainerSlice';
import {
  STAFF_LINE_SPACING,
  STAFF_TOP_PADDING,
} from './musicConstants';

interface RestSymbolProps {
  duration: NoteDuration;
  x: number;
  selected: boolean;
  onClick: () => void;
}

const STAFF_CENTER_Y = STAFF_TOP_PADDING + 2 * STAFF_LINE_SPACING;

const RestSymbol: React.FC<RestSymbolProps> = ({ duration, x, selected, onClick }) => {
  const renderRest = () => {
    switch (duration) {
      case 'whole':
        return (
          <rect
            x={x - 8}
            y={STAFF_TOP_PADDING + STAFF_LINE_SPACING - 5}
            width={16}
            height={5}
            className="rt-rest-shape"
          />
        );
      case 'half':
        return (
          <rect
            x={x - 8}
            y={STAFF_TOP_PADDING + 2 * STAFF_LINE_SPACING}
            width={16}
            height={5}
            className="rt-rest-shape"
          />
        );
      case 'quarter':
        return (
          <path
            d={`M ${x - 3} ${STAFF_CENTER_Y - 12}
                l 6 8 l -6 8 l 6 8 l -6 8`}
            className="rt-rest-path"
          />
        );
      case 'eighth':
        return (
          <g>
            <circle cx={x + 2} cy={STAFF_CENTER_Y - 4} r={2.5} className="rt-rest-shape" />
            <line
              x1={x + 2} y1={STAFF_CENTER_Y - 4}
              x2={x - 4} y2={STAFF_CENTER_Y + 12}
              className="rt-rest-line"
            />
          </g>
        );
      case 'sixteenth':
        return (
          <g>
            <circle cx={x + 2} cy={STAFF_CENTER_Y - 8} r={2.5} className="rt-rest-shape" />
            <circle cx={x + 2} cy={STAFF_CENTER_Y} r={2.5} className="rt-rest-shape" />
            <line
              x1={x + 2} y1={STAFF_CENTER_Y - 8}
              x2={x - 4} y2={STAFF_CENTER_Y + 12}
              className="rt-rest-line"
            />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <g
      className={`rt-rest${selected ? ' rt-rest--selected' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {renderRest()}
    </g>
  );
};

export default RestSymbol;
