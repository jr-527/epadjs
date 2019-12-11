import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");
export function getStudies(projectId, subjectId) {
  if (mode === "lite")
    return http.get(
      apiUrl + "/projects/lite/subjects/" + subjectId + "/studies"
    );
  else
    return http.get(
      apiUrl + "/projects/" + projectId + "/subjects/" + subjectId + "/studies"
    );
}

export function downloadStudies(study) {
  const url =
    apiUrl +
    "/projects/" +
    study.projectID +
    "/subjects/" +
    study.patientID +
    "/studies/" +
    study.studyUID +
    "?format=stream&includeAims=true";
  return http.get(url, { responseType: "blob" });
}

export function deleteStudy(study) {
  if (mode === "lite") {
    const url =
      apiUrl +
      "/projects/lite/subjects/" +
      study.patientID +
      "/studies/" +
      study.studyUID;
    return http.delete(url);
  }
}

export function getStudyAims(subjectID, studyUID) {
  if (mode === "lite") {
    return http.get(
      apiUrl +
        "/projects/lite/subjects/" +
        subjectID +
        "/studies/" +
        studyUID +
        "/aims"
    );
  }
}

export function saveStudy(projectID, subjectID, abbreviation, description) {
  const url =
    apiUrl +
    "/projects/" +
    projectID +
    "/subjects/" +
    subjectID +
    "/studies/" +
    abbreviation +
    "?description=" +
    description;
  return http.put(url);
}
