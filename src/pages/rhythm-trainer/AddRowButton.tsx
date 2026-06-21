import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addRow } from '../../store/rhythmTrainerSlice';

const AddRowButton: React.FC = () => {
  const dispatch = useDispatch();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleAddRow = () => {
    dispatch(addRow());

    requestAnimationFrame(() => {
      buttonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  };

  return (
    <div className="rt-add-row-container">
      <button
        ref={buttonRef}
        className="rt-add-row-btn"
        onClick={handleAddRow}
        id="add-row-button"
      >
        <span className="rt-add-row-icon">+</span>
        <span className="rt-add-row-label">Add New Row</span>
      </button>
    </div>
  );
};

export default AddRowButton;
