import Utils from '../../utils';
import React from 'react';
import { Stage } from './stage-week-day';
import './home.scss';

const initialState = {
  matchData: {},
  listenerKey: "home",
  loggedIn: false
};

export const matchSort = (a, b) => {
  if (a.gameDate[0] < b.gameDate[0]) {
    return 1;
  } else if (a.gameDate[0] > b.gameDate[0]) {
    return -1;
  }
  //Check week
  if (a.gameDate[1] < b.gameDate[1]) {
    return 1;
  } else if (a.gameDate[1] > b.gameDate[1]) {
    return -1;
  }
  //Check day
  if (a.gameDate[2] < b.gameDate[2]) {
    return 1;
  } else if (a.gameDate[2] > b.gameDate[2]) {
    return -1;
  }
  //Check same-day matches for order
  if (a.matchNum < b.matchNum) {
    return 1;
  } else if (a.matchNum > b.matchNum) {
    return -1;
  }
  return 0;
}

export default class Home extends React.Component {
  constructor() {
    super();
    this.state = initialState;
  }

  componentDidMount() {
    Utils.fetchAllMatches();
    Utils.on.matchesUpdate(this.state.listenerKey, () => {
      this.setState({ matchData: Utils.getAllMatches() });
    });
    Utils.on.login(this.state.listenerKey, () => this.setState({ loggedIn: true }));
    Utils.on.logout(this.state.listenerKey, () => this.setState({ loggedIn: false }));
    this.setState({ loggedIn: Utils.isLoggedIn() });
  }

  componentWillUnmount() {
    Utils.unsubscribe.matchesUpdate(this.state.listenerKey);
    Utils.unsubscribe.login(this.state.listenerKey);
    Utils.unsubscribe.logout(this.state.listenerKey);
  }

  favoriteToggle(matchName, isFavorited) {
    if (!isFavorited) {
      //If the match isn't yet favorited, save it
      Utils.post('/saveMatch', { title: matchName }).catch((err) => console.error(err));
    } else {
      //If the match is favorited, remove it
      Utils.post('/removeMatch', { title: matchName }).catch((err) => console.error(err));
    }
    Utils.fetchWatchLaterMatches();
  }

  render() {
    const stages = Object.keys(this.state.matchData).map((stage) => {
      return <Stage key={stage} stageName={stage} stageData={this.state.matchData[stage]} favTog={this.favoriteToggle.bind(this)} loggedIn={this.state.loggedIn}/>
    });
    return (
      <div className="home-content noselect">
        {stages}
      </div>);
  }
}