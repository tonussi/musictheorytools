import React, { useState, useRef, useEffect } from 'react';
import {
  GUITAR_STRING_LABELS,
  GUITAR_STRING_COUNT,
  TAB_LINE_SPACING,
  TAB_TOP_PADDING,
  NOTE_SLOT_WIDTH,
} from './musicConstants';

interface TabNoteProps {
  noteId: string;
  tabString: number | null;
  tabFret: number | null;
  slotIndex: number;
  onUpdate: (tabString: number, tabFret: number) => void;
}

const TabNote: React.FC<TabNoteProps> = ({
  noteId,
  tabString,
  tabFret,
  slotIndex,
  onUpdate,
}) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editString, setEditString] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleStringClick = (stringIndex: number) => {
    setEditString(stringIndex);
    setEditValue(tabString === stringIndex && tabFret !== null ? String(tabFret) : '');
    setEditing(true);
  };

  const handleSubmit = () => {
    const fret = parseInt(editValue, 10);
    if (!isNaN(fret) && fret >= 0 && fret <= 24) {
      onUpdate(editString, fret);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setEditing(false);
    }
  };

  const x = slotIndex * NOTE_SLOT_WIDTH + NOTE_SLOT_WIDTH / 2;

  return (
    <g className="rt-tab-note">
      {Array.from({ length: GUITAR_STRING_COUNT }, (_, si) => {
        const y = TAB_TOP_PADDING + si * TAB_LINE_SPACING;
        const isActiveString = tabString === si;
        const showFret = isActiveString && tabFret !== null;

        return (
          <g key={si} onClick={() => handleStringClick(si)} style={{ cursor: 'pointer' }}>
            {showFret && !editing && (
              <>
                <rect
                  x={x - 8}
                  y={y - 7}
                  width={16}
                  height={14}
                  className="rt-tab-fret-bg"
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className="rt-tab-fret-text"
                >
                  {tabFret}
                </text>
              </>
            )}
            {editing && editString === si && (
              <foreignObject x={x - 12} y={y - 10} width={24} height={20}>
                <input
                  ref={inputRef}
                  type="text"
                  className="rt-tab-fret-input"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={handleSubmit}
                  onKeyDown={handleKeyDown}
                  maxLength={2}
                />
              </foreignObject>
            )}
          </g>
        );
      })}
    </g>
  );
};

export default TabNote;
