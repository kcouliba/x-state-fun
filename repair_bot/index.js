/**
 * Actions / Transitions priority order
 * 1. stateNode.onExit (before any onEntry)
 * 2. transition.actions (before onEntry but after onExit)
 * 3. stateNode.onEntry last executed
 */
const {
  Machine,
  actions: { assign },
} = require('xstate')
const { interpret } = require('xstate/lib/interpreter')
const REPAIR_BOT_MACHINE_GRAPH = require('./repair_bot_machine_graph.json')

const PARAMS = {
  max_tries: 3,
}
const OPTIONS = {
  debug: true,
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
  constructor(params = PARAMS, options = {}) {
    const actions = {
      // resetTries: () => console.log('resetTries'),
      resetTries: () => assign({ repairTriesCount: 0 }),
      incRepairTries: assign({
        repairTriesCount: ctx => ctx.repairTriesCount + 1,
      }),
      notifyFailure: () => console.log('notify failure'),
    }
    const guards = {
      canTryToRepair: extState => extState.repairTriesCount < params.max_tries,
      cannotTryToRepair: extState =>
        extState.repairTriesCount >= params.max_tries,
    }

    this.params = params
    this.options = { ...OPTIONS, ...options }
    this.repairBotMachine = Machine(REPAIR_BOT_MACHINE_GRAPH)
      .withConfig({ actions, guards })
      .withContext({ repairTriesCount: 0 })
    this.interpreter = interpret(this.repairBotMachine)
    this.currentState = this.repairBotMachine.initialState

    if (this.options.debug) {
      this.interpreter.onTransition(this.log.bind(this))
    }
  }

  log() {
    console.log('[DEBUG]\trepair bot state', this.interpreter.state.value)
  }

  getCurrentState() {
    const currentStateValue = this.currentState.value
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
    console.log('repair bot started \u{1F916}')
  }

  isAvailable() {
    const isAvailable = this.interpreter.state.value === 'idle'
    console.log(`repair bot is ${isAvailable ? '\u{1F199}' : '\u{1F6AB} not'} available`)
    return isAvailable
  }

  goFix(/* something, somewhere */) {
    console.log('repair bot on the move to fixing \u{1F697}')
    this.interpreter.send('MOVE')
    this.interpreter.send('LAND')
  }

  investigate() {
    console.log('repair not investigating \u{2753}')
    this.interpreter.send('DIAGNOSE')
  }

  fix() {
    console.log('repair bot fixing \u{1F6A7}')
    this.interpreter.send('REPAIR')
  }

  stop() {
    this.interpreter.stop()
    console.log('repair bot stopped \u{1F4A4}')
  }
}

// test code
const repairBot = new RepairBot()

repairBot.start()
repairBot.isAvailable()
repairBot.goFix(/* something, somewhere */)
repairBot.isAvailable()
repairBot.investigate()
repairBot.fix()
repairBot.stop()
module.exports = RepairBot