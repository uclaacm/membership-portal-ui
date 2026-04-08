import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Action } from 'reducers';
import Topbar from 'containers/topbar';
import CareerProfile from 'components/Profile/CareerProfile';

class CareerProfileContainer extends React.Component {
  componentWillMount() {
    const { authenticated, fetchUser } = this.props;
    if (authenticated) {
      fetchUser();
    }
  }

  render() {
    const { profile, updateCareerProfile } = this.props;
    return (
      <div>
        <Topbar />
        <CareerProfile
          profile={profile}
          updateCareerProfile={updateCareerProfile}
        />
      </div>
    );
  }
}

CareerProfileContainer.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  fetchUser: PropTypes.func.isRequired,
  updateCareerProfile: PropTypes.func.isRequired,

  // eslint-disable-next-line react/forbid-prop-types
  profile: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  authenticated: state.Auth.get('authenticated'),
  profile: state.User.get('profile') || {},
});

const mapDispatchToProps = dispatch => ({
  fetchUser: () => dispatch(Action.FetchUser()),
  updateCareerProfile: user => dispatch(Action.UpdateCareerProfile(user)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CareerProfileContainer);
