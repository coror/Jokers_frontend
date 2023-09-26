import React, { useState } from 'react';
import LeaderboardUsers from '../LeaderboardUsers/userScore/LeaderboardUsers'
import LeaderboardUsersYearly from '../LeaderboardUsers/yearlyScore/LeaderboardUsersYearly';
import LeaderboardUsersMonthly from '../LeaderboardUsers/monthlyScore/LeaderboardUsersMonthly';
import Button from '../UI/Button';
import classes from '../../App.module.css'

const Leaderboard = ({ usersData }) => {
  const [showRegularLeaderboard, setShowRegularLeaderboard] = useState(true);
  const [showYearlyLeaderboard, setShowYearlyLeaderboard] = useState(false);
  const [showMonthlyLeaderboard, setShowMonthlyLeaderboard] = useState(false);

  const showRegular = () => {
    setShowRegularLeaderboard(true);
    setShowYearlyLeaderboard(false);
    setShowMonthlyLeaderboard(false);
  };

  const showYearly = () => {
    setShowRegularLeaderboard(false);
    setShowYearlyLeaderboard(true);
    setShowMonthlyLeaderboard(false);
  };

  const showMonthly = () => {
    setShowRegularLeaderboard(false);
    setShowYearlyLeaderboard(false);
    setShowMonthlyLeaderboard(true);
  };

  return (
    <div>
      <div className={classes['button-container']}>
        <Button
          className={`${classes.toggleLeaderboardButton}`}
          onClick={showRegular}
          disabled={showRegularLeaderboard}
        >
          All time
        </Button>
        <Button
          className={`${classes.toggleLeaderboardButton}`}
          onClick={showYearly}
          disabled={showYearlyLeaderboard}
        >
          Yearly
        </Button>
        <Button
          className={`${classes.toggleLeaderboardButton}`}
          onClick={showMonthly}
          disabled={showMonthlyLeaderboard}
        >
          Monthly
        </Button>
      </div>
      <div className={`${classes['fade-animation']} ${showRegularLeaderboard ? '' : classes['fade-out']}`}>
        {showRegularLeaderboard && <LeaderboardUsers users={usersData} />}
      </div>
      <div className={`${classes['fade-animation']} ${showYearlyLeaderboard ? '' : classes['fade-out']}`}>
        {showYearlyLeaderboard && <LeaderboardUsersYearly users={usersData} />}
      </div>
      <div className={`${classes['fade-animation']} ${showMonthlyLeaderboard ? '' : classes['fade-out']}`}>
        {showMonthlyLeaderboard && <LeaderboardUsersMonthly users={usersData} />}
      </div>
    </div>
  );
};

export default Leaderboard;
