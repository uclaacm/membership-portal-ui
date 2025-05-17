import React from 'react';
import './Banner.scss';

const WelcomeBanner = () => (
  <div className="welcome-banner">
    <div className="welcome-text">
      <h1>Welcome to ACM Membership Portal!</h1>
      <div className="footer">
        <p className="subheading">Brought to you by:</p>
        <img
          src="/assets/images/acm-dev-badge.png"
          alt="ACM.dev branding"
          className="branding-badge"
        />
      </div>
    </div>

    <div className="profile-area">
      <div className="profile-picture-placeholder">
        {/* later: <img src={user.photoURL} alt={user.name} /> */}
      </div>
      <div className="profile-name-placeholder">
        {/* later: <p className="chapter">ACM chapter at UCLA</p> */}
        {/* later: <h2 className="name">{user.name}</h2> */}
      </div>
    </div>
  </div>
);

export default WelcomeBanner;
