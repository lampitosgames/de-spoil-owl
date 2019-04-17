import React from 'react';

const Button = (props) => {
  return (
    <div className="button" onClick={props.action}>
      {props.displayName}
    </div>
  )
}