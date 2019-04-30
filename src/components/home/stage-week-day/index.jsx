import React from 'react';
import moment from 'moment';
import Collapsible from 'react-collapsible';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';
import ChevronUpIcon from 'mdi-react/ChevronUpIcon';
import Match from '../../match';

const Day = (props) => {
  const matchList = Object.values(props.dayData.Games).sort((a, b) => a.matchNum < b.matchNum ? -1 : 1);
  const matches = matchList.map((match) => {
    return <Match key={match.shortName} match={match} favTog={props.favTog} loggedIn={props.loggedIn}/>
  });

  const mDate = moment(props.dayData.Date).format("dddd MMM Do");
  const triggerText = <span>{props.dayName} - <span className="day-container-date">{mDate}</span></span>;
  return (
    <Collapsible trigger={triggerText} classParentString="day-container" transitionTime={100}>
      <div className="day-inner-div">
        {matches}
      </div>
    </Collapsible>
  )
}

const Week = (props) => {
  const days = Object.keys(props.weekData).map((day) => {
    return <Day key={day} dayName={day} dayData={props.weekData[day]} favTog={props.favTog} loggedIn={props.loggedIn}/>
  });
  return (
    <Collapsible trigger={props.weekName} classParentString="week-container" transitionTime={100}>
      <div className="week-inner-div">
        {days}
      </div>
    </Collapsible>
  )
}

const Stage = (props) => {
  const weeks = Object.keys(props.stageData).map((week) => {
    return <Week key={week} weekName={week} weekData={props.stageData[week]} favTog={props.favTog} loggedIn={props.loggedIn}/>
  });
  const triggerClosed = <span className="collapsible-icon">{props.stageName}<ChevronDownIcon size="2rem"/></span>;
  const triggerOpened = <span className="collapsible-icon">{props.stageName}<ChevronUpIcon size="2rem"/></span>;

  return (
    <Collapsible trigger={triggerClosed} triggerWhenOpen={triggerOpened} classParentString="stage-container" transitionTime={100}>
      <div className="stage-inner-div">
        {weeks}
      </div>
    </Collapsible>
  )
}

export { Stage, Week };