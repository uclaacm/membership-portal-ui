import React from 'react';
import Config from 'config';
import PropTypes from 'prop-types';
import Button from 'components/Button';
//import user from '../../../../membership-portal/app/db/schema/user'; // what's the issue here and with underscore?

export default class DetailsCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      disableForm, onSubmit, profileValid,
    } = this.props;
    return (
      <div className={`card details-card${profileValid() ? ' confirm-details' : ''}`}>
        <img src={Config.organization.logo} alt="ACM logo" />
        <div className="inner">
          <form onSubmit={onSubmit} autoComplete="off">
            <p className="header">Account Details</p>

            <div className="align align-input-major">
              <p className="text">
                Major
                <span className="info">(full name of major)</span>
              </p>
              <input className="input-major" name="major" onChange={this.handleChange} />
            </div>
            <div className="align">
              <p className="text">
                Year
                <span className="info">(choose one)</span>
              </p>
              <select className="input-year" name="year" onChange={this.handleChange}>
                <option value={0}>--</option>
                <option value={1}>Freshman</option>
                <option value={2}>Sophomore</option>
                <option value={3}>Junior</option>
                <option value={4}>Senior</option>
                <option value={5}>Post-senior</option>
              </select>
            </div>
            <br />
            <Button className="btn" loading={disableForm} style={profileValid() ? 'green' : 'disabled'} text="Finish" onClick={onSubmit} />
          </form>
        </div>
      </div>
    );
  }
}

DetailsCard.propTypes = {
  onChange: PropTypes.func.isRequired,
  disableForm: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  profileValid: PropTypes.func.isRequired,
};
