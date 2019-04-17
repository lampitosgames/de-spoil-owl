import React from 'react';
import './match.scss';

const VideoLink = (props) => {
  return (
    <a className="video-link" href={props.href} target="_blank">
      <img className="video-link-image" src={props.thumbnail}/>
    </a>
  );
}

const gamesSort = (a, b) => {
  if (a.gameNumber < b.gameNumber) {
    return -1;
  } else if (a.gameNumber > b.gameNumber) {
    return 1;
  }
  return 0;
}

const Match = (props) => {
  let i = 0;
  const videos = props.match.games.sort(gamesSort).map((game) => {
    return (
      <div key={game.gameNumber} className="single-game">
        <VideoLink href={game.video} thumbnail={props.match.thumb}/>
        <div className="single-game-name" >Game {game.gameNumber}</div>
      </div>
    );
  })
  return (
    <div className="match-wrapper">
      <h1>{props.title}</h1>
      <div className="video-wrapper">{videos}</div>
    </div>
  );
}

export default Match;