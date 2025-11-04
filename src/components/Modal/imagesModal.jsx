import React from 'react';
import Config from 'config';
import PropTypes from 'prop-types';
import Button from 'components/Button';

export default class ImagesModal extends React.Component {
  render() {
    const {
      images, onDelete, onClose, opened,
    } = this.props;

    return opened ? (
      <div className="modal-wrapper">
        <div className="attendees-modal-container">
          <div className="padding">
            <h1>Delete Images</h1>
            <div className="modal-table">
              <table>
                <thead>
                  <tr>
                    <td>Preview</td>
                    <td>MIME type</td>
                    <td>Size (bytes)</td>
                    <td>&nbsp;</td>
                  </tr>
                </thead>
                <tbody>
                  {images.map(image => (
                    <tr key={image.uuid}>
                      <td>
                        <img src={`${Config.API_URL + Config.routes.image.specific}/${image.uuid}`} alt="Image" />
                      </td>
                      <td>{image.mimetype}</td>
                      <td>{image.size}</td>
                      <td>
                        <Button color="red" text="Delete" onClick={() => onDelete(image.uuid)} />
                      </td>
                    </tr>
                  ))}
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

ImagesModal.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDelete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  opened: PropTypes.bool.isRequired,
};
