import { Machine, actions } from 'xstate'
import { interpret } from 'xstate/lib/interpreter'
import REPAIR_BOT_MACHINE_GRAPH from './repair_bot_machine_graph.json'

const { assign } = actions
const PARAMS = {
  max_tries: Infinity,
}
const OPTIONS = {
  debug: false,
  // debug: process.env.NODE_ENV === "development",
}

/**
 *
 */
class RepairBot {
  /**
   *
   * @param {Object} params
   * @param {Object} options
   */
  constructor(params = {}, options = {}) {
    this.params = { ...PARAMS, ...params }
    this.options = { ...OPTIONS, ...options }
    const actions = {
      resetTries: assign({ repairTriesCount: 0 }),
      incRepairTries: assign({
        repairTriesCount: ctx => ctx.repairTriesCount + 1,
      }),
      notifyFailure: () => console.log('notifyFailure', 'notify failure'),
    }
    const guards = {
      canTryToRepair: extState =>
        extState.repairTriesCount < this.params.max_tries,
      cannotTryToRepair: extState =>
        extState.repairTriesCount >= this.params.max_tries,
    }
    const repairBotMachine = Machine(REPAIR_BOT_MACHINE_GRAPH)
      .withConfig({ actions, guards })
      .withContext({ repairTriesCount: 0 })

    this.interpreter = interpret(repairBotMachine)
    if (this.options.debug) {
      this.interpreter.onTransition(this._log.bind(this))
    }
  }

  _log(nextState) {
    console.log('[DEBUG]\trepair bot state is', JSON.stringify(nextState))
  }

  getCurrentState() {
    const currentStateValue = this.interpreter.state.value

    return {
      available: currentStateValue === 'idle',
      moving: currentStateValue === 'moving',
      inPlace: currentStateValue === 'inplace',
      diagnosing: currentStateValue === 'diagnosing',
      repairing: currentStateValue === 'repairing',
    }
  }

  start() {
    this.interpreter.start()
    this.currentState = this.interpreter.state
  }

  isAvailable() {
    const { state } = this.interpreter

    return state && state.value === 'idle'
  }

  goFix() {
    this.interpreter.send('MOVE')
  }

  landToFixPlace() {
    this.interpreter.send('LAND')
  }

  investigate() {
    this.interpreter.send('DIAGNOSE')
  }

  fix() {
    this.interpreter.send('REPAIR')
  }

  failedToFix() {
    this.interpreter.send('REPAIR_FAILED')
  }

  successfullyFixed() {
    this.interpreter.send('REPAIR_SUCCESS')
  }

  stop() {
    this.interpreter.stop()
  }
}

export default RepairBot
