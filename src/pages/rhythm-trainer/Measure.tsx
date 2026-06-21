import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  PlacedNote,
  NoteDuration,
  NoteType,
  addNoteToMeasure,
  removeNoteFromMeasure,
  updateTabInfo,
} from '../../store/rhythmTrainerSlice';
import NoteHead from './NoteHead';
import RestSymbol from './RestSymbol';
import TabNote from './TabNote';
import { DRAG_DATA_KEY } from './NotePalette';
import {
  STAFF_LINE_SPACING,
  STAFF_TOP_PADDING,
  STAFF_HEIGHT,
  TAB_LINE_SPACING,
  TAB_TOP_PADDING,
  TAB_HEIGHT,
  NOTE_SLOT_WIDTH,
  MEASURE_MIN_WIDTH,
  CLEF_WIDTH,
  TIME_SIG_WIDTH,
  GUITAR_STRING_COUNT,
  GUITAR_STRING_LABELS,
  staffPositionToPitch,
} from './musicConstants';

interface MeasureProps {
  measureId: string;
  notes: PlacedNote[];
  showClef: boolean;
  showTimeSig: boolean;
  timeSignature: [number, number];
  selectedNoteId: string | null;
  onSelectNote: (noteId: string | null) => void;
}

const Measure: React.FC<MeasureProps> = ({
  measureId,
  notes,
  showClef,
  showTimeSig,
  timeSignature,
  selectedNoteId,
  onSelectNote,
}) => {
  const dispatch = useDispatch();
  const [dragOver, setDragOver] = useState(false);

  const prefixWidth = (showClef ? CLEF_WIDTH : 0) + (showTimeSig ? TIME_SIG_WIDTH : 0);
  const notesWidth = Math.max(notes.length + 1, 4) * NOTE_SLOT_WIDTH;
  const totalWidth = prefixWidth + notesWidth;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const raw = e.dataTransfer.getData(DRAG_DATA_KEY);
    if (!raw) return;

    const { duration, type } = JSON.parse(raw) as {
      duration: NoteDuration;
      type: NoteType;
    };

    const svgRect = e.currentTarget.getBoundingClientRect();
    const localY = e.clientY - svgRect.top;

    const halfSpacing = STAFF_LINE_SPACING / 2;
    const rawPosition = Math.round((localY - STAFF_TOP_PADDING) / halfSpacing);
    const clampedPosition = Math.max(-2, Math.min(12, rawPosition));
    const pitch = staffPositionToPitch(clampedPosition);

    dispatch(addNoteToMeasure({
      measureId,
      note: {
        type,
        duration,
        pitch: type === 'rest' ? 'B4' : pitch,
        tabString: null,
        tabFret: null,
      },
    }));
  }, [dispatch, measureId]);

  const handleNoteClick = (noteId: string) => {
    onSelectNote(selectedNoteId === noteId ? null : noteId);
  };

  const handleDeleteSelected = () => {
    if (!selectedNoteId) return;
    dispatch(removeNoteFromMeasure({ measureId, noteId: selectedNoteId }));
    onSelectNote(null);
  };

  const handleTabUpdate = (noteId: string, tabString: number, tabFret: number) => {
    dispatch(updateTabInfo({ measureId, noteId, tabString, tabFret }));
  };

  return (
    <div
      className={`rt-measure${dragOver ? ' rt-measure--drag-over' : ''}`}
      id={`measure-${measureId}`}
    >
      {/* Staff area */}
      <svg
        className="rt-measure-staff"
        width={totalWidth}
        height={STAFF_HEIGHT}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Staff lines */}
        {Array.from({ length: 5 }, (_, i) => {
          const y = STAFF_TOP_PADDING + i * STAFF_LINE_SPACING;
          return (
            <line
              key={i}
              x1={0}
              x2={totalWidth}
              y1={y}
              y2={y}
              className="rt-staff-line"
            />
          );
        })}

        {/* Treble clef */}
        {showClef && (
          <text
            x={8}
            y={STAFF_TOP_PADDING + STAFF_LINE_SPACING * 3.2}
            className="rt-treble-clef"
          >
            𝄞
          </text>
        )}

        {/* Time signature */}
        {showTimeSig && (
          <g className="rt-time-sig">
            <text
              x={showClef ? CLEF_WIDTH + 4 : 4}
              y={STAFF_TOP_PADDING + STAFF_LINE_SPACING * 1.5}
              className="rt-time-sig-num"
            >
              {timeSignature[0]}
            </text>
            <text
              x={showClef ? CLEF_WIDTH + 4 : 4}
              y={STAFF_TOP_PADDING + STAFF_LINE_SPACING * 3.5}
              className="rt-time-sig-num"
            >
              {timeSignature[1]}
            </text>
          </g>
        )}

        {/* Notes */}
        {notes.map((note, i) => {
          const x = prefixWidth + (i + 0.5) * NOTE_SLOT_WIDTH;
          if (note.type === 'rest') {
            return (
              <RestSymbol
                key={note.id}
                duration={note.duration}
                x={x}
                selected={selectedNoteId === note.id}
                onClick={() => handleNoteClick(note.id)}
              />
            );
          }
          return (
            <NoteHead
              key={note.id}
              pitch={note.pitch}
              duration={note.duration}
              x={x}
              selected={selectedNoteId === note.id}
              onClick={() => handleNoteClick(note.id)}
            />
          );
        })}

        {/* Barline */}
        <line
          x1={totalWidth - 1}
          x2={totalWidth - 1}
          y1={STAFF_TOP_PADDING}
          y2={STAFF_TOP_PADDING + 4 * STAFF_LINE_SPACING}
          className="rt-barline"
        />
      </svg>

      {/* Tablature area */}
      <svg
        className="rt-measure-tab"
        width={totalWidth}
        height={TAB_HEIGHT}
      >
        {/* TAB label */}
        {showClef && (
          <g className="rt-tab-label">
            <text x={12} y={TAB_TOP_PADDING + TAB_LINE_SPACING * 1.2} className="rt-tab-letter">T</text>
            <text x={12} y={TAB_TOP_PADDING + TAB_LINE_SPACING * 2.5} className="rt-tab-letter">A</text>
            <text x={12} y={TAB_TOP_PADDING + TAB_LINE_SPACING * 3.8} className="rt-tab-letter">B</text>
          </g>
        )}

        {/* Tab lines */}
        {Array.from({ length: GUITAR_STRING_COUNT }, (_, i) => {
          const y = TAB_TOP_PADDING + i * TAB_LINE_SPACING;
          return (
            <line
              key={i}
              x1={0}
              x2={totalWidth}
              y1={y}
              y2={y}
              className="rt-tab-line"
            />
          );
        })}

        {/* Tab fret numbers */}
        {notes.map((note, i) => {
          if (note.type === 'rest') return null;
          return (
            <TabNote
              key={note.id}
              noteId={note.id}
              tabString={note.tabString}
              tabFret={note.tabFret}
              slotIndex={i + (prefixWidth / NOTE_SLOT_WIDTH)}
              onUpdate={(ts, tf) => handleTabUpdate(note.id, ts, tf)}
            />
          );
        })}

        {/* Barline */}
        <line
          x1={totalWidth - 1}
          x2={totalWidth - 1}
          y1={TAB_TOP_PADDING}
          y2={TAB_TOP_PADDING + 5 * TAB_LINE_SPACING}
          className="rt-barline"
        />
      </svg>

      {/* Delete selected note */}
      {selectedNoteId && notes.some(n => n.id === selectedNoteId) && (
        <button
          className="rt-measure-delete-note"
          onClick={handleDeleteSelected}
          title="Delete selected note"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Measure;
