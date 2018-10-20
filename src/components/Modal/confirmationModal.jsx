import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import './style.scss';

export default class ConfirmationModal extends React.Component {
  render() {
    const {
      title, message, submit, cancel, style,
    } = this.props;
    return (
      <div className="modal-wrapper">
        <div className="confirmation-modal-container" style={style || null}>
          <div style={{ padding: '30px' }}>
            <h1>{title}</h1>
            <br />
            <p>{message}</p>
            <br />
            <br />
            <div className="button-container">
              <div style={{ paddingRight: '20px' }}>
                <Button text="Yes" color="green" onClick={() => submit()} />
              </div>
              <div style={{ paddingLeft: '20px' }}>
                <Button text="No" color="red" onClick={() => cancel()} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ConfirmationModal.defaultProps = {
  style: undefined,
};

ConfirmationModal.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  style: PropTypes.shape,
};
