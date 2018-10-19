/**
 * Actions / Transitions priority order
 * 1. stateNode.onExit (before any onEntry)
 * 2. transition.actions (before onEntry but after onExit)
 * 3. stateNode.onEntry last executed
 */
const { Machine } = require('xstate')
const { interpret } = require('xstate/lib/interpreter')
const LIGHT_MACHINE_GRAPH = require('./traffic_light_machine_graph.json')
const TIMER = 1000

const PARAMS = {
  onOutage: () => {
    console.log('traffic light on outage')
  },
}

const OPTIONS = {
  timer: TIMER,
  debug: true,
}

/**
 *
 */
class TrafficLight {
  /**
   *
   * @param {Object} params
   *  @prop {Function} onOutage
   * @param {Object} options
   */
  constructor(params = PARAMS, options = {}) {
    const actions = {}
    const context = {}
    const activities = {
      warnOutage: this.warnOutage.bind(this),
      blinkYellowLight: this.blinkYellowLight.bind(this),
    }

    this.backupBatteryLevel = 100
    this.params = params
    this.options = { ...OPTIONS, ...options }
    this.lightMachine = Machine(
      LIGHT_MACHINE_GRAPH,
      {
        actions,
        activities,
        /* guards, services */
      },
      context
    )
    this.interpreter = interpret(this.lightMachine)
    this.currentState = this.lightMachine.initialState
    this.ticker = null
    this._tick = 0
    this._powerOutage = false
    this._powerOutageCount = 0

    if (this.options.debug) {
      this.interpreter.onTransition(this.log.bind(this))
    }
  }

  log() {
    console.log('[DEBUG]\ttraffic light state', this.getCurrentColorState())
  }

  getCurrentColorState() {
    const currentStateValue = this.currentState.value
    if (typeof currentStateValue === 'object') {
      return {
        traffic: 'red',
        pedestrian: currentStateValue.red,
      }
    }

    return {
      traffic: currentStateValue,
      pedestrian: 'stop',
    }
  }

  fix() {
    console.log('light repaired \u{1F4AA}')
    if (this._powerOutage) {
      this._powerOutage = false
      return this.interpreter.send('POWER_RESTORE')
    }
  }

  start() {
    this.interpreter.start()
    this.ticker = setInterval(this._onTick.bind(this), this.options.timer)
    console.log('traffic light started \u{1F6A6}')
  }

  stop() {
    console.log(
      'stopping road light. power outages: %s \u{1F51A}',
      this._powerOutageCount
    )
    clearInterval(this.ticker)
    this.ticker = null
    this.interpreter.stop()
  }

  blinkYellowLight() {
    const call = setInterval(() => {
      console.log('yellow light blinking \u{26A0}')
    }, 1000)
    return () => {
      console.log('stop yellow light blinking')
      clearInterval(call)
    }
  }

  warnOutage() {
    const call = setInterval(() => {
      this.params.onOutage()
    }, 5000)
    return () => clearInterval(call)
  }

  _onTick() {
    const outaged = Math.random() * 100 > 90
    if (this._powerOutageCount > 3) {
      this.stop()
    }
    if (!this._powerOutage && outaged) {
      ++this._powerOutageCount
      this._powerOutage = true
      return this.interpreter.send('POWER_OUTAGE')
    }
    ++this._tick
    if (this._tick >= 3) {
      this.currentState = this.interpreter.send('TIMER')
      this._tick = 0
    }
    this.currentState = this.interpreter.send('PED_TIMER')
  }
}

// test code
let repairerWarned = false
const trafficLight = new TrafficLight({
  onOutage: () => {
    if (!repairerWarned) {
      const interventionTime = Math.random() * 10000 // from 0 to 10 seconds

      console.log(
        'repairer warned intervention in %s seconds \u{231B}',
        Math.round(interventionTime / 1000)
      )
      repairerWarned = true
      setTimeout(() => {
        console.log('repairer intervention \u{1F477}')
        trafficLight.fix()
        repairerWarned = false
      }, interventionTime)
    }
  },
})

trafficLight.start()

module.exports = TrafficLight
