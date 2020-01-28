import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { Modal } from "react-bootstrap";
import { getTemplatesDataFromDb } from "../../../services/templateServices";
class PluginTemplateTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { allTemplates: props.allTemplates };
    console.log("modal log projects", props.allTemplates);
  }

  state = {
    allTemplates: []
  };

  populateRows = () => {
    let rows = [];

    this.state.allTemplates.forEach(template => {
      console.log("template modal ---->>>>>> ", template);
      rows.push(
        <tr key={template.id} className="edit-userRole__table--row">
          <td>
            <input
              type="checkbox"
              value={template.id}
              name={template.templateName}
              defaultChecked={
                template.templateName ===
                this.props.selectedTemplateAsMap.get(template.templateName)
              }
              onChange={() => {
                this.props.onChange(template.id, this.props.tableSelectedData);
              }}
            />
          </td>
          <td>{template.templateName}</td>
        </tr>
      );
    });
    return rows;
  };

  render() {
    return (
      <Modal.Dialog dialogClassName="create-user__modal">
        <Modal.Header>
          <Modal.Title>Templates</Modal.Title>
        </Modal.Header>
        <Modal.Body className="create-user__modal --body">
          <table>
            <thead>
              <tr>
                <th className="user-table__header--user">add/remove</th>
                <th className="user-table__header">template</th>
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

export default PluginTemplateTable;
PropTypes.projectTable = {
  //onSelect: PropTypes.func,
  selectedprojects: PropTypes.Array,
  allprojects: PropTypes.Array
};
