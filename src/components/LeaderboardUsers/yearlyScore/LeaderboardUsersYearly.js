import React from 'react';

import LeaderboardUserYearly from './LeaderboardUserYearly';

const LeaderboardUsersYearly = (props) => {

  const sortedUsers = props.users.slice().sort((a, b) => b.yearlyScore - a.yearlyScore)

  return (
    <div>
      {sortedUsers.map(
        (
          user,
          index // Adding index to map function
        ) => (
          <LeaderboardUserYearly
            rank={index + 1} // Calculating rank
            userName={user.userName}
            userTitle={user.userTitle}
            yearlyScore={user.yearlyScore}
            userGroup={user.userGroup}
            userAvatar={user.userAvatar}
            key={user.id}
          />
        )
      )}
    </div>
  );
};

export default LeaderboardUsersYearly;
