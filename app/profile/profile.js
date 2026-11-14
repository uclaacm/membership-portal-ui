'use client';

import React from 'react';
import Link from 'next/link';
import Toast from '@/components/Toast';
import UnsavedChangesGuard from '@/components/UnsavedChangesGuard.jsx';
import Config from '@/lib/config';
import Utils from '@/lib/utils';
import useCommitteeDirectory from '@/lib/hooks/useCommitteeDirectory';
import Activities from './activities';
import NeuralBackground from '@/app/home/components/NeuralBackground';

const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Post-Senior'];

function Committees({ names }) {
  const { styleFor } = useCommitteeDirectory();
  return names.length ? (
    <div className="profile-committees">
      {names.map(name => {
        const { label, color } = styleFor(name);
        return <div className="profile-committee" key={name}><span className="profile-committee-dot" style={{ background: color }} />{label}</div>;
      })}
    </div>
  ) : (
    <div className="profile-committee-empty">
      <span className="profile-icon"><i className="fa-solid fa-users" aria-hidden="true" /></span>
      <div><h3>Not assigned to a committee</h3><p>Explore our committees and find your community.</p></div>
      <Link href="/resources#organization-committees" className="profile-button profile-button-primary">View Committees</Link>
    </div>
  );
}

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.bannerRef = React.createRef();
    this.nameRef = React.createRef();
    this.state = { profile: { ...props.profile }, saving: false };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.profile !== this.props.profile) {
      this.setState(prev => ({ profile: Object.fromEntries(
        Object.entries(this.props.profile).map(([key, value]) => [key,
          value !== prevProps.profile[key] ? value : (prev.profile[key] ?? value),
        ]),
      ) }));
    }
  }

  handleUpdate = e => {
    const { name, value } = e.target;
    this.setState(prev => ({ profile: { ...prev.profile, [name]: value } }));
  };

  profileUpdated = () => ['name', 'year', 'major']
    .some(key => String(this.state.profile[key] ?? '') !== String(this.props.profile[key] ?? ''));

  saveProfile = async e => {
    e.preventDefault();
    if (!this.profileUpdated() || this.state.saving) return;
    const profile = this.state.profile;
    const nameArray = (profile.name || '').trim().split(/\s+/);
    if (nameArray.length < 2) {
      this.bannerRef.current.showToast('Please enter your first and last name.', false);
      this.nameRef.current.focus();
      return;
    }
    const year = Number(profile.year);
    if (!Number.isInteger(year) || year < 1 || year > 5) {
      this.bannerRef.current.showToast('Please select a valid year.', false);
      return;
    }
    this.setState({ saving: true });
    try {
      const saved = await this.props.saveChanges({ firstName: nameArray[0], lastName: nameArray.slice(1).join(' '), year, major: profile.major || '' });
      if (saved) this.setState({ profile: { ...this.props.profile } });
    } finally {
      this.setState({ saving: false });
    }
  };

  render() {
    const { profile } = this.state;
    const { activity, activityError } = this.props;
    const points = Number(this.props.profile.points) || 0;
    const { currLevel, nextLevel, currLevelNumber } = Utils.getLevel(points);
    const progress = nextLevel ? Math.max(0, Math.min(100, (points - currLevel.startsAt) / (nextLevel.startsAt - currLevel.startsAt) * 100)) : 100;
    const events = activity?.filter(item => item.type === 'ATTEND_EVENT').length || 0;
    const changed = this.profileUpdated();

    return (
      <main className="profile-page-container">
        <UnsavedChangesGuard dirty={changed} />
        <Toast ref={this.bannerRef} showing={this.props.updated} success={this.props.updateSuccess} message={this.props.updateSuccess ? 'Profile successfully updated.' : this.props.updateError} />
        <form onSubmit={this.saveProfile}>
          <header className="profile-page-header">
            <div><h1>My Profile</h1><p>Manage your information, view your activity, and track your involvement in ACM at UCLA.</p></div>
            <div className="profile-header-actions">
              {changed && <button type="button" className="profile-button" disabled={this.state.saving} onClick={() => this.setState({ profile: { ...this.props.profile } })}>Cancel</button>}
              <button className="profile-button profile-button-primary" type="submit" disabled={!changed || this.state.saving}><i className={`fa-regular ${this.state.saving ? 'fa-clock' : 'fa-square-check'}`} aria-hidden="true" />{this.state.saving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </header>
          <div className="profile-columns">
            <div className="profile-main-column">
              <section className="profile-banner" aria-label="Your profile">
                <div className="profile-banner-pattern" aria-hidden="true"><NeuralBackground /></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={this.props.profile.picture || '/unknown.png'} alt="Your profile photo" className="profile-avatar" referrerPolicy="no-referrer" />
                <div><h2>{profile.name || 'Your profile'}</h2><p>{[years[Number(profile.year) - 1], profile.major].filter(Boolean).join(' • ')}</p></div>
              </section>
              <section className="profile-panel" aria-labelledby="profile-basic-title">
                <div className="profile-panel-heading"><h2 id="profile-basic-title">Basic Information</h2><Link href="/profile/career/edit" className="profile-edit-button"><i className="fa-solid fa-pen" aria-hidden="true" />Edit Career Profile</Link></div>
                <div className="profile-fields">
                  <label htmlFor="profile-name">Full Name<input ref={this.nameRef} id="profile-name" name="name" value={profile.name || ''} onChange={this.handleUpdate} autoComplete="name" placeholder="First Last" required /></label>
                  <label htmlFor="profile-year">Year<select id="profile-year" name="year" value={profile.year || ''} onChange={this.handleUpdate} required><option value="" disabled>Select your year</option>{years.map((year, i) => <option key={year} value={i + 1}>{year}</option>)}</select></label>
                  <label htmlFor="profile-major">Major<select id="profile-major" name="major" value={profile.major || ''} onChange={this.handleUpdate}><option value="" disabled>Select your major</option>{Config.majors.map(major => <option key={major} value={major}>{major}</option>)}</select></label>
                  <label htmlFor="profile-email">Email<input id="profile-email" value={profile.email || ''} disabled placeholder="Email unavailable" /></label>
                </div>
              </section>
              <section className="profile-panel" aria-labelledby="profile-committee-title">
                <h2 id="profile-committee-title">Committee Involvement</h2><p className="profile-section-description">Your current committee assignments.</p>
                <Committees names={this.props.profile.committees || []} />
              </section>
            </div>
            <aside className="profile-side-column" aria-label="Your involvement">
              <section className="profile-panel" aria-labelledby="profile-stats-title">
                <h2 id="profile-stats-title">Your Stats</h2>
                <dl className="profile-stats">{[{ label: 'Points', value: points }, { label: 'Events', value: events }, { label: 'Rank', value: `#${this.props.profile.rank || '–'}` }].map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
              </section>
              <section className="profile-panel" aria-labelledby="profile-progress-title">
                <h2 id="profile-progress-title">Progress</h2>
                <div className="profile-level"><h3>{currLevel.rank}</h3><span>{points} pts · Level {currLevelNumber + 1}</span></div>
                <div className="profile-progress-track" role="progressbar" aria-label="Progress to next level" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div>
                <p className="profile-progress-description">{nextLevel ? `${Math.max(0, nextLevel.startsAt - points)} points to ${nextLevel.rank}` : 'You’ve reached the highest level!'}</p>
              </section>
              <section className="profile-panel profile-activity" aria-labelledby="profile-activity-title">
                <h2 id="profile-activity-title">Recent Activity</h2>
                {activityError ? <p className="profile-empty" role="status">{activityError}</p> : activity === null ? <p className="profile-empty" role="status">Loading your activity…</p> : activity?.length ? <Activities activities={activity} /> : <div className="profile-empty"><i className="fa-regular fa-calendar" aria-hidden="true" /><p>No activity yet.</p><Link href="/events">Explore upcoming events <span aria-hidden="true">→</span></Link></div>}
              </section>
            </aside>
          </div>
        </form>
      </main>
    );
  }
}
