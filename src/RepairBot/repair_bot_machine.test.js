const {
  Machine,
  State,
  matchesState,
} = require('xstate')
const REPAIR_BOT_MACHINE_GRAPH = require('./repair_bot_machine_graph.json')
const MAX_TRIES = 3
const {
  testing: { expectTransitionSucceeds, expectActionsOnState },
} = require('../../utils')
const config = {
  actions: {
    resetTries: () => ({ repairTriesCount: () => 0 }),
    incRepairTries: () => ({
      repairTriesCount: ctx => ctx.repairTriesCount + 1,
    }),
    notifyFailure: () => console.log('notifyFailure', 'notify failure'),
  },
  guards: {
    canTryToRepair: extState => extState.repairTriesCount < MAX_TRIES,
    cannotTryToRepair: extState => extState.repairTriesCount >= MAX_TRIES,
  },
}
// const activities = {}
const context = { repairTriesCount: 0 }

describe('repairBotMachine', () => {
  const machine = Machine(REPAIR_BOT_MACHINE_GRAPH)
    .withConfig(config)
    .withContext(context)

  test('has initial state idle', () => {
    const expectedState = new State('idle')

    expect(matchesState(machine.initialState, expectedState)).toBe(true)
  })

  describe('on idle state entry', () => {
    test('should trigger resetTries action', () => {
      expectActionsOnState(['resetTries'], machine.initialState)
    })
  })

  describe('on MOVE event', () => {
    test('should transition from state idle to moving', () => {
      expectTransitionSucceeds('idle', 'moving', 'MOVE', machine)
    })

    test('should transition from state inplace to moving', () => {
      expectTransitionSucceeds('inplace', 'moving', 'MOVE', machine)
    })
  })

  describe('on LAND event', () => {
    test('should transition from state moving to inplace', () => {
      expectTransitionSucceeds('moving', 'inplace', 'LAND', machine)
    })
  })

  describe('on DIAGNOSE event', () => {
    test('should transition from state inplace to diagnosing', () => {
      expectTransitionSucceeds('inplace', 'diagnosing', 'DIAGNOSE', machine)
    })
  })

  describe('on REPAIR event', () => {
    test('should transition from state diagnosing to repairing', () => {
      expectTransitionSucceeds('diagnosing', 'repairing', 'REPAIR', machine)
    })

    test('should trigger incRepairTries action', () => {
      const repairState = machine.transition(
        new State('diagnosing'),
        'REPAIR',
        machine.context
      )

      expectActionsOnState(['incRepairTries'], repairState)
    })

    test('should not cause transition to repairing if canTryToRepair guard returns true', () => {
      const diagState = new State('diagnosing')
      const nextState = machine.transition(new State('diagnosing'), 'REPAIR', {
        repairTriesCount: MAX_TRIES,
      })

      expect(matchesState(diagState, nextState)).toBe(true)
    })
  })

  describe('on REPAIR_SUCCESS event', () => {
    test('should transition from state repairing to idle', () => {
      expectTransitionSucceeds('repairing', 'idle', 'REPAIR_SUCCESS', machine)
    })
  })

  describe('on REPAIR_FAILURE event', () => {
    test('should transition from state repairing to diagnosing', () => {
      expectTransitionSucceeds(
        'repairing',
        'diagnosing',
        'REPAIR_FAILURE',
        machine
      )
    })
  })

  describe('on CANNOT_REPAIR event', () => {
    const faillingachine = Machine(REPAIR_BOT_MACHINE_GRAPH)
      .withConfig(config)
      .withContext({
        repairTriesCount: 3,
      })
    test('should transition from state diagnosing to idle', () => {
      expectTransitionSucceeds(
        'diagnosing',
        'idle',
        'CANNOT_REPAIR',
        faillingachine
      )
    })

    test('should trigger notifyFailure action', () => {
      const repairState = faillingachine.transition(
        new State('diagnosing'),
        'CANNOT_REPAIR',
        faillingachine.context
      )

      expectActionsOnState(['notifyFailure'], repairState)
    })
  })
})
