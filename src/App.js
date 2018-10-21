import React, { Component } from 'react'
import TrafficLight from './TrafficLight'
import RepairBot from './RepairBot'
import './App.css'

const trafficLights = [
  { timer: { red: 1000, yellow: 1000, green: 2000 } },
  // { timer: { red: 2000, yellow: 1000, green: 4000 } },
  // { timer: { red: 3000, yellow: 2000, green: 6000 } },
  // { timer: { red: 4000, yellow: 2000, green: 8000 } },
  // { timer: { red: 5000, yellow: 3000, green: 10000 } },
  // { timer: { red: 6000, yellow: 3000, green: 12000 } },
  // { timer: { red: 1000, yellow: 1000, green: 2000 } },
  // { timer: { red: 2000, yellow: 1000, green: 4000 } },
  // { timer: { red: 3000, yellow: 2000, green: 6000 } },
  // { timer: { red: 4000, yellow: 2000, green: 8000 } },
  // { timer: { red: 5000, yellow: 3000, green: 10000 } },
  // { timer: { red: 6000, yellow: 3000, green: 12000 } },
  // { timer: { red: 1000, yellow: 1000, green: 2000 } },
  // { timer: { red: 2000, yellow: 1000, green: 4000 } },
  // { timer: { red: 3000, yellow: 2000, green: 6000 } },
  // { timer: { red: 4000, yellow: 2000, green: 8000 } },
  // { timer: { red: 5000, yellow: 3000, green: 10000 } },
  // { timer: { red: 6000, yellow: 3000, green: 12000 } },
]
const botCount = Math.ceil(trafficLights.length / 4)

class App extends Component {
  state = {
    lightsToFix: [],
    fixSlots: {},
  }

  componentDidMount() {
    const fixSlots = Array(botCount)
      .fill(null)
      .reduce((acc, slot, idx) => {
        return { ...acc, [idx]: slot }
      }, {})

    this.setState({ fixSlots })
    setInterval(() => {
      this.pushFixes()
    }, 1000)
  }

  pushFixes() {
    const { lightsToFix } = this.state
    const { fixSlots } = this.state
    const slotKeys = Object.keys(fixSlots)

    if (lightsToFix.length > 0) {
      const freeSlotKey = slotKeys.find(slotKey => fixSlots[slotKey] === null)

      if (freeSlotKey) {
        const distance = Math.random() * 1000
        const item = lightsToFix.shift()
        const mission = { distance, item }

        this.setState({
          lightsToFix,
          fixSlots: {
            ...fixSlots,
            [freeSlotKey]: mission,
          },
        })
      }
    }
  }

  queueReparation(light) {
    const { lightsToFix, fixSlots } = this.state
    const slotKeys = Object.keys(fixSlots)
    const isQueued = lightsToFix.includes(light)
    const isProccessing = slotKeys.reduce((acc, slotKey) => {
      const slot = fixSlots[slotKey]

      if (slot) return slot.item === light
      return acc
    }, false)

    if (isQueued || isProccessing) return
    this.setState({
      lightsToFix: lightsToFix.concat([light]),
    })
  }

  handleMissionComplete(item, slotKey) {
    const { fixSlots } = this.state

    this.setState({ fixSlots: { ...fixSlots, [slotKey]: null } })
  }

  render() {
    const { fixSlots } = this.state
    const slotKeys = Object.keys(fixSlots)

    return (
      <div className="App">
        <header className="App-header">
          <h2>Traffic manager</h2>
          <div className="control-panel">
            <div className="lights">
              <h2>Lights</h2>
              <div className="light-container">
                {trafficLights.map((light, idx) => (
                  <TrafficLight
                    key={idx}
                    warnOutage={this.queueReparation.bind(this)}
                    timer={light.timer}
                  />
                ))}
              </div>
            </div>
            <div className="bots">
              <h2>Bots</h2>
              <div className="bot-container">
                {slotKeys.map(slotKey => {
                  const mission = fixSlots[slotKey]

                  return (
                    <RepairBot
                      key={slotKey}
                      mission={mission}
                      onFixed={item =>
                        this.handleMissionComplete(item, slotKey)
                      }
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </header>
      </div>
    )
  }
}

export default App
