import React, { useState, useEffect } from 'react';
import Parse from 'parse';
import classes from './TransferScore.module.css';
import Button from '../UI/Button';
import ResponseModal from '../UI/ResponseModal'; // Make sure to import the ResponseModal component

const TransferScore = ({
  userId,
  showTransferScore,
  setRefreshLeaderboard,
}) => {
  const [receiverId, setReceiverId] = useState('');
  const [usersInSameGroup, setUsersInSameGroup] = useState([]);
  const [score, setScore] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    const fetchUsersInSameGroup = async () => {
      try {
        const currentUser = Parse.User.current();
        const currentUserGroups = currentUser.get('groupNames'); // Assuming you have a field named 'groups'

        const User = Parse.Object.extend('_User');
        const query = new Parse.Query(User);

        // Find users who have at least one common group with the current user
        query.containedIn('groupNames', currentUserGroups);
        query.notEqualTo('objectId', userId);

        const results = await query.find();
        const users = results.map((user) => ({
          objectId: user.id,
          displayName: user.get('displayName'),
          roleName: user.get('roleName'),
        }));
        setUsersInSameGroup(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsersInSameGroup();
  }, [userId]);

  const handleIncrementScore = () => {
    setScore((prevScore) => prevScore + 1);
  };

  const handleDecrementScore = () => {
    setScore((prevScore) => Math.max(prevScore - 1, 0));
  };

  const handleTransfer = async () => {
    if (!receiverId) {
      setModalTitle('Input Error');
      setModalMessage('Please select a receiver.');
      setIsModalOpen(true);
      return;
    }

    if (!score) {
      setModalTitle('Input Error');
      setModalMessage('Please enter a score.');
      setIsModalOpen(true);
      return;
    }

    const numericScore = parseInt(score, 10);

    try {
      setLoading(true); // Start loading immediately

      // Fetch the group names of the sender and receiver
      const currentUser = Parse.User.current();
      const senderGroups = currentUser.get('groupNames'); // Assuming you have a field named 'groups' in your User class
      const receiver = await new Parse.Query(Parse.User).get(receiverId);
      const receiverGroups = receiver.get('groupNames'); // Assuming you have a field named 'groups' in your User class

      console.log(senderGroups);
      // Check if there are common groups between the sender and receiver
      const commonGroups = senderGroups.filter((group) =>
        receiverGroups.includes(group)
      );

      if (commonGroups.length === 0) {
        setModalTitle('Group Error');
        setModalMessage(
          'You can only transfer score to users with at least one common group.'
        );
        setIsModalOpen(true);
        setLoading(false); // Turn off loading
        return;
      }

      // If they have common groups, proceed with the transfer
      const response = await Parse.Cloud.run('transferScore', {
        score: numericScore,
        senderId: userId,
        receiverId,
      });

      setLoading(false); // Turn off loading after the response

      if (
        response === "You don't have that much score!" ||
        response === 'The user cannot receive more than 10 score per month.' ||
        response === 'The user cannot send more than 10 score per month.'
      ) {
        setModalTitle('Error');
        setModalMessage(response);
      } else {
        setModalTitle('Success');
        setModalMessage(response);
        setReceiverId('');
        setScore(0);
        setRefreshLeaderboard((prevRefresh) => !prevRefresh);
      }

      setIsModalOpen(true);
    } catch (error) {
      console.error('Error transferring score:', error);
      setLoading(false); // Turn off loading in case of an error
      setModalTitle('Transaction Error');
      setModalMessage('Transaction failed. Please try again.');
      setIsModalOpen(true);
    }
  };

  const renderUserOption = (user) => {
    if (user.roleName !== 'coach') {
      return (
        <option key={user.objectId} value={user.objectId}>
          {user.displayName}
        </option>
      );
    }
    return null;
  };

  if (!showTransferScore) {
    return null;
  }

  return (
    <div className={classes['form-container']}>
      <h2 className={classes['form-heading']}>Transfer Score</h2>
      <div className={classes['form-section']}>
        <label className={classes.label}>Select Receiver:</label>
        <select
          className={classes['select-field']}
          value={receiverId}
          onChange={(event) => setReceiverId(event.target.value)}
        >
          <option value=''>Select...</option>
          {usersInSameGroup.map(renderUserOption)}
        </select>
      </div>
      <div className={classes['form-section']}>
        <label className={classes.label}>Score:</label>
        <div className={classes['input-container']}>
          <button
            onClick={handleDecrementScore}
            className={classes['decrement-button']}
          >
            -
          </button>
          <input
            type='number'
            className={classes['input-field']}
            value={score}
            onChange={() => {}} // Dummy onChange to prevent React warning
          />
          <button
            onClick={handleIncrementScore}
            className={classes['increment-button']}
          >
            +
          </button>
        </div>
      </div>
      <div className={classes['submit-section']}>
        {loading ? (
          <div className={classes['loading-spinner']}></div>
        ) : (
          <Button onClick={handleTransfer} className={classes.transferButton}>
            Transfer
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

export default TransferScore;
