import React from 'react';

import LeaderboardUser from './LeaderboardUser';

const LeaderboardUsers = (props) => {
  return (
    <div>
      {props.users.map(
        (
          user,
          index // Adding index to map function
        ) => (
          <LeaderboardUser
            rank={index + 1} // Calculating rank
            userName={user.userName}
            userTitle={user.userTitle}
            userScore={user.userScore}
            userGroup={user.userGroup}
            userAvatar={user.userAvatar}
            key={user.id}
          />
        )
      )}
    </div>
  );
};

export default LeaderboardUsers;
