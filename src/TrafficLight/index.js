import React, { Component } from 'react'
import TrafficLight from './light_machine'
import './TrafficLight.css'

class LightRoad extends Component {
  constructor(props) {
    super(props)
    const { timer } = props

    const trafficLight = new TrafficLight({
      onBlink: this.onBlink.bind(this),
      onOutage: this.onOutage.bind(this),
      onTick: this.updateLightState.bind(this),
      outageChance: Math.ceil(Math.round(Math.random() * 95)),
      timer,
    })
    this.state = { trafficLight }
  }

  componentDidMount() {
    const { trafficLight } = this.state

    trafficLight && trafficLight.start()
  }

  onBlink() {
    const { blinkOn = false } = this.state
    this.setState({
      blinkOn: !blinkOn,
    })
  }

  onOutage(light) {
    const { warnOutage } = this.props

    warnOutage && warnOutage(light)
  }

  updateLightState(lightState) {
    const { trafficLight } = this.state
    this.setState(trafficLight.getCurrentState())
  }

  renderOutage() {
    const { blinkOn } = this.state

    return (
      <div className="traffic-light outage">
        <div className="traffic">
          <p className="light-red">o</p>
          <p className={`light-yellow ${blinkOn ? 'active' : ''}`}>o</p>
          <p className="light-green">o</p>
        </div>
        <div className="pedestrian">
          <p className="warning">{'\u{26A0}'}</p>
        </div>
      </div>
    )
  }

  render() {
    const { trafficLight, traffic = {}, pedestrian = {}, outage } = this.state
    const { red, yellow, green } = traffic
    const { walk, wait, stop } = pedestrian

    if (!trafficLight) {
      return <p>Traffic light under maintenance... {'\u{1F6A7}'}</p>
    }
    if (outage) {
      return this.renderOutage()
    }
    return (
      <div className="traffic-light">
        <div className="traffic">
          <p className={`light-red ${red ? 'active' : ''}`}>o</p>
          <p className={`light-yellow ${yellow ? 'active' : ''}`}>o</p>
          <p className={`light-green ${green ? 'active' : ''}`}>o</p>
        </div>
        <div className="pedestrian">
          <p className={`light-red ${stop ? 'active' : ''}`}>STOP</p>
          <p className={`light-yellow ${wait ? 'active' : ''}`}>WAIT</p>
          <p className={`light-green ${walk ? 'active' : ''}`}>GO</p>
        </div>
      </div>
    )
  }
}

export default LightRoad
