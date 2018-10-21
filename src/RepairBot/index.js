import React, { Component } from 'react'
import RepairBot from './repair_bot_machine'
import './RepairBot.css'

class Bot extends Component {
  state = {
    started: false,
  }
  constructor(props) {
    super(props)

    const repairBot = new RepairBot()
    this.state = { repairBot }
  }

  componentDidMount() {
    const { mission } = this.props
    const { repairBot } = this.state

    repairBot && repairBot.start()
    this.setState(repairBot.getCurrentState())
    if (mission) this.startMission(mission)
  }

  componentWillReceiveProps({ mission }) {
    if (mission) this.startMission(mission)
  }

  startMission(mission) {
    const speed = 200
    const { repairBot } = this.state
    const { distance } = mission
    const travelTime = (distance / speed) * 1000

    console.log(
      'bot travel time for mission is %s seconds',
      Math.round(travelTime / 1000)
    )
    repairBot.goFix()
    this.setState(repairBot.getCurrentState())
    setTimeout(() => {
      repairBot.landToFixPlace()
      this.setState(repairBot.getCurrentState())
      this.investigateMission(mission)
    }, travelTime)
  }

  investigateMission(mission) {
    const { repairBot } = this.state
    const { item } = mission
    const investigationTime = Math.random() * 5000

    console.log(
      'bot mission investigation time is %s seconds',
      Math.round(investigationTime / 1000)
    )
    repairBot.investigate()
    this.setState(repairBot.getCurrentState())
    setTimeout(() => {
      this.fix(item)
    }, investigationTime)
  }

  fix(item) {
    const { repairBot } = this.state
    const fixTime = Math.random() * 2000

    console.log(
      'bot item fixing time is %s seconds',
      Math.round(fixTime / 1000)
    )
    repairBot.fix()
    this.setState(repairBot.getCurrentState())
    setTimeout(() => {
      const { onFixed } = this.props
      const failure = fixTime > 1900

      if (failure) {
        console.log('bot failed to fix item')
        return repairBot.failedToFix()
      }
      item && item.fix()
      repairBot.successfullyFixed()
      onFixed && onFixed(item)
      this.setState(repairBot.getCurrentState())
    }, fixTime)
  }

  render() {
    const {
      repairBot,
      available,
      moving,
      inPlace,
      diagnosing,
      repairing,
    } = this.state

    if (!repairBot) {
      return <p>Repair bot under maintenance... {'\u{1F6A7}'}</p>
    }
    return (
      <div className="repair_bot">
        <img
          className="bot-image"
          src="https://media.sproutsocial.com/uploads/2018/03/The-Complete-Guide-to-Chatbots-b605987a-a012-4ed4-a490-14ad11f88ac5.png"
          alt="bot"
        />
        <div className="bot-status">
          {available && <p>available</p>}
          {moving && <p>moving</p>}
          {inPlace && <p>inPlace</p>}
          {diagnosing && <p>diagnosing</p>}
          {repairing && <p>repairing</p>}
        </div>
      </div>
    )
  }
}

export default Bot
