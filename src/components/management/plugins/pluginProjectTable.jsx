import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { Modal } from "react-bootstrap";
import { getProjects } from "../../../services/projectServices";
class PluginProjectTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { allprojects: props.allProjects };
    console.log("modal log projects", props.allProjects);
  }

  state = {
    allprojects: []
  };

  populateRows = () => {
    let rows = [];

    this.state.allprojects.forEach(project => {
      rows.push(
        <tr key={project.id} className="edit-userRole__table--row">
          <td>
            <input
              type="checkbox"
              value={project.id}
              name={project.id}
              defaultChecked={
                project.id === this.props.selectedProjectsAsMap.get(project.id)
              }
              onChange={() => {
                this.props.onChange(project.id, this.props.tableSelectedData);
              }}
            />
          </td>
          <td>{project.id}</td>
        </tr>
      );
    });
    return rows;
  };

  render() {
    return (
      <Modal.Dialog dialogClassName="create-user__modal">
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
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={this.props.onSave}
            >
              Submit
            </button>
            <button
              variant="secondary"
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={this.props.onCancel}
            >
              Cancel
            </button>
          </div>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}

export default PluginProjectTable;
PropTypes.projectTable = {
  //onSelect: PropTypes.func,
  selectedprojects: PropTypes.Array,
  allprojects: PropTypes.Array
};
