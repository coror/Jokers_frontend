import React, { useState, Fragment, useReducer, useEffect } from 'react';
import Button from '../UI/Button';
import formReducer from '../helpers/formReducer';

import classes from './RegistrationForm.module.css';
import ResponseModal from '../UI/ResponseModal';

const initialState = {
  name: '',
  surname: '',
  email: '',
  password: '',
  groupName: [],
  roleName: '',
  userScore: '',
};

const RegistrationForm = ({ setRefreshLeaderboard }) => {
  const [formData, dispatch] = useReducer(formReducer, initialState);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [groups, setGroups] = useState([]); // State variable to store the list of groups

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(
          `https://parseapi.back4app.com/functions/fetchGroups`,
          {
            method: 'POST',
            headers: {
              'X-Parse-Application-Id':
              process.env.REACT_APP_PARSE_APPLICATION_ID                                          ,
              'X-Parse-REST-API-Key':
              process.env.REACT_APP_PARSE_REST_API_KEY,
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

  const submitHandler = async (event) => {
    event.preventDefault();

    const numericScore = +formData.userScore;

    const cloudFunctionName = 'createUser';
    const url = `https://parseapi.back4app.com/functions/${cloudFunctionName}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Parse-Application-Id': process.env.REACT_APP_PARSE_APPLICATION_ID,
          'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          password: formData.password,
          email: formData.email,
          groupNames: Array.isArray(formData.groupName)
            ? formData.groupName
            : [], // Ensure groupName is an array
          roleName: formData.roleName,
          userScore: numericScore,
        }),
      });
      console.log(formData.groupName);

      if (
        formData.name.trim().length === 0 ||
        formData.name.trim().length > 10
      ) {
        setError({
          title: 'Invalid input',
          message:
            'Name cannot be empty and cannot be longer than 10 characters.',
        });
      } else if (
        formData.surname.trim().length === 0 ||
        formData.surname.trim().length > 10
      ) {
        setError({
          title: 'Invalid input',
          message:
            'Surname cannot be empty and cannot be longer than 10 characters.',
        });
      } else if (formData.email.trim().length === 0) {
        setError({
          title: 'Invalid input',
          message: 'Please enter a valid email',
        });
      } else if (formData.roleName.trim().length === 0) {
        setError({
          title: 'Invalid input',
          message: 'Please enter a group/role',
        });
      } else if (formData.password.trim().length < 8) {
        setError({
          title: 'Invalid input',
          message: 'Password must be longer than 8 characters',
        });
      } else if (numericScore < 0) {
        setError({
          title: 'Invalid input',
          message: 'Score cannot be a negative number',
        });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        dispatch({ type: 'RESET_FORM' });
        setSuccess(true);
        setRefreshLeaderboard((prevRefresh) => !prevRefresh);
      } else {
        const errorData = await response.json();
        console.error('Error registering user:', errorData);
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const errorHandler = () => {
    setError(null);
    setSuccess(false);
  };

  const inputChangeHandler = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === 'checkbox') {
      // Handle checkbox inputs (roleName and groupName)
      if (name === 'roleName') {
        dispatch({ type: 'UPDATE_FIELD', field: name, value });
      } else if (name === 'groupName') {
        let updatedGroupNames;
        if (checked) {
          // If the checkbox is checked, add the group to the array
          updatedGroupNames = [...formData.groupName, value];
        } else {
          // If the checkbox is unchecked, remove the group from the array
          updatedGroupNames = formData.groupName.filter(
            (group) => group !== value
          );
        }
        dispatch({
          type: 'UPDATE_FIELD',
          field: name,
          value: updatedGroupNames,
        });
      }
    } else {
      // Handle other input fields
      dispatch({ type: 'UPDATE_FIELD', field: name, value });
    }
  };

  return (
    <Fragment>
      {error && (
        <ResponseModal
          title={error.title}
          message={error.message}
          onConfirm={errorHandler}
        />
      )}
      {success && (
        <ResponseModal
          title='Success'
          message='The user was successfully created!'
          onConfirm={errorHandler}
        />
      )}
      <form
        className={`${classes.input} ${classes.form}`}
        onSubmit={submitHandler}
      >
        <input
          type='text'
          name='name'
          placeholder='Name'
          value={formData.name}
          onChange={inputChangeHandler}
        />
        <input
          type='text'
          name='surname'
          placeholder='Surname'
          value={formData.surname}
          onChange={inputChangeHandler}
        />
        <input
          type='email'
          name='email'
          placeholder='Email'
          value={formData.email}
          onChange={inputChangeHandler}
        />
        <input
          type='password'
          name='password'
          placeholder='Password'
          value={formData.password}
          onChange={inputChangeHandler}
        />
        <div className={classes.groupContainer}>
          {groups.map((group) => (
            <div key={group.objectId} className={classes.groupCheckbox}>
              <div className={classes.checkbox}>
                <input
                  type='checkbox'
                  name='groupName'
                  value={group.name}
                  checked={formData.groupName.includes(group.name)}
                  onChange={inputChangeHandler}
                />
              </div>
              <div className={classes.label}>
                <label>{group.name}</label>
              </div>
            </div>
          ))}
        </div>

        <div className={classes.roleContainer}>
          <input
            type='checkbox'
            id='member'
            name='roleName'
            value='member'
            checked={formData.roleName === 'member'}
            onChange={inputChangeHandler}
          />
          <label htmlFor='member'>Member</label>

          <input
            type='checkbox'
            id='coach'
            name='roleName'
            value='coach'
            checked={formData.roleName === 'coach'}
            onChange={inputChangeHandler}
          />
          <label htmlFor='coach'>Coach</label>
        </div>
        <input
          type='number'
          name='userScore'
          placeholder='User Score'
          value={formData.userScore}
          onChange={inputChangeHandler}
        />
        <div className={classes.buttonContainer}>
          <Button type='submit'>Submit</Button>
        </div>
      </form>
    </Fragment>
  );
};

export default RegistrationForm;
