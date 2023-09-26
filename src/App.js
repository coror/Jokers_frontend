import React, { useState, useEffect, Fragment } from 'react';
import Parse from 'parse';
import classes from './App.module.css';
import Button from './components/UI/Button';
import Footer from './components/Layout/Footer';
import Header from './components/Layout/Header';
import RegistrationForm from './components/UserRegistration/RegistrationForm';
import EditScore from './components/EditScore/EditScore';
import Leaderboard from './components/Leaderboard/Leaderboard'; // Import the Leaderboard component
import Login from './components/UserLogin/Login';
import TransferScore from './components/TransferScore/TransferScore';
import UpdatePassword from './components/UpdateUser/UpdatePassword';
import UpdateAvatar from './components/UpdateUser/UpdateAvatar';
import EditGroup from './components/EditGroup/EditGroup';
import PasswordResetEmail from './components/UpdateUser/PasswordResetEmail';

const PARSE_APPLICATION_ID = process.env.REACT_APP_PARSE_APPLICATION_ID;
const PARSE_HOST_URL = process.env.REACT_APP_PARSE_HOST_URL;
const PARSE_JAVASCRIPT_KEY = process.env.REACT_APP_PARSE_JAVASCRIPT_KEY;
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

const initialSessionToken = localStorage.getItem('sessionToken');
console.log('Initial Session Token:', initialSessionToken); // Add this line for debugging

const checkUserRole = async () => {
  try {
    const user = Parse.User.current();
    if (user) {
      const userRole = await user.fetch();
      return userRole.get('roleName'); // Assuming 'roleName' is the role attribute in your Parse User class
    }
    return null; // User not authenticated
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null; // Handle errors gracefully
  }
};

const App = () => {
  const [usersData, setUsersData] = useState([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showEditScore, setShowEditScore] = useState(false);
  const [isLoading, setIsloading] = useState(true);
  const [httpError, setHttpError] = useState();
  const [sessionToken, setSessionToken] = useState(initialSessionToken);
  const [userRole, setUserRole] = useState(null); // State to hold user role
  const [showTransferScore, setShowTransferScore] = useState(false); // Add this state
  const [refreshLeaderboard, setRefreshLeaderboard] = useState(false);
  const [showUpdateUser, setShowUpdateUser] = useState(false); // Add this state
  const [showUpdateAvatar, setShowUpdateAvatar] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // State to control whether the menu is displayed
  const [showMemberOptions, setShowMemberOptions] = useState(false); // State to control whether member options are displayed
  const [showEditGroup, setShowEditGroup] = useState(false); // Add this state
  const [showLogin, setShowLogin] = useState(true); // Add this state variable

  const handleLogin = async (token) => {
    setSessionToken(token);

    try {
      const user = await Parse.User.current().fetch();
      const userRole = user.get('roleName'); // Fetch the user's role from the server
      setUserRole(userRole); // Set the user's role in the state
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleLogout = () => {
    setSessionToken(null);
    setUserRole(null);
    setShowEditScore(false); // Set showEditScore to false
    setShowRegistrationForm(false);
    setShowTransferScore(false);
    setShowUpdateUser(false);
    setShowUpdateAvatar(false);
    setShowMenu(false);
    setShowMemberOptions(false);
    localStorage.removeItem('sessionToken'); // Remove the sessionToken from local storage
    localStorage.removeItem('userRole'); // Remove the userRole from local storage

    Parse.User.logOut();
  };

  useEffect(() => {
    const storedSessionToken = localStorage.getItem('sessionToken');

    const fetchUserRole = async () => {
      try {
        const user = await Parse.User.current().fetch();
        const userRole = user.get('roleName');
        setUserRole(userRole);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    if (storedSessionToken) {
      const user = Parse.User.current();
      if (user) {
        const tokenExpiration = new Date(user.getSessionToken().expirationTime);
        if (tokenExpiration <= new Date()) {
          // Token has expired
          handleLogout();
          return; // Exit early
        }
      }

      fetchUserRole()
    }
    if (sessionToken) {
      const fetchUsers = async () => {
        const AppUser = Parse.Object.extend('_User');
        const query = new Parse.Query(AppUser);
        query.descending('userScore');
        query.include('avatar');

        try {
          const result = await query.find({ useMasterKey: false });
          if (!result) {
            throw new Error('Something went wrong!');
          }

          const users = result.map((user) => ({
            id: user.id,
            userAvatar: user.get('avatar')
              ? user.get('avatar').get('file').url()
              : '',
            userName: user.get('displayName'),
            userTitle: user.get('title'),
            userScore: user.get('userScore'),
            yearlyScore: user.get('yearlyScore'),
            monthlyScore: user.get('monthlyScore'),
            userGroup: user.get('groupNames'),
            userRole: user.get('roleName'),
          }));

          const filteredUsers = users.filter(
            (user) => user.userRole !== 'coach'
          );

          setUsersData(filteredUsers);
          setIsloading(false);
        } catch (error) {
          setIsloading(false);
          setHttpError('Unable to connect to API');
          console.error('Error fetching users:', error);
        }
      };
      fetchUsers();

      const logoutTimer = setTimeout(() => {
        handleLogout();
        localStorage.removeItem('sessionToken'); // Remove the session token from local storage
        localStorage.removeItem('userRole'); // Remove the userRole from local storage
      }, 3600000);

      const storedUserRole = localStorage.getItem('userRole');
      if (storedUserRole) {
        setUserRole(storedUserRole);
      }

      return () => {
        clearTimeout(logoutTimer); // Clear the timer on component unmount
      };
    }
  }, [sessionToken, refreshLeaderboard]);

  if (!sessionToken) {
    return (
      <div>
        {showLogin ? ( // Render the Login component or PasswordResetEmail component based on showLogin state
          <Login onLogin={handleLogin} />
        ) : (
          <PasswordResetEmail togglePasswordResetEmail={() => setShowLogin(true)} />
        )}
      </div>
    );
  }

  const toggleRegistrationForm = async () => {
    const userRole = await checkUserRole();
    if (userRole === 'coach') {
      setShowRegistrationForm(!showRegistrationForm);
      setShowEditScore(false);
      setShowUpdateUser(false)
      setShowEditGroup(false)
    } else {
      throw new Error('error');
    }
  };

  const toggleEditScore = async () => {
    const userRole = await checkUserRole();
    if (userRole === 'coach') {
      setShowEditScore(!showEditScore);
      setShowRegistrationForm(false);
      setShowUpdateUser(false)
      setShowEditGroup(false)
    } else {
      throw new Error('error');
    }
  };

  const toggleUpdateUser = async () => {
      setShowUpdateUser(!showUpdateUser);
      setShowTransferScore(false);
      setShowUpdateAvatar(false);
      setShowRegistrationForm(false)
      setShowEditScore(false)
      setShowEditGroup(false)
  };

  const toggleSendScore = async () => {
    const userRole = await checkUserRole();
    if (userRole === 'member') {
      setShowTransferScore(!showTransferScore);
      setShowUpdateUser(false);
      setShowUpdateAvatar(false);
    } else {
      throw new Error('error');
    }
  };

  const toggleUpdateAvatar = async () => {
    const userRole = await checkUserRole();
    if (userRole === 'member') {
      setShowUpdateAvatar(!showUpdateAvatar);
      setShowTransferScore(false); // Close the TransferScore component if it's open
      setShowUpdateUser(false);
    } else {
      throw new Error('error');
    }
  };

  const toggleEditGroup = async () => {
    const userRole = await checkUserRole()
    if (userRole === 'coach') {
      setShowEditGroup(!showEditGroup)
      setShowEditScore(false);
      setShowRegistrationForm(false);
      setShowUpdateUser(false)
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const hideMenu = () => {
    setShowMenu(false);
  };

  const toggleMemberOptions = () => {
    setShowMemberOptions(!showMemberOptions);
  };

  const hideMemberOptions = () => {
    setShowMemberOptions(false);
  };

 

  if (isLoading) {
    return (
      <Fragment>
        <Header>Leaderboard</Header>
        <section className={classes.LeaderboardLoading}></section>
      </Fragment>
    );
  }

  if (httpError) {
    return (
      <Fragment>
        <Header>Leaderboard</Header>
        <section className={classes.Error}>
          <p>{httpError}</p>
        </section>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Header>Leaderboard</Header>
      <main className={classes['app-main']}>
        {userRole === 'coach' && (
          <Fragment>
            {showMenu ? (
              <Fragment>
                <div className={classes['button-container']}>
                  <Button
                    className={`${classes.button} ${classes.registerButton}`}
                    onClick={hideMenu}
                  >
                    Hide Options
                  </Button>
                </div>
                <div className={classes['button-container']}>
                  <Button
                    className={classes.button}
                    onClick={toggleRegistrationForm}
                  >
                    Register new user!
                  </Button>
                  <Button
                    className={classes.button}
                    onClick={toggleUpdateUser}
                  >
                    Update Password
                  </Button>
                  <Button
                    className={classes.button}
                    onClick={toggleEditScore}
                  >
                    Add/Remove Score
                  </Button>
                  <Button
                    className={classes.button}
                    onClick={toggleEditGroup} 
                  >
                    Edit Group
                  </Button>
                </div>
                {showUpdateUser && (
                  <UpdatePassword userId={Parse.User.current().id} />
                )}
                {showRegistrationForm && (
                  <RegistrationForm
                    setRefreshLeaderboard={setRefreshLeaderboard}
                  />
                )}
                {showEditScore && (
                  <EditScore setRefreshLeaderboard={setRefreshLeaderboard} />
                )}
                {showEditGroup && <EditGroup userId={Parse.User.current().id} />} 
              </Fragment>
            ) : (
              <div className={classes['button-container']}>
                <Button
                  className={`${classes.button} ${classes.registerButton}`}
                  onClick={toggleMenu}
                >
                  Show Options
                </Button>
              </div>
            )}
          </Fragment>
        )}

        {userRole === 'member' && (
          <div>
            {showMemberOptions ? (
              <Fragment>
                <div className={classes['button-container']}>
                  <Button
                    className={`${classes.button} ${classes.transferButton}`}
                    onClick={hideMemberOptions}
                  >
                    Hide Options
                  </Button>
                </div>
                <div className={classes['button-container']}>
                  <Button
                    className={classes.button}
                    onClick={toggleSendScore}
                  >
                    Send Score
                  </Button>
                  <Button
                    className={classes.button}
                    onClick={toggleUpdateUser}
                  >
                    Update Password
                  </Button>
                  <Button
                    className={classes.button}
                    onClick={toggleUpdateAvatar}
                  >
                    Update Avatar
                  </Button>
                </div>
                {showTransferScore && (
                  <TransferScore
                    userId={Parse.User.current().id}
                    showTransferScore={showTransferScore}
                    setRefreshLeaderboard={setRefreshLeaderboard}
                  />
                )}
                {showUpdateUser && (
                  <UpdatePassword userId={Parse.User.current().id} />
                )}
                {showUpdateAvatar && (
                  <UpdateAvatar
                    userObjectId={Parse.User.current().id}
                    setShowUpdateAvatar={setShowUpdateAvatar}
                    setRefreshLeaderboard={setRefreshLeaderboard}
                  />
                )}
              </Fragment>
            ) : (
              <div className={classes['button-container']}>
                <Button onClick={toggleMemberOptions}>Show Options</Button>
              </div>
            )}
          </div>
        )}

        <Leaderboard usersData={usersData} />

        <div className={classes.logoutButtonContainer}>
          <Button
            className={`${classes.button} ${classes.transferButton}`}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </main>
      <Footer />
    </Fragment>
  );
};

export default App;
