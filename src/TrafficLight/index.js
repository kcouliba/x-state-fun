import React, { Component } from 'react'
import TrafficLight from './light_machine'
import './TrafficLight.css'

class LightRoad extends Component {
  constructor(props) {
    super(props)
    const { timer } = props

    const trafficLight = new TrafficLight({
      outageChance: Math.ceil(Math.round(Math.random() * 50)),
      onOutage: this.onOutage.bind(this),
      onTick: this.updateLightState.bind(this),
      timer,
    })
    this.state = { trafficLight }
  }

  componentDidMount() {
    const { trafficLight } = this.state

    trafficLight && trafficLight.start()
  }

  onOutage(light) {
    const { warnOutage } = this.props

    warnOutage && warnOutage(light)
  }

  updateLightState(lightState) {
    this.setState({
      outage: lightState.outage,
      traffic: {
        red: lightState.traffic === 'red',
        yellow: lightState.traffic === 'yellow',
        green: lightState.traffic === 'green',
      },
      pedestrian: {
        stop: lightState.pedestrian === 'stop',
        walk: lightState.pedestrian === 'walk',
        wait: lightState.pedestrian === 'wait',
      },
    })
  }

  render() {
    const { trafficLight, traffic = {}, pedestrian = {}, outage } = this.state

    if (!trafficLight) {
      return <p>Traffic light under maintenance... {'\u{1F6A7}'}</p>
    }
    return (
      <div className={`traffic-light ${outage ? 'outage' : ''}`}>
        <div className="traffic">
          <p className={`light-red ${traffic.red ? 'active' : ''}`}>o</p>
          <p className={`light-yellow ${traffic.yellow ? 'active' : ''}`}>o</p>
          <p className={`light-green ${traffic.green ? 'active' : ''}`}>o</p>
        </div>
        <div className="pedestrian">
          <p className={`light-red ${pedestrian.stop ? 'active' : ''}`}>STOP</p>
          <p className={`light-yellow ${pedestrian.wait ? 'active' : ''}`}>
            WAIT
          </p>
          <p className={`light-green ${pedestrian.walk ? 'active' : ''}`}>GO</p>
        </div>
        {outage && <p className="warning">OUTAGE {'\u{26A0}'}</p>}
      </div>
    )
  }
}

export default LightRoad
