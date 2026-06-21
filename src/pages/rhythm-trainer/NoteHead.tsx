import React from 'react';
import { NoteDuration } from '../../store/rhythmTrainerSlice';
import {
  STAFF_LINE_SPACING,
  STAFF_TOP_PADDING,
  pitchToStaffPosition,
} from './musicConstants';

interface NoteHeadProps {
  pitch: string;
  duration: NoteDuration;
  x: number;
  selected: boolean;
  onClick: () => void;
}

const HEAD_RX = 5.5;
const HEAD_RY = 4;
const STEM_HEIGHT = 30;
const FLAG_WIDTH = 8;

function isFilledHead(duration: NoteDuration): boolean {
  return duration !== 'whole' && duration !== 'half';
}

function hasStem(duration: NoteDuration): boolean {
  return duration !== 'whole';
}

function flagCount(duration: NoteDuration): number {
  if (duration === 'eighth') return 1;
  if (duration === 'sixteenth') return 2;
  return 0;
}

function needsLedgerLine(position: number): boolean {
  return position <= -1 || position >= 9;
}

function getLedgerLinePositions(position: number): number[] {
  const lines: number[] = [];
  if (position >= 10) {
    for (let p = 10; p <= position; p += 2) {
      lines.push(p);
    }
  }
  if (position <= -2) {
    for (let p = -2; p >= position; p -= 2) {
      lines.push(p);
    }
  }
  return lines;
}

const NoteHead: React.FC<NoteHeadProps> = ({ pitch, duration, x, selected, onClick }) => {
  const position = pitchToStaffPosition(pitch);
  const cy = STAFF_TOP_PADDING + position * (STAFF_LINE_SPACING / 2);
  const filled = isFilledHead(duration);
  const showStem = hasStem(duration);
  const flags = flagCount(duration);
  const ledgerLines = needsLedgerLine(position) ? getLedgerLinePositions(position) : [];

  const stemUp = position >= 4;
  const stemX = stemUp ? x + HEAD_RX : x - HEAD_RX;
  const stemY1 = cy;
  const stemY2 = stemUp ? cy - STEM_HEIGHT : cy + STEM_HEIGHT;

  return (
    <g
      className={`rt-notehead${selected ? ' rt-notehead--selected' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {ledgerLines.map(lp => {
        const ly = STAFF_TOP_PADDING + lp * (STAFF_LINE_SPACING / 2);
        return (
          <line
            key={lp}
            x1={x - HEAD_RX - 4}
            x2={x + HEAD_RX + 4}
            y1={ly}
            y2={ly}
            className="rt-ledger-line"
          />
        );
      })}

      <ellipse
        cx={x}
        cy={cy}
        rx={HEAD_RX}
        ry={HEAD_RY}
        className={`rt-notehead-ellipse${filled ? ' filled' : ' hollow'}`}
        transform={`rotate(-10, ${x}, ${cy})`}
      />

      {showStem && (
        <line
          x1={stemX}
          x2={stemX}
          y1={stemY1}
          y2={stemY2}
          className="rt-stem"
        />
      )}

      {flags > 0 && (
        <g className="rt-flags">
          {Array.from({ length: flags }, (_, i) => {
            const flagY = stemUp
              ? stemY2 + i * 8
              : stemY2 - i * 8;
            const flagDir = stemUp ? 1 : -1;
            return (
              <path
                key={i}
                d={`M ${stemX} ${flagY} q ${FLAG_WIDTH} ${flagDir * 4} ${FLAG_WIDTH * 0.5} ${flagDir * 14}`}
                className="rt-flag"
              />
            );
          })}
        </g>
      )}
    </g>
  );
};

export default NoteHead;
