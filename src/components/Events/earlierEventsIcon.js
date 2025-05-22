import React from 'react';

export default class EarlierEventsIcon extends React.Component {
  render() {
    return (
      <div className="earlier-events-icon" onClick={this.props.onClick}>
        <i className="fa fa-chevron-up" />
        <p className="BodySecondary">see earlier events</p>
      </div>
    );
  }
}
