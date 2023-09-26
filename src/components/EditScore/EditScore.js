import React, { useState, useEffect, Fragment } from 'react';
import Button from '../UI/Button';
import ResponseModal from '../UI/ResponseModal';
import classes from './EditScore.module.css';
import Parse from 'parse';

const GET_USERS_DISPLAY_URL =
  'https://parseapi.back4app.com/functions/getAllDisplayNames';
const GET_USER_IDS_URL =
  'https://parseapi.back4app.com/functions/getUserIdsByDisplayName';
const ADD_REMOVE_SCORE_URL =
  'https://parseapi.back4app.com/functions/addRemoveScore';

const ERROR_MESSAGES = {
  noUserSelected: 'Please select a user.',
  nonNumericScore: 'Score must be a number.',
  addRemoveError: 'Error adding/removing score.',
};

const EditScore = ({ setRefreshLeaderboard }) => {
  const [userDisplayNames, setUserDisplayNames] = useState([]);
  const [selectedDisplayName, setSelectedDisplayName] = useState('');
  const [scoreChange, setScoreChange] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
  const [currentUserGroupName, setCurrentUserGroupName] = useState('');

  useEffect(() => {
    // Fetch the current user's groupName using Parse.Current
    const fetchUserDisplayNames = async () => {
      try {
        const currentUser = Parse.User.current();
        if (currentUser) {
          const groupName = currentUser.get('groupName');
          setCurrentUserGroupName(groupName);
          console.log('Current User Group Name:', groupName);

          const response = await fetch(GET_USERS_DISPLAY_URL, {
            method: 'POST',
            headers: {
              'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APPLICATION_ID,
              'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('API Response:', data);

            // Log the data.result.userDisplayNames here
            console.log(
              'Fetched User Display Names:',
              data.result.userDisplayNames
            );

            // Ensure that data.result.userDisplayNames is an array
            if (Array.isArray(data.result.userDisplayNames)) {
              // Filter and store userDisplayNames based on groupName and role
              console.log('User Group Name:', groupName);
              const filteredUserDisplayNames =
                data.result.userDisplayNames.filter((user) => {
                  console.log('User Role:', user.role);
                  return user.groupName === groupName && user.role === 'member';
                });

              console.log(
                'Filtered User Display Names:',
                filteredUserDisplayNames
              );

              setUserDisplayNames(filteredUserDisplayNames);
            } else {
              console.error('Invalid API response format.');
            }
          } else {
            console.error('Error fetching user display names');
          }
        }
      } catch (error) {
        console.error('Error fetching user display names:', error);
      }
    };

    // Call fetchUserDisplayNames when currentUserGroupName is set
    fetchUserDisplayNames();
  }, []);

  const displayNameChangeHandler = (event) => {
    setSelectedDisplayName(event.target.value);
  };

  const scoreChangeHandler = (event) => {
    setScoreChange(parseInt(event.target.value));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true); // Set loading to true when submitting

    if (!selectedDisplayName) {
      setError(ERROR_MESSAGES.noUserSelected);
      setLoading(false); // Set loading back to false
      return;
    }

    if (isNaN(scoreChange)) {
      setError(ERROR_MESSAGES.nonNumericScore);
      setLoading(false); // Set loading back to false
      return;
    }

    try {
      const response = await fetch(GET_USER_IDS_URL, {
        method: 'POST',
        headers: {
          'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APPLICATION_ID,
          'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: selectedDisplayName,
        }),
      });

      if (!response.ok) {
        console.error('Error fetching user ID by display name');
        return;
      }

      const data = await response.json();
      console.log('API Response:', data);

      const userId = data.result.userId;
      console.log('User ID:', userId);

      const addRemoveResponse = await fetch(ADD_REMOVE_SCORE_URL, {
        method: 'POST',
        headers: {
          'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APPLICATION_ID,
          'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: userId,
          score: scoreChange,
        }),
      });

      console.log(
        'Add/Remove Request:',
        JSON.stringify({
          receiverId: userId,
          score: scoreChange,
        })
      );

      if (addRemoveResponse.ok) {
        setLoading(true); // Start loading immediately

        // Reset the form

        console.log('Score added/removed successfully');

        setSuccess(true);
        setRefreshLeaderboard((prevRefresh) => !prevRefresh);

        // Reset the form
        setSelectedDisplayName('');
        setScoreChange(0);

        // Turn off loading after the modal appears
        setLoading(false);
      } else {
        const errorResponse = await addRemoveResponse.json();
        console.error('Error adding/removing score:', errorResponse);
        setError(ERROR_MESSAGES.addRemoveError);
        setLoading(false); // Turn off loading in case of an error
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setLoading(false); // Turn off loading in case of an error
    }
  };

  console.log('Fetched User Display Names:', userDisplayNames);

  const incrementScore = () => {
    setScoreChange(scoreChange + 1);
  };

  const decrementScore = () => {
    setScoreChange(scoreChange - 1);
  };

  return (
    <Fragment>
      <form onSubmit={submitHandler} className={classes['form-container']}>
        <div className={classes['form-section']}>
          <label className={classes.label}>Select User:</label>
          <select
            value={selectedDisplayName}
            onChange={displayNameChangeHandler}
            className={classes['select-field']}
          >
            <option value=''>Select...</option>
            {userDisplayNames
              .filter((user) => user.role === 'member') // Filter users in the frontend
              .map((user) => (
                <option key={user.displayName} value={user.displayName}>
                  {user.displayName}
                </option>
              ))}
          </select>
        </div>
        <div className={classes['form-section']}>
          <label className={classes.label}>Score Change:</label>
          <div className={classes['input-container']}>
            <button
              type='button'
              className={classes['decrement-button']}
              onClick={decrementScore}
            >
              -
            </button>
            <input
              type='number'
              value={scoreChange}
              onChange={scoreChangeHandler}
              className={classes['input-field']}
            />

            <button
              type='button'
              className={classes['increment-button']}
              onClick={incrementScore}
            >
              +
            </button>
          </div>
        </div>
        <div
          className={`${classes['submit-section']} ${
            success ? classes.success : ''
          }`}
        >
          {loading ? ( // Conditionally render loading animation or submit button
            <div className={classes['loading-spinner']}></div>
          ) : (
            <Button type='submit'>Submit</Button>
          )}
        </div>
      </form>
      {error && (
        <ResponseModal
          title='Error'
          message={error}
          onConfirm={() => setError(null)}
        />
      )}
      {success && (
        <ResponseModal
          title='Success'
          message='Score added/removed successfully.'
          onConfirm={() => setSuccess(false)}
        />
      )}
    </Fragment>
  );
};

export default EditScore;
