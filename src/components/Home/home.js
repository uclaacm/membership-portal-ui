import React from 'react';
import WelcomeBanner from 'components/Home/WelcomeBanner';
import Points from './points';

import './styles.scss';

const Home = ({ events,
  isAdmin,
  isSuperAdmin,
  adminView,
  picture,
  username,
  checkIn,
  checkInPoints,
  checkInSuccess,
  checkInError,
  points,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    checkIn(e.target.attendanceCode.value);
  };

  return (
    <div className="home-dashboard">
      {/* Sidebar */}
      <aside className="sidebar-custom">
        <div className="sidebar-box event-checkin">
          <h3>Event Check-In</h3>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="attendanceCode"
              placeholder="Enter Check-In Code" 
            />
            <button type="submit" className="check-btn" aria-label="Check in"></button>
          </form>
          {checkInError && (
            <>
              <br />
              <span className="CaptionSecondary error">❌ {checkInError}</span>
            </>
          )}
          {checkInSuccess && (
            <>
              <br />
              <span className="CaptionSecondary success">
                ✅ {checkInPoints} points awarded!
              </span>
            </>
          )}
        </div>

      <div className="sidebar-box progress">
        <h3>Your Progress</h3>
        <Points points={points} />
      </div>

      <div className="sidebar-box leaderboard">
        <h3>Leaderboard</h3>
        <ul>
          <li>Alex Zheng <span>Pts</span></li>
          <li>Smalex <span>Pts</span></li>
          <li>Alex is the best <span>Pts</span></li>
          <li>Too much time on this <span>Pts</span></li>
          <li>RAHHHHHHHH <span>Pts</span></li>
        </ul>
      </div>
    </aside>

    <main className="main-section">
      <WelcomeBanner
        isAdmin={isAdmin}
        isSuperAdmin={isSuperAdmin}
        adminView={adminView}
        picture={picture}
        username={username}
      />

      <div className="featured-events">
        <h2>Featured Events</h2>
        <div className="events-grid">
          {/* ... your event cards here ... */}
        </div>
      </div>
    </main>
  </div>
)
}

export default Home;
