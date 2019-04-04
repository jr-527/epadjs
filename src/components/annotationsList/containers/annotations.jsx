import React from "react";
import { connect } from "react-redux";

const annotations = ({
  seriesUID,
  studyUID,
  patient,
  handleCheck,
  patients
}) => {
  let annotationsList = [];
  const annotationsArr = Object.values(
    patients[patient].studies[studyUID].series[seriesUID].annotations
  );
  annotationsArr.forEach(ann => {
    let item = (
      <div className="-annotation__container" key={ann.aimID}>
        <div className="-annotation__checkbox">
          <input
            type="checkbox"
            name="aim"
            data-seriesid={ann.seriesUID}
            data-studyid={ann.studyUID}
            value={ann.aimID}
            onChange={handleCheck}
            checked={ann.isDisplayed}
          />
        </div>
        <span className="-annotation__title">{ann.name}</span>
      </div>
    );
    annotationsList.push(item);
  });
  return annotationsArr.length === 0 ? (
    <div className="annList-annotations">There is no annotation</div>
  ) : (
    <div className="annList-annotations">{annotationsList}</div>
  );
};

const mapStateToProps = state => {
  return {
    patients: state.annotationsListReducer.patients
  };
};
export default connect(mapStateToProps)(annotations);
