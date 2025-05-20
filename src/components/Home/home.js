import React from 'react';
import WelcomeBanner from 'components/Home/WelcomeBanner';
import Points from './points';

import './styles.scss';
import FeaturedEvents from './featuredEvents';
import EventCard from '../Events/UserEvents/eventCard';

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

  /* HARD CODED FOR TESTING PURPOSES */
  const event = (
    <EventCard event={{
      attendancePoints: '50',
      committee: 'ICPC',
      cover: '',
      description: 'description',
      endDate: null, // endTime
      eventLink: '',
      location: 'Boelter 1293',
      startDate: null, // startTime
      title: 'Very fun event',
      startTime: '6:00 PM',
    }}
    />
  );
  const eventArray = [event, event, event, event];

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

        {/* Main Section */}
        <main className="main-section">
          <WelcomeBanner />

          <div>
            <FeaturedEvents title="Featured Events" events={eventArray} />
          </div>

        </main>
      </div>
  );
};

export default Home;
