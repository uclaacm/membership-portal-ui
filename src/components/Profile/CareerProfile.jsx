import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import './careerProfile.scss';

const isValidLinkedInUrl = (url) => {
  if (!url || url.trim() === '') return true;
  const linkedInPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i;
  return linkedInPattern.test(url);
};

const isValidGitHubUrl = (url) => {
  if (!url || url.trim() === '') return true;
  const gitHubPattern = /^https?:\/\/(www\.)?github\.com\/.+/i;
  return gitHubPattern.test(url);
};

const isValidUrl = (url) => {
  if (!url || url.trim() === '') return true;
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const getLinkedInUrlError = (url) => {
  if (!url || url.trim() === '') return null;
  if (!isValidUrl(url)) return 'Please enter a valid URL';
  if (!isValidLinkedInUrl(url)) {
    return 'LinkedIn URL must be in the format: https://linkedin.com/in/username';
  }
  return null;
};

const getGitHubUrlError = (url) => {
  if (!url || url.trim() === '') return null;
  if (!isValidUrl(url)) return 'Please enter a valid URL';
  if (!isValidGitHubUrl(url)) {
    return 'GitHub URL must be in the format: https://github.com/username';
  }
  return null;
};

class CareerProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bio: props.profile.bio || '',
      pronouns: props.profile.pronouns || '',
      linkedinUrl: props.profile.linkedinUrl || '',
      githubUrl: props.profile.githubUrl || '',
      portfolioUrl: props.profile.portfolioUrl || '',
      personalWebsite: props.profile.personalWebsite || '',
      resumeUrl: props.profile.resumeUrl || '',
      skills: props.profile.skills || [],
      careerInterests: props.profile.careerInterests || [],
      isProfilePublic:
        props.profile.isProfilePublic !== undefined ? props.profile.isProfilePublic : true,
      skillInput: '',
      careerInterestInput: '',
      saving: false,
      saveSuccess: false,
      saveError: null,
      validationErrors: {},
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.addSkill = this.addSkill.bind(this);
    this.removeSkill = this.removeSkill.bind(this);
    this.addCareerInterest = this.addCareerInterest.bind(this);
    this.removeCareerInterest = this.removeCareerInterest.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { profile } = this.props;
    const prev = prevProps.profile || {};
    const next = profile || {};

    const changed = prev.bio !== next.bio
      || prev.pronouns !== next.pronouns
      || prev.linkedinUrl !== next.linkedinUrl
      || prev.githubUrl !== next.githubUrl
      || prev.portfolioUrl !== next.portfolioUrl
      || prev.personalWebsite !== next.personalWebsite
      || prev.resumeUrl !== next.resumeUrl
      || prev.isProfilePublic !== next.isProfilePublic
      || prev.skills !== next.skills
      || prev.careerInterests !== next.careerInterests;

    if (!changed) return;

    // eslint-disable-next-line react/no-did-update-set-state
    this.setState(prevState => ({
      bio: next.bio !== undefined ? next.bio : prevState.bio,
      pronouns: next.pronouns !== undefined ? next.pronouns : prevState.pronouns,
      linkedinUrl: next.linkedinUrl !== undefined ? next.linkedinUrl : prevState.linkedinUrl,
      githubUrl: next.githubUrl !== undefined ? next.githubUrl : prevState.githubUrl,
      portfolioUrl: next.portfolioUrl !== undefined ? next.portfolioUrl : prevState.portfolioUrl,
      personalWebsite:
        next.personalWebsite !== undefined ? next.personalWebsite : prevState.personalWebsite,
      resumeUrl: next.resumeUrl !== undefined ? next.resumeUrl : prevState.resumeUrl,
      skills: next.skills !== undefined ? next.skills : prevState.skills,
      careerInterests:
        next.careerInterests !== undefined ? next.careerInterests : prevState.careerInterests,
      isProfilePublic:
        next.isProfilePublic !== undefined ? next.isProfilePublic : prevState.isProfilePublic,
    }));
  }

  handleInputChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });

    if (this.state.validationErrors[name]) {
      this.setState(prevState => ({
        validationErrors: { ...prevState.validationErrors, [name]: null },
      }));
    }
  }

  handleBlur(e) {
    const { name, value } = e.target;
    const errors = {};

    // Validate LinkedIn URL
    if (name === 'linkedinUrl') {
      const error = getLinkedInUrlError(value);
      if (error) errors.linkedinUrl = error;
    }

    // Validate GitHub URL
    if (name === 'githubUrl') {
      const error = getGitHubUrlError(value);
      if (error) errors.githubUrl = error;
    }

    if (Object.keys(errors).length > 0) {
      this.setState(prevState => ({
        validationErrors: { ...prevState.validationErrors, ...errors },
      }));
    }
  }

  handleToggle() {
    this.setState(prevState => ({ isProfilePublic: !prevState.isProfilePublic }));
  }

  addSkill(e) {
    const { skillInput, skills } = this.state;
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (skills.length < 20 && !skills.includes(newSkill)) {
        this.setState(prevState => ({
          skills: [...prevState.skills, newSkill],
          skillInput: '',
        }));
      }
    }
  }

  removeSkill(skillToRemove) {
    this.setState(prevState => ({
      skills: prevState.skills.filter(skill => skill !== skillToRemove),
    }));
  }

  addCareerInterest(e) {
    const { careerInterestInput, careerInterests } = this.state;
    if (e.key === 'Enter' && careerInterestInput.trim()) {
      e.preventDefault();
      const newInterest = careerInterestInput.trim();
      if (careerInterests.length < 20 && !careerInterests.includes(newInterest)) {
        this.setState(prevState => ({
          careerInterests: [...prevState.careerInterests, newInterest],
          careerInterestInput: '',
        }));
      }
    }
  }

  removeCareerInterest(interestToRemove) {
    this.setState(prevState => ({
      careerInterests: prevState.careerInterests.filter(interest => interest !== interestToRemove),
    }));
  }

  async handleSubmit(e) {
    const { updateCareerProfile } = this.props;
    const {
      bio,
      pronouns,
      skills,
      careerInterests,
      isProfilePublic,
      linkedinUrl, githubUrl, portfolioUrl, personalWebsite, resumeUrl,
    } = this.state;

    e.preventDefault();

    const validationErrors = {};
    const linkedinError = getLinkedInUrlError(this.state.linkedinUrl);
    const githubError = getGitHubUrlError(this.state.githubUrl);

    if (linkedinError) validationErrors.linkedinUrl = linkedinError;
    if (githubError) validationErrors.githubUrl = githubError;

    if (Object.keys(validationErrors).length > 0) {
      this.setState({ validationErrors, saveError: 'Please fix the validation errors before saving.' });
      return;
    }

    this.setState({
      saving: true, saveError: null, saveSuccess: false, validationErrors: {},
    });

    const updates = {
      bio,
      pronouns,
      skills,
      careerInterests,
      isProfilePublic,
      // Required fields
      linkedinUrl,
      githubUrl,
      // Optional URL fields that can be cleared
      portfolioUrl,
      personalWebsite,
      resumeUrl,
    };

    try {
      await updateCareerProfile(updates);
      this.setState({ saving: false, saveSuccess: true });
      setTimeout(() => {
        this.setState({ saveSuccess: false });
        this.props.history.push('/profile/career');
      }, 2000);
    } catch (error) {
      this.setState({ saving: false, saveError: error.message || 'Failed to save changes' });
    }
  }

  calculateCompleteness() {
    const {
      bio,
      skills,
      careerInterests,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      personalWebsite,
      pronouns,
    } = this.state;
    const total = 6;

    const completed = Number(bio && bio.length >= 50)
      + Number(skills.length >= 3)
      + Number(careerInterests.length >= 2)
      + Number(linkedinUrl || githubUrl)
      + Number(portfolioUrl || personalWebsite)
      + Number(pronouns);

    return Math.round((completed / total) * 100);
  }

  render() {
    const {
      bio,
      pronouns,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      personalWebsite,
      resumeUrl,
      skills,
      careerInterests,
      isProfilePublic,
      skillInput,
      careerInterestInput,
      saving,
      saveSuccess,
      saveError,
    } = this.state;
    const completeness = this.calculateCompleteness();

    return (
      <div className="career-profile-page">
        <div className="career-profile-header">
          <Link to="/profile/career" className="back-link">
            <i className="fa fa-arrow-left" />
            <span>Back to Career Hub</span>
          </Link>
          <h1>Edit Career Profile</h1>
          <p className="subtitle">Showcase your skills and experience to the ACM community</p>
        </div>

        <div className="career-profile-container">
          {/* Left Side: Form */}
          <div className="career-profile-content">
            <form onSubmit={this.handleSubmit}>
              {/* Basic Info Section */}
              <div className="form-section">
                <h2>Basic Information</h2>

                <div className="form-group">
                  <label htmlFor="pronouns">
                    Pronouns
                    <input
                      type="text"
                      id="pronouns"
                      name="pronouns"
                      value={pronouns}
                      onChange={this.handleInputChange}
                      placeholder="e.g., she/her, he/him, they/them"
                      maxLength={50}
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">
                    Bio
                    <span className="char-count">
                      {bio.length}
                      /1000
                    </span>
                    <textarea
                      id="bio"
                      name="bio"
                      value={bio}
                      onChange={this.handleInputChange}
                      placeholder="Tell us about yourself, your interests, and what you're working on..."
                      rows={6}
                      maxLength={1000}
                    />
                  </label>
                </div>
              </div>

              {/* Professional Links Section */}
              <div className="form-section">
                <h2>Professional Links</h2>

                <div className="form-group">
                  <label htmlFor="linkedinUrl">
                    <i className="fab fa-linkedin" />
                    {' '}
                    LinkedIn
                    {this.state.linkedinUrl && !this.state.validationErrors.linkedinUrl && <span className="valid-check"> ✓</span>}
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={this.state.linkedinUrl}
                    onChange={this.handleInputChange}
                    onBlur={this.handleBlur}
                    placeholder="https://linkedin.com/in/yourprofile"
                    required
                    className={this.state.validationErrors.linkedinUrl ? 'error' : ''}
                  />
                  {this.state.validationErrors.linkedinUrl && (
                    <span className="error-message">{this.state.validationErrors.linkedinUrl}</span>
                  )}
                  <p className="help-text">Example: https://linkedin.com/in/yourname</p>
                </div>

                <div className="form-group">
                  <label htmlFor="githubUrl">
                    <i className="fab fa-github" />
                    {' '}
                    GitHub
                    {this.state.githubUrl && !this.state.validationErrors.githubUrl && <span className="valid-check"> ✓</span>}
                  </label>
                  <input
                    type="url"
                    id="githubUrl"
                    name="githubUrl"
                    value={this.state.githubUrl}
                    onChange={this.handleInputChange}
                    onBlur={this.handleBlur}
                    placeholder="https://github.com/yourusername"
                    required
                    className={this.state.validationErrors.githubUrl ? 'error' : ''}
                  />
                  {this.state.validationErrors.githubUrl && (
                    <span className="error-message">{this.state.validationErrors.githubUrl}</span>
                  )}
                  <p className="help-text">Example: https://github.com/yourusername</p>
                </div>

                <div className="form-group">
                  <label htmlFor="portfolioUrl">
                    <i className="fa fa-briefcase" />
                    {' '}
                    Portfolio
                    <span className="optional-label"> (Optional)</span>
                    <input
                      type="url"
                      id="portfolioUrl"
                      name="portfolioUrl"
                      value={portfolioUrl}
                      onChange={this.handleInputChange}
                      placeholder="https://yourportfolio.com"
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="personalWebsite">
                    <i className="fa fa-globe" />
                    {' '}
                    Personal Website
                    <span className="optional-label"> (Optional)</span>
                    <input
                      type="url"
                      id="personalWebsite"
                      name="personalWebsite"
                      value={personalWebsite}
                      onChange={this.handleInputChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="resumeUrl">
                    <i className="fa fa-file-alt" />
                    {' '}
                    Resume URL
                    <span className="optional-label"> (Optional)</span>
                    <input
                      type="url"
                      id="resumeUrl"
                      name="resumeUrl"
                      value={resumeUrl}
                      onChange={this.handleInputChange}
                      placeholder="https://drive.google.com/..."
                    />
                  </label>
                </div>
              </div>

              {/* Skills Section */}
              <div className="form-section">
                <h2>
                  Skills
                  <span className="count-badge">
                    {skills.length}
                    /20
                  </span>
                </h2>
                <p className="section-help">Add your technical and soft skills. Press Enter to add each skill.</p>

                <div className="form-group">
                  <input
                    type="text"
                    name="skillInput"
                    value={skillInput}
                    onChange={this.handleInputChange}
                    onKeyDown={this.addSkill}
                    placeholder="Type a skill and press Enter"
                    maxLength={50}
                    disabled={skills.length >= 20}
                  />
                </div>

                <div className="tags-container">
                  {skills.map(skill => (
                    <span key={skill} className="tag">
                      {skill}
                      <button type="button" onClick={() => this.removeSkill(skill)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Career Interests Section */}
              <div className="form-section">
                <h2>
                  Career Interests
                  <span className="count-badge">
                    {careerInterests.length}
                    /20
                  </span>
                </h2>
                <p className="section-help">
                  What career fields or roles interest you? Press Enter to add each interest.
                </p>

                <div className="form-group">
                  <input
                    type="text"
                    name="careerInterestInput"
                    value={careerInterestInput}
                    onChange={this.handleInputChange}
                    onKeyDown={this.addCareerInterest}
                    placeholder="Type a career interest and press Enter"
                    maxLength={50}
                    disabled={careerInterests.length >= 20}
                  />
                </div>

                <div className="tags-container">
                  {careerInterests.map(interest => (
                    <span key={interest} className="tag">
                      {interest}
                      <button type="button" onClick={() => this.removeCareerInterest(interest)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Privacy Section */}
              <div className="form-section">
                <h2>Privacy Settings</h2>

                <div className="toggle-group">
                  <label className="toggle-label" htmlFor="isProfilePublic">
                    <input
                      type="checkbox"
                      id="isProfilePublic"
                      checked={isProfilePublic}
                      onChange={this.handleToggle}
                    />
                    <span className="toggle-switch" />
                    <span className="toggle-text">
                      Make my career profile public
                      <span className="toggle-description">
                        Allow other ACM members and recruiters to view your career profile in
                        the directory
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="form-actions">
                {saveError && (
                  <div className="error-message">
                    <i className="fa fa-exclamation-circle" />
                    {' '}
                    {saveError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="success-message">
                    <i className="fa fa-check-circle" />
                    {' '}
                    Profile saved successfully!
                  </div>
                )}
                <button type="submit" className="save-button" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Stats & Tips */}
          <div className="career-profile-sidebar">
            <div className="info-card">
              <h3>Profile Completeness</h3>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completeness}%` }} />
              </div>
              <p className="progress-text">
                {completeness}
                % Complete
              </p>
              <ul className="completeness-checklist">
                <li className={bio && bio.length >= 50 ? 'complete' : ''}>
                  {bio && bio.length >= 50 ? '✓' : '○'}
                  {' '}
                  Bio (50+ characters)
                </li>
                <li className={skills.length >= 3 ? 'complete' : ''}>
                  {skills.length >= 3 ? '✓' : '○'}
                  {' '}
                  At least 3 skills
                </li>
                <li className={careerInterests.length >= 2 ? 'complete' : ''}>
                  {careerInterests.length >= 2 ? '✓' : '○'}
                  {' '}
                  At least 2 career interests
                </li>
                <li className={linkedinUrl || githubUrl ? 'complete' : ''}>
                  {linkedinUrl || githubUrl ? '✓' : '○'}
                  {' '}
                  Professional link
                </li>
                <li className={portfolioUrl || personalWebsite ? 'complete' : ''}>
                  {portfolioUrl || personalWebsite ? '✓' : '○'}
                  {' '}
                  Portfolio/website
                </li>
                <li className={pronouns ? 'complete' : ''}>
                  {pronouns ? '✓' : '○'}
                  {' '}
                  Pronouns
                </li>
              </ul>
            </div>

            <div className="info-card">
              <h3>
                <span role="img" aria-label="chart increasing">📈</span>
                {' '}
                Profile Tips
              </h3>
              <ul>
                <li>Write a compelling bio that highlights your interests</li>
                <li>Add specific, relevant skills</li>
                <li>Include links to your best work</li>
                <li>Make your profile public to increase networking opportunities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(CareerProfile);

CareerProfile.propTypes = {
  profile: PropTypes.shape({
    bio: PropTypes.string,
    pronouns: PropTypes.string,
    linkedinUrl: PropTypes.string,
    githubUrl: PropTypes.string,
    portfolioUrl: PropTypes.string,
    personalWebsite: PropTypes.string,
    resumeUrl: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    careerInterests: PropTypes.arrayOf(PropTypes.string),
    isProfilePublic: PropTypes.bool,
  }),
  updateCareerProfile: PropTypes.func.isRequired,
};

CareerProfile.defaultProps = {
  profile: {},
};
