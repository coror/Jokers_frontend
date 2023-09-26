import React, { useState, useEffect } from 'react';
import classes from './EditGroup.module.css';
import Button from '../UI/Button';
import ResponseModal from '../UI/ResponseModal';

const GET_USERS_DISPLAY_URL =
  'https://parseapi.back4app.com/functions/getAllDisplayNames'; // Replace with your API endpoint for fetching users

const EditGroup = ({ userId }) => {
  const [users, setUsers] = useState([]); // Added state for users' display names
  const [selectedUser, setSelectedUser] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  // Add state variables for success and error messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUsersDisplayNames = async () => {
      try {
        const response = await fetch(GET_USERS_DISPLAY_URL, {
          method: 'POST',
          headers: {
            'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APPLICATION_ID,
            'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const usersData = data.result.userDisplayNames || [];

          setUsers(usersData);
        }
      } catch (error) {
        console.error('Error fetching users display names:', error);
      }
    };

    fetchUsersDisplayNames(); // Fetch user display names when the component mounts
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(
          `https://parseapi.back4app.com/functions/fetchGroups`,
          {
            method: 'POST',
            headers: {
              'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APPLICATION_ID,
              'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
              'Content-Type': 'application/json',
            },
          }
        ); // Replace with your API endpoint
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data); // Add this line
          console.log(data);
          if (data.result && Array.isArray(data.result)) {
            console.log(data.result);
            setGroups(data.result); // Assuming your API response contains an array of groups
          } else {
            console.error('Invalid data format for groups');
          }
        } else {
          console.error('Error fetching groups');
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        if (!selectedUser) {
          // No user selected, return or handle accordingly
          return;
        }

        // Fetch the user ID based on the selected display name
        const userIdResponse = await fetch(
          'https://parseapi.back4app.com/functions/getUserIdsByDisplayName',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APPLICATION_ID,
              'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
            },
            body: JSON.stringify({ displayName: selectedUser }),
          }
        );

        if (!userIdResponse.ok) {
          console.error('Error fetching user ID:', userIdResponse.status);
          return;
        }

        const userIdData = await userIdResponse.json();
        console.log('UserIdData:', userIdData); // Log the entire response for inspection

        const userId = userIdData.result.userId; // Check if userIdData has the userId property

        if (!userId) {
          console.error('UserId not found in response data');
          return;
        }

        // Now that you have the userId, fetch the user groups
        const response = await fetch(
          'https://parseapi.back4app.com/functions/fetchUserGroups',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APPLICATION_ID,
              'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
            },
            body: JSON.stringify({ userId: userId }), // Use the fetched userId
          }
        );

        console.log('Request URL:', response.url); // Log request URL
        console.log('Request Headers:', response.headers); // Log request headers
        console.log('Request Body:', JSON.stringify({ userId: userId })); // Log request body

        if (!response.ok) {
          console.error('Error fetching user groups:', response.status);
          const errorData = await response.json();
          console.error('Response Data:', errorData); // Log the response data for debugging
          return;
        }

        const data = await response.json();
        const userGroups = data.result || [];
        console.log('User Groups:', userGroups);

        // Update selectedGroups with the groups that the user belongs to
        setSelectedGroups(userGroups.map((group) => group.name));
      } catch (error) {
        console.error('Error in fetchUserGroups:', error);
      }
    };

    if (selectedUser !== '') {
      fetchUserGroups(); // Fetch user groups only when a user is selected
    }
  }, [selectedUser]);

  // Function to handle user selection
  const handleUserChange = (event) => {
    const { value } = event.target;
    console.log(value);
    setSelectedUser(value); // Set the selected user ID
    setSelectedGroups([]); // Clear selected groups when a new user is selected
    setHasChanges(false); // Reset the hasChanges flag
  };

  const handleGroupChange = (event) => {
    const { value } = event.target;

    // Toggle selected groups based on the checkbox value
    setSelectedGroups((prevSelectedGroups) => {
      if (prevSelectedGroups.includes(value)) {
        const newSelectedGroups = prevSelectedGroups.filter(
          (group) => group !== value
        );
        setHasChanges(true);
        return newSelectedGroups;
      } else {
        const newSelectedGroups = [...prevSelectedGroups, value];
        setHasChanges(true);
        return newSelectedGroups;
      }
    });
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    try {
      // Check if a user is selected
      if (!selectedUser || !hasChanges) {
        console.error('No user selected.');
        return;
      }

      // Fetch the user ID based on the selected display name
      const userIdResponse = await fetch(
        'https://parseapi.back4app.com/functions/getUserIdsByDisplayName',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APPLICATION_ID,
            'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
          },
          body: JSON.stringify({ displayName: selectedUser }),
        }
      );

      if (!userIdResponse.ok) {
        console.error('Error fetching user ID:', userIdResponse.status);
        return;
      }

      const userIdData = await userIdResponse.json();
      console.log('UserIdData:', userIdData);

      const userId = userIdData.result.userId;
      console.log('Selected User ID:', userId);

      // Prepare the data to send in the request body
      const data = {
        userId: userId,
        groupNames: Array.isArray(selectedGroups)
          ? selectedGroups
          : [selectedGroups], // Ensure it's an array
      };

      console.log('Data to send:', data);

      // Make an HTTP POST request to your backend Cloud Function
      const response = await fetch(
        'https://parseapi.back4app.com/functions/updateGroup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APPLICATION_ID,
            'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
          },
          body: JSON.stringify(data),
        }
      );

      console.log('Response Status:', response.status); // Log the response status

      if (response.ok) {
        const result = await response.json();
        console.log('Response Data:', result); // Log the response data
        handleSuccess('The groups have been successfully updated'); // Display success message
      } else {
        console.error('Error updating groups:', response.statusText);
        const errorData = await response.json();
        console.error('Response Data:', errorData);
        handleError('Error updating groups. Please try again.'); // Display error message
      }
    } catch (error) {
      console.error('Error in submitHandler:', error);
    }
  };

  // Function to handle successful changes
  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage('');
  };

  // Function to handle errors
  const handleError = (message) => {
    setErrorMessage(message);
    setSuccessMessage('');
  };

  return (
    <div className={classes.container}>
      <h2>Edit Group</h2>
      <div className={classes.userSelection}>
        <h3>Select User to Edit</h3>
        <select
          value={selectedUser}
          onChange={handleUserChange}
          className={classes['select-field']}
        >
          <option key='' value=''>
            Select a user
          </option>
          {users
            .filter((user) => user.role === 'member')
            .map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.displayName}
              </option>
            ))}
        </select>
      </div>
      {selectedUser && (
        <div
          className={`${classes.groupContainer} ${classes.groupCheckboxLeft}`}
        >
          <h3>Available Groups</h3>
          {groups.map((group) => {
            const isChecked = selectedGroups.includes(group.name);

            return (
              <div key={group.name}>
                <input
                  type='checkbox'
                  name='selectedGroups'
                  value={group.name}
                  checked={isChecked}
                  onChange={handleGroupChange}
                />
                {group.name}
              </div>
            );
          })}
        </div>
      )}
      {hasChanges && (
        <Button type='submit' onClick={submitHandler}>
          Submit
        </Button>
      )}

      {/* Success and Error Modals */}
      {successMessage && (
        <ResponseModal
          title='Success'
          message={successMessage}
          onConfirm={() => {
            setSuccessMessage('');
            // Add any additional logic here after confirming the success message.
          }}
        />
      )}
      {errorMessage && (
        <ResponseModal
          title='Error'
          message={errorMessage}
          onConfirm={() => {
            setErrorMessage('');
            // Add any additional logic here after confirming the error message.
          }}
        />
      )}
    </div>
  );
};

export default EditGroup;
