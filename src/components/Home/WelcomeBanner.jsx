import React from 'react';
import Config from 'config';
import './Banner.scss';

const WelcomeBanner = ({
  isAdmin,
  isSuperAdmin,
  adminView,
  picture,
  username,
}) => {
  const showAdminView = isAdmin && adminView;
  const displayPicture = showAdminView
    ? Config.organization.logo
    : picture;
  const displayName = isSuperAdmin && showAdminView
    ? 'Super Admin'
    : showAdminView
    ? 'Admin'
    : username;
  
  const highRes = displayPicture.replace(/=s96-c$/, '=s400-c');


  return (
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
        <img className="profile-picture" src={highRes} alt={displayName} />
        <div className="profile-name">
          <p className="chapter">{Config.organization.shortName}</p>
          <h1 className="name">{displayName}</h1>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
