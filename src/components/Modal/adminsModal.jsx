import React from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';

export default class AdminsModal extends React.Component {
  render() {
    const {
      admins, onAdd, onDelete, onClose, opened,
    } = this.props;

    return opened ? (
      <div className="modal-wrapper">
        <div className="attendees-modal-container">
          <div className="padding">
            <h1>Admins</h1>
            <div className="modal-table">
              <table>
                <thead>
                  <tr>
                    <td>Name</td>
                    <td>Email</td>
                    <td />
                  </tr>
                </thead>
                <tbody>
                    <tr>
                      <td>

                      </td>
                      <td>
                      <div className="form-elem">
          <input type="email" name="email" pattern=".+@g.ucla.edu" title="Please provide a g.ucla.edu email address." className="modal-input" id="addAdminEmailField" placeholder="example@g.ucla.edu" />
          </div>
                      </td>
                      <td className="center"><Button color="blue" text="Add" onClick={() => onAdd(document.getElementById("addAdminEmailField").value)} /></td>

                    </tr>
                  {
                    admins.map(admin => (
                      <tr key={admin.email}>
                        <td>
                          {admin.name}
                        </td>
                        <td>{admin.email}</td>
                        <td className="center"><Button color="red" text="Delete" onClick={() => onDelete(admin.email)} /></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            <br />
            <br />
            <br />
            <div className="button-container">
              <Button text="Close" color="red" onClick={onClose} />
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
}

AdminsModal.propTypes = {
  admin: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAdd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  opened: PropTypes.bool.isRequired,
};