import React from 'react';
import { Redirect } from 'react-router-dom';
import Match from '../match';
import { matchSort } from '../home';
import Utils from '../../utils';

const initialState = {
  loggedOut: false,
  matches: [],
  listenerKey: "watch-later-page"
};

export default class WatchLater extends React.Component {
  constructor() {
    super();
    this.state = initialState;
  }

  componentDidMount() {
    Utils.fetchAllMatches();
    Utils.on.logout(this.state.listenerKey, () => this.setState({ loggedOut: true }));
    Utils.on.matchesUpdate(this.state.listenerKey, () => {
      this.setState({ matches: Object.values(Utils.getWatchLaterMatches()).sort(matchSort) });
    });
  }

  componentWillUnmount() {
    Utils.unsubscribe.logout(this.state.listenerKey);
    Utils.unsubscribe.matchesUpdate(this.state.listenerKey);
  }

  favoriteToggle(matchName, isFavorited) {
    Utils.post('/removeMatch', { title: matchName }).catch((err) => console.error(err));
    Utils.fetchWatchLaterMatches();
  }

  render() {
    if (this.state.loggedOut) {
      return <Redirect to="/"/>;
    }
    if (this.state.matches.length === 0) {
      return (
        <h3>No matches saved</h3>
      );
    }
    let matchKey = 0;
    const matchJSX = this.state.matches.map((m) => {
      return (
        <Match key={matchKey++} loggedIn={true} match={m} title={m.title} favorited={true} favoriteToggle={this.favoriteToggle.bind(this)}/>
      )
    });
    return (
      <div>
        {matchJSX}
      </div>
    )
  }
}