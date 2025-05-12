// src/components/ChangeToAdmin.jsx
import React, { useState } from 'react';
import Button from 'components/Button';
import './ChangeToAdmin.scss';

const ChangeToAdmin = () => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handlePromoteClick = () => {
    setShowModal(true);
    setMessage('');
  };

  const handleSubmit = () => {
    if (password === 'your-secure-admin-password') {
      setMessage('Account promoted to admin! Sign out and sign back in to see the changes.');
    } else {
      setMessage('❌ Incorrect password. Try again.');
    }
    setPassword('');
  };

  return (
    <div>
      <Button onClick={handlePromoteClick} 
      className="control-panel-action-button" 
      color="blue" 
      text="Change to Admin"
      />

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Enter Admin Password</h2>
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSubmit} className="submit-button">
              Submit
            </button>
            <button onClick={() => setShowModal(false)} className="cancel-button">
              Cancel
            </button>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeToAdmin;
