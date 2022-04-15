import React from "react";
import PropTypes from "prop-types";
import Button from "components/Button";

export default class OneClickPasswordModal extends React.Component {
  constructor() {
    super();
    this.state = {
      passwordResetMessage: "",
    };
  }

  render() {
    const { onClose, opened } = this.props;
    const { passwordResetMessage } = this.state;

    return opened ? (
      <div className="modal-wrapper">
        <div className="attendees-modal-container">
          <div className="padding">
            <h1>Change One-Click API Password</h1>
            <div className="form-elem">
              <input
                type="password"
                name="current-password"
                placeholder="Current password"
                id="passwordResetOldPassword"
              />
              <br />
              <br />
              <input type="password" name="new-password" placeholder="New password" id="passwordResetNewPassword" />
              <br />
              <br />
              <input
                type="password"
                name="new-password"
                placeholder="Confirm new password"
                id="passwordResetConfirmNewPassword"
              />
            </div>

            <div className="form-elem">
              <div className="passwordResetBar">
                <Button
                  className="control-panel-action-button"
                  color="red"
                  text="Change password"
                  onClick={() => {
                    if (
                      document.getElementById("passwordResetNewPassword").value !==
                      document.getElementById("passwordResetConfirmNewPassword").value
                    )
                      this.changePasswordResetMessage("New password does not match.");
                    else this.changePasswordResetMessage("Successfully updated password!");
                  }}
                />
                <div className="passwordResetStatus">{passwordResetMessage}</div>
              </div>
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

OneClickPasswordModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  opened: PropTypes.bool.isRequired,
};
