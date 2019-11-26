import React from 'react';

export default class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      ticks: 0,
    };
  }

  componentDidMount() {
    this.timerId = setInterval(() => this.tick(),1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  tick() {
    this.setState(
      { date: new Date(),
        ticks: this.state.ticks + 1
      });
  }

  render() {
    return (
      <div>
        <span>{this.state.date.toLocaleTimeString()} (+{this.state.ticks} seconds)</span>
      </div>
    );
  }
}
