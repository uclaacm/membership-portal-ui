import React from 'react';
import WelcomeBanner from 'components/Home/WelcomeBanner';
import './styles.scss';

const Home = () => {
  return (
    <div className="home-dashboard">
      {/* Sidebar */}
      <aside className="sidebar-custom">
        <div className="sidebar-box event-checkin">
          <h3>Event Check-In</h3>
          <input type="text" placeholder="Enter check-in code" />
          <button>✔</button>
        </div>

        <div className="sidebar-box progress">
          <h3>Your Progress</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '40%' }}></div>
          </div>
          <p>Level 1: [LEVEL] <span>0/100</span></p>
          <small>Earn [XX] more points to level up!</small>
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

      {/* Main Section */}
      <main className="main-section">
        <WelcomeBanner />

        {/* JUST A PLACEHOLDER, REMOVE WITH ACTUAL COMPONENTS*/}
        <div className="featured-events">
          <h2>Featured Events</h2>
          <div className="events-grid">
            <div className="event-card">
              <div className="cover"></div>
              <div className="event-details">
                <h3>Event Name</h3>
                <p>Jan 1, 2025, 7:00-8:00PM</p>
                <p>Location</p>
                <p>Committee</p>
                <p>10 pts</p>
              </div>
            </div>
            <div className="event-card">
                <div className="cover"></div>
              <div className="event-details">
                <h3>Event Name</h3>
                <p>Jan 1, 2025, 7:00-8:00PM</p>
                <p>Location</p>
                <p>Committee</p>
                <p>10 pts</p>
                </div>
            </div>
            <div className="event-card">
                <div className="cover"></div>
                <div className="event-details">
                <h3>Event Name</h3>
                <p>Jan 1, 2025, 7:00-8:00PM</p>
                <p>Location</p>
                <p>Committee</p>
                <p>10 pts</p>
                </div>
            </div>
            <div className="event-card">
                <div className="cover"></div>
                <div className="event-details">
                <h3>Event Name</h3>
                <p>Jan 1, 2025, 7:00-8:00PM</p>
                <p>Location</p>
                <p>Committee</p>
                <p>10 pts</p>
                </div>
            </div>
            <div className="event-card">
                <div className="cover"></div>
                <div className="event-details">
                <h3>Event Name</h3>
                <p>Jan 1, 2025, 7:00-8:00PM</p>
                <p>Location</p>
                <p>Committee</p>
                <p>10 pts</p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
