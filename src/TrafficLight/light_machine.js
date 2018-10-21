import { Machine } from 'xstate'
import { interpret } from 'xstate/lib/interpreter'
import LIGHT_MACHINE_GRAPH from './traffic_light_machine_graph.json'
const TIMER = 1000

const PARAMS = {
  outageChance: 1,
  maxAllowedOutageCount: Infinity,
  onBlink: () => console.log('yellow light blinking'),
  onOutage: () => console.log('traffic light on outage'),
  timer: { red: 2000, yellow: 1000, green: 4000 },
}

const OPTIONS = {
  timer: TIMER,
  noOutage: false,
  debug: false,
  // debug: process.env.NODE_ENV !== 'production',
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
  constructor(params = {}, options = {}) {
    this.params = { ...PARAMS, ...params }
    this.options = { ...OPTIONS, ...options }
    const activities = {
      warnOutage: this.warnOutage.bind(this),
      blinkYellowLight: this.blinkYellowLight.bind(this),
    }
    const lightMachine = Machine(LIGHT_MACHINE_GRAPH, { activities })

    this.interpreter = interpret(lightMachine)
    this.currentState = lightMachine.initialState
    this.ticker = null
    this.started = false
    this._tick = 0
    this._powerOutage = false
    this._powerOutageCount = 0

    if (this.options.debug) {
      this.interpreter.onTransition(this._log.bind(this))
    }
  }

  getCurrentState() {
    const {
      currentState: { value: currentStateValue },
      _powerOutage,
    } = this

    return {
      outage: _powerOutage,
      traffic: {
        red: !!currentStateValue.red,
        yellow: currentStateValue === 'yellow',
        green: currentStateValue === 'green',
      },
      pedestrian: {
        walk: currentStateValue.red === 'walk',
        wait: currentStateValue.red === 'wait',
        stop: currentStateValue.red ? currentStateValue.red === 'stop' : true,
      },
    }
  }

  fix() {
    if (this._powerOutage) {
      this._powerOutage = false
      return this.interpreter.send('POWER_RESTORE')
    }
  }

  start() {
    this.interpreter.start()
    this.ticker = setInterval(this._onTick.bind(this), this.options.timer)
    this.started = true
  }

  stop() {
    clearInterval(this.ticker)
    this.ticker = null
    this.started = false
    this.interpreter.stop()
  }

  blinkYellowLight() {
    const call = setInterval(() => this.params.onBlink(), 1000)
    return () => clearInterval(call)
  }

  warnOutage() {
    this.params.onOutage(this)
    const call = setInterval(() => this.params.onOutage(this), 5000)
    return () => clearInterval(call)
  }

  _log(nextState) {
    console.log('[DEBUG]\ttraffic light state is', JSON.stringify(nextState))
  }

  _onTick() {
    const { params, options } = this
    let outaged = Math.random() * 100 > 100 - params.outageChance

    if (this._powerOutageCount > params.maxAllowedOutageCount) {
      this.stop()
    }
    if (this._powerOutage) {
      params.onTick && params.onTick(this.getCurrentState())
      return
    }
    if (!options.noOutage && outaged) {
      ++this._powerOutageCount
      this._powerOutage = true
      params.onTick && params.onTick(this.getCurrentState())
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
    params.onTick && params.onTick(this.getCurrentState())
  }
}

export default TrafficLight
