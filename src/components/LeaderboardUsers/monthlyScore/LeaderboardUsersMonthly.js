import React from 'react';

import LeaderboardUserMonthly from './LeaderboardUserMonthly';

const LeaderboardUsersMonthly = (props) => {

  const sortedUsers = props.users.slice().sort((a, b) => b.monthlyScore - a.monthlyScore);

  return (
    <div>
      {sortedUsers.map(
        (
          user,
          index // Adding index to map function
        ) => (
          <LeaderboardUserMonthly
            rank={index + 1} // Calculating rank
            userName={user.userName}
            userTitle={user.userTitle}
            monthlyScore={user.monthlyScore}
            userGroup={user.userGroup}
            userAvatar={user.userAvatar}
            key={user.id}
          />
        )
      )}
    </div>
  );
};

export default LeaderboardUsersMonthly;
