import React, { Fragment } from 'react';
import ReactDom from 'react-dom'; // we need it for portals

import Card from './Card';
import Button from './Button';
import classes from './ResponseModal.module.css';

const Backdrop = (props) => {
  return <div className={classes.backdrop} onClick={props.onConfirm}></div>;
}; // check in public 2 new divs. Portals so it renders on top

const ModalOverlay = (props) => {
  return (
    <Card className={classes.modal}>
      <header className={classes.header}>
        <h2>{props.title}</h2>
      </header>
      <div className={classes.content}>
        <p>{props.message}</p>
      </div>
      <footer className={classes.actions}>
        <Button onClick={props.onConfirm} className={classes.button}>
          Okay
        </Button>
      </footer>
    </Card>
  );
};

const ResponseModal = (props) => {
  return (
    <Fragment>
      {ReactDom.createPortal(
        <Backdrop onConfirm={props.onConfirm} />,
        document.getElementById('backdrop-root')
      )}
      {ReactDom.createPortal(
        <ModalOverlay
          title={props.title}
          message={props.message}
          onConfirm={props.onConfirm}
        />,
        document.getElementById('overlay-root')
      )}
    </Fragment>
  );
};

export default ResponseModal;
