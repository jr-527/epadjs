import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import ParametersForProjectWindow from "./parametersForProjectWindow";
class PluginProjectWindow extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    showparamswindow: false,
    pluginid: null,
    projectid: null,
  };

  handleShowParamatersWindow = (projectid, seldata) => {
    console.log(" project id :", projectid);
    console.log(" pluginid", seldata.original.id);
    this.setState({
      showparamswindow: true,
      pluginid: seldata.original.id,
      projectid: projectid,
    });
  };
  handleParameterCancel = () => {
    this.setState({ showparamswindow: false });
  };
  populateRows = () => {
    let rows = [];

    this.props.allProjects.forEach((project) => {
      rows.push(
        <tr key={project.id} className="edit-userRole__table--row">
          <td>
            <input
              type="checkbox"
              value={project.id}
              name={project.name}
              defaultChecked={
                project.id === this.props.selectedProjectsAsMap.get(project.id)
              }
              onChange={() => {
                this.props.onChange(project.id, this.props.tableSelectedData);
              }}
            />
          </td>
          <td>{project.name}</td>
          <td>
            <div
              onClick={() => {
                this.handleShowParamatersWindow(
                  project.id,
                  this.props.tableSelectedData
                );
              }}
            >
              &nbsp; params
            </div>
          </td>
        </tr>
      );
    });
    return rows;
  };

  render() {
    return (
      <div className="plugin_project_container">
        <Modal.Dialog dialogClassName="pluginproject_modal">
          <Modal.Header>
            <Modal.Title>Projects</Modal.Title>
          </Modal.Header>
          <Modal.Body className="create-user__modal --body">
            <table>
              <thead>
                <tr>
                  <th className="user-table__header--user">add/remove</th>
                  <th className="user-table__header">project</th>
                </tr>
              </thead>
              <tbody>{this.populateRows()}</tbody>
            </table>
          </Modal.Body>

          <Modal.Footer className="create-user__modal--footer">
            <div className="create-user__modal--buttons">
              <button
                variant="primary"
                className="btn btn-sm btn-outline-light"
                onClick={this.props.onSave}
              >
                Submit
              </button>
              <button
                variant="secondary"
                className="btn btn-sm btn-outline-light"
                onClick={this.props.onCancel}
              >
                Cancel
              </button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
        {this.state.showparamswindow && (
          <ParametersForProjectWindow
            onCancel={this.handleParameterCancel}
            onSave={this.handleDefaultParameterSave}
            plugindbid={this.state.pluginid}
            projectdbid={this.state.projectid}
          />
        )}
      </div>
    );
  }
}

export default PluginProjectWindow;
PropTypes.projectTable = {
  //onSelect: PropTypes.func,

  onCancel: PropTypes.func,
  onSave: PropTypes.func,
  allprojects: PropTypes.Array,
  tableSelectedData: PropTypes.Array,
  selectedProjectsAsMap: PropTypes.Array,
};
