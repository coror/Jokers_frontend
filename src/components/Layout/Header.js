import React, { Fragment } from 'react';
import classes from './Header.module.css';
import logoImage from '../../assets/updatedLogo.jpg'; 

const Header = (props) => {
  return (
    <Fragment>
      <header className={classes.header}>
        <div className={classes.logo}>
          <img src={logoImage} alt='Logo'/>
          <h1>{props.children}</h1>
        </div>
      </header>
    </Fragment>
  );
};

export default Header;
