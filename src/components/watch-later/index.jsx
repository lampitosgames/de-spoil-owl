import React from 'react';
import { Redirect } from 'react-router-dom';
import Match from '../match';
import { matchSort } from '../home-old';
import Utils from '../../utils';
import './watch-later.scss';

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
        <div className="no-matches-saved">No matches saved</div>
      );
    }
    let matchKey = 0;
    const matchJSX = this.state.matches.map((m) => {
      return (
        <Match key={m.shortName} match={m} favTog={this.favoriteToggle.bind(this)} favorited={true} loggedIn={true}/>
      )
    });
    return (
      <div>
        {matchJSX}
      </div>
    )
  }
}