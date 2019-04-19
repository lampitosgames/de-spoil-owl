import React from 'react';
import ShapeCirclePlusIcon from 'mdi-react/ShapeCirclePlusIcon';
import CloseCircleOutlineIcon from 'mdi-react/CloseCircleOutlineIcon';

const WatchLaterButton = (props) => {
  if (!props.loggedIn) {
    return "";
  }
  const displayIcon = props.active ? <CloseCircleOutlineIcon size="2rem"/> : <ShapeCirclePlusIcon size="2rem" />;
  return (
    <span className="button" onClick={() => {props.action(props.matchName, props.active);}}>
      {displayIcon}
    </span>
  )
}

export default WatchLaterButton;