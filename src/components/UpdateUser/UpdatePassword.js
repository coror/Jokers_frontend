import React, { useState } from 'react';
import Parse from 'parse';
import classes from './UpdatePassword.module.css';
import Button from '../UI/Button';
import ResponseModal from '../UI/ResponseModal'; // Make sure to import the ResponseModal component

const UpdateUser = ({ userId }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleUpdatePassword = async () => {
    if (!oldPassword) {
      setModalTitle('Input Error');
      setModalMessage('Please enter your old password.');
      setIsModalOpen(true);
      return;
    }

    if (!newPassword) {
      setModalTitle('Input Error');
      setModalMessage('Please enter a new password.');
      setIsModalOpen(true);
      return;
    }

    if (newPassword.length < 8) {
      setModalTitle('Input Error');
      setModalMessage('Password must be longer than 8 characters.');
      setIsModalOpen(true);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setModalTitle('Input Error');
      setModalMessage(
        'Passwords do not match. Please re-enter your new password.'
      );
      setIsModalOpen(true);
      return;
    }

    try {
      setLoading(true); // Set loading state while updating password

      const user = Parse.User.current();
      const authUser = await Parse.User.logIn(
        user.get('username'),
        oldPassword
      );

      // Compare entered old password with the user's current password
      if (!authUser) {
        // Old password is incorrect
        setModalTitle('Input Error');
        setModalMessage('Your old password is incorrect.');
        setIsModalOpen(true);
        setOldPassword('');
        setLoading(false);
        return;
      }

      // Update the password
      authUser.set('password', newPassword);
      await authUser.save();

      setModalTitle('Success');
      setModalMessage('The password has been successfully updated!');
      setIsModalOpen(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Error updating password:', error);

      // Handle other errors
      if (error.message === 'Invalid username/password.') {
        // Handle incorrect old password error
        setModalTitle('Input Error');
        setModalMessage('Your old password is incorrect.');
      } else {
        // Handle other errors
        setModalTitle('Error');
        setModalMessage('Failed to update password. Please try again.');
      }
  
      setIsModalOpen(true);
    } finally {
      setLoading(false); // Reset loading state after update
    }
  };

  return (
    <div className={classes['form-container']}>
      <h2 className={classes['form-heading']}>Update Password</h2>
      <div className={classes['form-section']}>
        <label className={classes.label}>Old Password:</label>
        <input
          type='password'
          className={classes['input-field']}
          value={oldPassword}
          onChange={(event) => setOldPassword(event.target.value)}
        />
      </div>
      <div className={classes['form-section']}>
        <label className={classes.label}>New Password:</label>
        <input
          type='password'
          className={classes['input-field']}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </div>
      <div className={classes['form-section']}>
        <label className={classes.label}>Re-enter New Password:</label>
        <input
          type='password'
          className={classes['input-field']}
          value={confirmNewPassword}
          onChange={(event) => setConfirmNewPassword(event.target.value)}
        />
      </div>

      <div className={classes['submit-section']}>
        {loading ? (
          <div className={classes['loading-spinner']}></div>
        ) : (
          <Button
            onClick={handleUpdatePassword}
            className={classes.updateButton}
            disabled={loading}
          >
            Update Password
          </Button>
        )}
      </div>
      {isModalOpen && (
        <ResponseModal
          title={modalTitle}
          message={modalMessage}
          onConfirm={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default UpdateUser;
