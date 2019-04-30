import React from 'react';
import './match.scss';
import WatchLaterButton from './toggle-wl-button';
import Utils from '../../utils';

const VideoLink = (props) => {
  return (
    <a className="video-link" href={props.href} target="_blank" rel="noopener noreferrer">
      <img alt="twitch.tv thumbnail for game" className="video-link-image" src={props.thumbnail}/>
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
  const videos = props.match.games.sort(gamesSort).map((game) => {
    return (
      <div key={game.gameNumber} className="single-game">
        <VideoLink href={game.video} thumbnail={props.match.thumb}/>
        <div className="single-game-name" >Game {game.gameNumber}</div>
      </div>
    );
  });

  let isMatchFav = (props.match.displayTitle in Utils.getWatchLaterMatches());

  let [matchTitle] = props.match.displayTitle.split(" | ");
  let upcomingText = props.match.isFutureMatch ? <span className="match-future">Upcoming Match</span> : "";
  return (
    <div className="match-wrapper">
      <div className="match-title">
        <span className="match-title-text">{matchTitle}</span>
        {upcomingText}
        <WatchLaterButton loggedIn={props.loggedIn} action={props.favTog} active={isMatchFav} matchName={props.match.displayTitle}/>
      </div>
      <div className="video-wrapper">{videos}</div>
    </div>
  );
}

export default Match;