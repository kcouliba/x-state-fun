const { State, matchesState } = require('xstate')

module.exports = {
  logTransition(nextState) {
    console.log('logging interpreter transition =>', nextState.value)
  },
  testing: { expectTransitionSucceeds, expectActionsOnState },
}

/**
 * check if a transition from a state to another can happen from event using a specified machine
 * @param {Object | string} fromState starting state
 * @param {Object | string} toState finishing state
 * @param {string} byEvent event sent
 * @param {Machine} machine machine
 */
function expectTransitionSucceeds(fromState, toState, byEvent, machine) {
  const expectedState = new State(toState)
  const nextState = machine.transition(
    new State(fromState),
    byEvent,
    machine.context
  )

  expect(matchesState(nextState, expectedState)).toBe(true)
}

/**
 * check if as set of actions is available on a state
 * @param {Array<String>} actions
 * @param {State} state
 */
function expectActionsOnState(actions, state) {
  const hasExpectedActions = actions.reduce((acc, action) => {
    return acc && state.actions.some(({ type }) => type === action)
  }, true)
  expect(hasExpectedActions).toBe(true)
}
