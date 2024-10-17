import React from 'react';

export default class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
    }
  }

  componentDidMount() {
    this.timerId = setInterval(() => this.tick(),1000 * 60);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div>
        <span>{this.state.date.toLocaleTimeString([], {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        })}</span>
      </div>
    );
  }
}
