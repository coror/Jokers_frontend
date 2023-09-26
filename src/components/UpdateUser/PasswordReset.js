import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you're using React Router

const PARSE_APPLICATION_ID = 'EmT94PHxVHWdOzt9mgvucMSzrDV2orx4Kz9uHC4r'; // Replace with your Parse Application ID

const PasswordResetPage = () => {
  const { token } = useParams(); // Capture the token from the URL

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    // Send a request to your backend to update the password with the token
    try {
      const response = await fetch('https://parseapi.back4app.com/functions/resetPassword', {
        // Use a different endpoint to handle password reset with the token
        method: 'POST',
        headers: {
          'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APPLICATION_ID,
          'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
        },
        body: JSON.stringify({
          token, // Pass the token from the URL
          newPassword: password,
        }),
      });

      if (response.ok) {
        setMessage('Password reset successful.');
      } else {
        setMessage('Password reset failed.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage('An error occurred while resetting the password.');
    }
  };

  useEffect(() => {
    // Optionally, you can perform additional actions when the component mounts,
    // such as checking the validity of the token or handling expiration.
  }, [token]);

  return (
    <div>
      <h2>Password Reset</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default PasswordResetPage;
