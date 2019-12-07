import React from "react";
import { FaTimes } from "react-icons/fa";

const tagRequirements = ({ onClose, requirements, handleInput }) => {
  return (
    <div className="tagRequirements">
      <div className="tagRequirements">
        <div className="tagRequirements__title">Define Requirements</div>
        <div className="menu-clickable" onClick={onClose}>
          <FaTimes />
        </div>
      </div>
      <ul className="tagRequirements__list">
        <div>
          <input
            type="checkbox"
            className="requirement-select__all"
            name="RequireAll"
            onChange={handleInput}
            checked={requirements.length === 6}
          />
          Select All
        </div>
        <div>
          <input
            type="checkbox"
            className="requirement-select"
            name="PatientID"
            onChange={handleInput}
            checked={requirements.includes("PatientID")}
          />
          Patient ID
        </div>
        <div>
          <input
            type="checkbox"
            className="requirement-select"
            name="PatientName"
            onChange={handleInput}
            checked={requirements.includes("PatientName")}
          />
          Patient Name
        </div>
        <div>
          <input
            type="checkbox"
            className="requirement-select"
            name="StudyInstanceUID"
            onChange={handleInput}
            checked={requirements.includes("StudyInstanceUID")}
          />
          Study UID
        </div>
        <div>
          <input
            type="checkbox"
            className="requirement-select"
            name="StudyDescription"
            onChange={handleInput}
            checked={requirements.includes("StudyDescription")}
          />
          Study Description
        </div>
        <div>
          <input
            type="checkbox"
            className="requirement-select"
            name="SeriesInstanceUID"
            onChange={handleInput}
            checked={requirements.includes("SeriesInstanceUID")}
          />
          Series UID
        </div>
        <div>
          <input
            type="checkbox"
            className="requirement-select"
            name="SeriesDescription"
            onChange={handleInput}
            checked={requirements.includes("SeriesDescription")}
          />
          Series Description
        </div>
      </ul>
    </div>
  );
};

export default tagRequirements;
