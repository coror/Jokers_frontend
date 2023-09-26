import React, { useState, useEffect } from 'react';
import ResponseModal from '../UI/ResponseModal';
import classes from './UpdateAvatar.module.css';

function UpdateAvatar({ userObjectId, setRefreshLeaderboard }) {
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAvatars, setLoadingAvatars] = useState(true); // Add loading state for avatars

  // Function to fetch avatar data from your backend
  const fetchAvatars = async () => {
    try {
      const response = await fetch(
        'https://parseapi.back4app.com/parse/functions/fetchAvatars',
        {
          method: 'POST',
          headers: {
            'X-Parse-Application-Id':
            process.env.REACT_APP_PARSE_APPLICATION_ID,
            'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch avatars.');
      }

      const data = await response.json();

      // Ensure that data is an array before setting it in state
      if (Array.isArray(data.result)) {
        setAvatars(data.result); // Update state with fetched avatars
      } else {
        console.error('Fetched data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching avatars:', error);
    } finally {
      setLoadingAvatars(false);
    }
  };

  useEffect(() => {
    // Fetch avatar data when the component mounts
    fetchAvatars();
  }, []);

  // Function to handle avatar selection and update user avatar
  const handleSelectAvatar = async (avatarId) => {
    setSelectedAvatar(avatarId);

    try {
      // Construct your API request body
      const requestBody = {
        objectId: userObjectId, // User's objectId
        avatarId: avatarId,
      };

      // Send a PUT request to your backend API to update the user's avatar
      const response = await fetch(
        'https://parseapi.back4app.com/parse/functions/updateAvatar',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Parse-Application-Id':
            process.env.REACT_APP_PARSE_APPLICATION_ID,
            'X-Parse-REST-API-Key': process.env.REACT_APP_PARSE_REST_API_KEY,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update avatar.');
      }

      // Handle success (e.g., show a success message)
      openModal();

      setRefreshLeaderboard(true); 
    } catch (error) {
      console.error('Error updating avatar:', error);
      // Handle error (e.g., show an error message)
    }
  };

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={classes.container}>
      <h2 className={classes.h2}>Update Your Avatar</h2>
      {loadingAvatars ? (
        <div className={classes['loading-spinner']}></div>
      ) : (
        <div className={classes['avatar-list']}>
          {avatars.map((avatar) => (
            <div
              key={avatar.objectId}
              className={`${classes['avatar-item']} ${
                avatar.objectId === selectedAvatar ? classes['selected'] : ''
              }`}
              onClick={() => handleSelectAvatar(avatar.objectId)}
            >
              <img
                src={avatar.url}
                alt={`Avatar ${avatar.objectId}`}
                className={classes['avatar-image']}
              />
            </div>
          ))}
        </div>
      )}
      {/* ResponseModal */}
      {isModalOpen && (
        <ResponseModal
          title='Avatar Updated'
          message='Your avatar has been updated successfully.'
          onConfirm={closeModal} // Close the modal when the "Okay" button is clicked
        >
          {/* Display the selected avatar in the modal */}
          {selectedAvatar && (
            <img
              src={
                avatars.find((avatar) => avatar.objectId === selectedAvatar)
                  ?.url
              }
              alt={`Selected Avatar`}
              className={classes['avatar-image']}
            />
          )}
        </ResponseModal>
      )}
    </div>
  );
}

export default UpdateAvatar;
