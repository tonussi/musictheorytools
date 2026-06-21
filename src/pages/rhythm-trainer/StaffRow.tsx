import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { StaffRow as StaffRowType, removeRow } from '../../store/rhythmTrainerSlice';
import Measure from './Measure';

interface StaffRowProps {
  row: StaffRowType;
  rowIndex: number;
  timeSignature: [number, number];
  isOnly: boolean;
}

const StaffRow: React.FC<StaffRowProps> = ({ row, rowIndex, timeSignature, isOnly }) => {
  const dispatch = useDispatch();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);

  const handleRemoveRow = () => {
    if (isOnly) return;
    dispatch(removeRow(row.id));
  };

  return (
    <div
      className="rt-staff-row"
      id={`staff-row-${row.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="rt-row-header">
        <span className="rt-row-number">{rowIndex + 1}</span>
        {/* Bracket */}
        <svg className="rt-row-bracket" width="12" height="100%" viewBox="0 0 12 100" preserveAspectRatio="none">
          <path
            d="M 10 2 Q 2 2 2 20 L 2 45 Q 2 50 0 50 Q 2 50 2 55 L 2 80 Q 2 98 10 98"
            fill="none"
            className="rt-bracket-path"
          />
        </svg>
      </div>

      <div className="rt-row-measures">
        {row.measures.map((measure, mi) => (
          <Measure
            key={measure.id}
            measureId={measure.id}
            notes={measure.notes}
            showClef={mi === 0}
            showTimeSig={mi === 0 && rowIndex === 0}
            timeSignature={timeSignature}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
          />
        ))}
      </div>

      {!isOnly && hovered && (
        <button
          className="rt-row-delete"
          onClick={handleRemoveRow}
          title="Remove row"
        >
          🗑
        </button>
      )}
    </div>
  );
};

export default StaffRow;
