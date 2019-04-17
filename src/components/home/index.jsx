import Utils from '../../utils';
import React from 'react';
const Home = () => {
  Utils.get('/allMatches', {}).then((allGames) => {
    console.dir(allGames);
  }).catch((err) => console.error(err));
  return (
    <h3>Home</h3>
  );
};

export default Home;