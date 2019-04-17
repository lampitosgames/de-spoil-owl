import Utils from '../../utils';
import React from 'react';
import Match from '../match';

//Set default sort order.  pulled out into a local var so it can be connected to an endpoint later
let sortNewestOldest = true;

const initialState = {
  loggedIn: false,
  matches: []
};

const matchSort = (a, b) => {
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
    Utils.get('/allMatches', {})
      .then((allGames) => {
        this.setState({ matches: Object.values(allGames).sort(matchSort) })
      }).catch((err) => { console.error(err); });
    Utils.on.login(() => this.setState({ loggedIn: true }));
    Utils.on.logout(() => this.setState({ loggedIn: false }));
  }

  handleLogout() {
    Utils.get('/logout', {}).then(() => {
      Utils.trigger.logout();
    }).catch((err) => { console.dir(err); })
  }

  favoriteToggle(matchName, isFavorited) {
    console.log("Favorited!");
  }

  render() {
    let matchKey = 0;
    const matchJSX = this.state.matches.map((m) => {
      return (
        <Match key={matchKey++} match={m} title={m.title} favorited={false} favoriteToggle={this.favoriteToggle.bind(this)}/>
      )
    });
    return (
      <div>
        {matchJSX}
      </div>
    )
  }
}