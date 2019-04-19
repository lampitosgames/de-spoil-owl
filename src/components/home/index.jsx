import Utils from '../../utils';
import React from 'react';
import Match from '../match';

const initialState = {
  matches: [],
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
  return 0;
}

export default class Home extends React.Component {
  constructor() {
    super();
    this.state = initialState;
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    Utils.fetchAllMatches();
    Utils.on.matchesUpdate(this.state.listenerKey, () => {
      this.setState({ matches: Object.values(Utils.getAllMatches()).sort(matchSort) });
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

  handleLogout() {
    Utils.get('/logout', {}).then(() => {
      Utils.trigger.logout();
    }).catch((err) => { console.dir(err); })
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
    let matchKey = 0;
    const matchJSX = this.state.matches.map((m) => {
      let isMatchFav = (m.title in Utils.getWatchLaterMatches());
      return (
        <Match key={matchKey++} loggedIn={this.state.loggedIn} match={m} title={m.title} favorited={isMatchFav} favoriteToggle={this.favoriteToggle.bind(this)}/>
      )
    });
    return (
      <div>
        {matchJSX}
      </div>
    )
  }
}