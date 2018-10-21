/**
 * Actions / Transitions priority order
 * 1. stateNode.onExit (before any onEntry)
 * 2. transition.actions (before onEntry but after onExit)
 * 3. stateNode.onEntry last executed
 */
import { Machine } from 'xstate'
import { interpret } from 'xstate/lib/interpreter'
import LIGHT_MACHINE_GRAPH from './traffic_light_machine_graph.json'
const TIMER = 1000

const PARAMS = {
  outageChance: 2,
  maxAllowedOutageCount: Infinity,
  onOutage: () => {
    console.log('traffic light on outage')
  },
  timer: {
    red: 2000,
    yellow: 1000,
    green: 3000,
  },
}

const OPTIONS = {
  timer: TIMER,
  noOutage: false,
  debug: false,
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

    this.params = { ...PARAMS, ...params }
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
    this.started = false
    this._tick = 0
    this._powerOutage = false
    this._powerOutageCount = 0

    if (this.options.debug) {
      this.interpreter.onTransition(this._log.bind(this))
    }
  }

  getCurrentColorState() {
    const currentStateValue = this.currentState.value
    if (this._powerOutage) {
      return {
        outage: true,
        traffic: 'yellow',
        pedestrian: 'wait',
      }
    }
    if (typeof currentStateValue === 'object') {
      return {
        outage: false,
        traffic: 'red',
        pedestrian: currentStateValue.red,
      }
    }

    return {
      outage: false,
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
    this.started = true
    console.log('traffic light started \u{1F6A6}')
  }

  stop() {
    console.log(
      'stopping road light. power outages: %s \u{1F51A}',
      this._powerOutageCount
    )
    clearInterval(this.ticker)
    this.ticker = null
    this.started = false
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
    this.params.onOutage(this)
    const call = setInterval(() => {
      this.params.onOutage(this)
    }, 5000)
    return () => clearInterval(call)
  }

  _log() {
    console.log('[DEBUG]\ttraffic light state', this.getCurrentColorState())
  }

  _onTick() {
    const { params, options } = this
    let outaged = Math.random() * 100 > 100 - params.outageChance

    if (this._powerOutageCount > params.maxAllowedOutageCount) {
      this.stop()
    }
    if (this._powerOutage) {
      params.onTick && params.onTick(this.getCurrentColorState())
      return
    }
    if (!options.noOutage && outaged) {
      ++this._powerOutageCount
      this._powerOutage = true
      params.onTick && params.onTick(this.getCurrentColorState())
      return this.interpreter.send('POWER_OUTAGE')
    }
    ++this._tick
    const time = this._tick * 1000
    if (this.currentState === 'green' && time > params.timer.green) {
      this.currentState = this.interpreter.send('TIMER')
      this._tick = 0
    }
    if (this.currentState === 'yellow' && time > params.timer.yellow) {
      this.currentState = this.interpreter.send('TIMER')
      this._tick = 0
    }
    if (params.timer.red) {
      if (params.timer.red - time < 3000) {
        this.currentState = this.interpreter.send('PED_TIMER')
      }
      if (time > params.timer.red) {
        this.currentState = this.interpreter.send('TIMER')
        this._tick = 0
      }
    }
    params.onTick && params.onTick(this.getCurrentColorState())
  }
}

export default TrafficLight
