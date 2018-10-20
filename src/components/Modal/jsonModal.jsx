import React from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import './style.scss';

export default class JSONModal extends React.Component {
  constructor(props) {
    super(props);
    const { attendees } = this.props;
    this.state = {
      attendees: JSON.parse(attendees).members,
    };
  }

  render() {
    const { title, style, onChange } = this.props;
    const { attendees } = this.state;
    return (
      <div className="modal-wrapper">
        <div className="modal-container" style={style || null}>
          <div style={{ padding: '30px' }}>
            <h1>{title}</h1>
            <br />
            <div className="modal-table">
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <td />
                    <td>Name</td>
                    <td>Year</td>
                    <td>Major</td>
                  </tr>
                </thead>
                <tbody>
                  {
                    attendees.map(member => (
                      <tr>
                        <td><img src={member.picture} alt="Attendee" /></td>
                        <td>{`${member.firstName} ${member.lastName}`}</td>
                        <td>{member.year}</td>
                        <td>{member.major}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            <br />
            <br />
            <Button text="Close" color="red" onClick={() => onChange()} />
          </div>
        </div>
      </div>
    );
  }
}

JSONModal.defaultProps = {
  style: undefined,
};

JSONModal.propTypes = {
  title: PropTypes.string.isRequired,
  style: PropTypes.shape,
  onChange: PropTypes.func.isRequired,
  attendees: PropTypes.string.isRequired,
};
