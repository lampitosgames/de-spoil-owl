import React from 'react';
import StarIcon from 'mdi-react/StarIcon';
import StarOutlineIcon from 'mdi-react/StarOutlineIcon';

const WatchLaterButton = (props) => {
  if (!props.loggedIn) {
    return "";
  }
  const displayIcon = props.active ? <StarIcon size="3rem"/> : <StarOutlineIcon size="3rem" />;
  const classes = props.active ? "watch-later-button active-button" : "watch-later-button";
  return (
    <span className={classes} onClick={() => {props.action(props.matchName, props.active);}}>
      {displayIcon}
    </span>
  )
}

export default WatchLaterButton;