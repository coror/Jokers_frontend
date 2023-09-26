import React, { useState } from 'react';
import Parse from 'parse';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import classes from './Login.module.css';
import Button from '../UI/Button';
import PasswordResetEmail from '../UpdateUser/PasswordResetEmail';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPasswordResetEmail, setShowPasswordResetEmail] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoggingIn(true);

    try {
      const user = await Parse.User.logIn(email, password);
      const sessionToken = user.getSessionToken();
      onLogin(sessionToken);
      localStorage.setItem('sessionToken', sessionToken);
      setLoginError('');
      setLoginAttempted(false);
    } catch (error) {
      setLoginError('Invalid email or password');
      setLoginAttempted(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInputChange = (event) => {
    setLoginError('');
    setLoginAttempted(false);
    const { name, value } = event.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  // Initialize inputClassName as an empty string
  let inputClassName = '';

  // Set the inputClassName only if loginAttempted and loginError are true
  if (loginAttempted && loginError) {
    inputClassName = classes['login-error'];
  }

  const togglePasswordResetEmail = () => {
    setShowPasswordResetEmail(!showPasswordResetEmail);
  };

  return (
    <div>
      <Header>Login</Header>
      <div className={classes['login-container']}>
        {showPasswordResetEmail ? (
          <PasswordResetEmail togglePasswordResetEmail={togglePasswordResetEmail} />
        ) : (
          <form className={classes['login-form']} onSubmit={handleLogin}>
            <div>
              <label>Email:</label>
              <input
                type='email'
                name='email'
                value={email}
                onChange={handleInputChange}
                className={inputClassName} 
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type='password'
                name='password'
                value={password}
                onChange={handleInputChange}
                className={inputClassName} 
              />
            </div>
            <div>
              {loginError && <p className={`${classes['error']} ${classes['login-error']}`}>{loginError}</p>}
            </div>
            <div>
              <span className={`${classes['forgot-link']} ${classes['link']}`} onClick={togglePasswordResetEmail}>
                Forgot your password?
              </span>
            </div>
            <div>
              <Button type='submit' disabled={isLoggingIn} className={classes.button}>
                {isLoggingIn ? (
                  <span className={classes['loading-spinner']}></span>
                ) : (
                  'LOGIN'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Login;
