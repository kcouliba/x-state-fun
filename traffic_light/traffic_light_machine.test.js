const { Machine, State, matchesState } = require('xstate')
const LIGHT_MACHINE_GRAPH = require('./traffic_light_machine_graph.json')

describe('lightMachine', () => {
  const machine = Machine(LIGHT_MACHINE_GRAPH)

  test('has initial state red.walk', () => {
    const expectedState = new State({ red: 'walk' })

    expect(matchesState(machine.initialState, expectedState)).toBe(true)
  })

  describe('on TIMER event', () => {
    test('should transition from state red.walk to green', () => {
      const fromState = new State({ red: 'walk' })
      const expectedState = new State('green')
      const nextState = machine.transition(fromState, 'TIMER')

      expect(matchesState(nextState, expectedState)).toBe(true)
    })

    test('should transition from state green to yellow', () => {
      const fromState = new State('green')
      const expectedState = new State('yellow')
      const nextState = machine.transition(fromState, 'TIMER')

      expect(matchesState(nextState, expectedState)).toBe(true)
    })

    test('should transition from state yellow to red.walk', () => {
      const fromState = new State('yellow')
      const expectedState = new State({ red: 'walk' })
      const nextState = machine.transition(fromState, 'TIMER')

      expect(matchesState(nextState, expectedState)).toBe(true)
    })
  })

  describe('on PED_TIMER event', () => {
    test('should transition from state red.walk to red.wait', () => {
      const fromState = new State({ red: 'walk' })
      const expectedState = new State({ red: 'wait' })
      const nextState = machine.transition(fromState, 'PED_TIMER')

      expect(matchesState(nextState, expectedState)).toBe(true)
    })

    test('should transition from state red.wait to red.stop', () => {
      const fromState = new State({ red: 'wait' })
      const expectedState = new State({ red: 'stop' })
      const nextState = machine.transition(fromState, 'PED_TIMER')

      expect(matchesState(nextState, expectedState)).toBe(true)
    })

    test('should cause no transition from state red.stop', () => {
      const fromState = new State({ red: 'stop' })
      const nextState = machine.transition(fromState, 'PED_TIMER')

      expect(matchesState(nextState, fromState)).toBe(true)
    })
  })

  describe('on POWER_OUTAGE event', () => {
    const outageState = new State('outage')

    test('should transition from red.walk state to outage', () => {
      const fromState = new State({ red: 'walk' })
      const nextState = machine.transition(fromState, 'POWER_OUTAGE')

      expect(matchesState(nextState, outageState)).toBe(true)
    })
    test('should transition from red.wait state to outage', () => {
      const fromState = new State({ red: 'wait' })
      const nextState = machine.transition(fromState, 'POWER_OUTAGE')

      expect(matchesState(nextState, outageState)).toBe(true)
    })
    test('should transition from red.stop state to outage', () => {
      const fromState = new State({ red: 'stop' })
      const nextState = machine.transition(fromState, 'POWER_OUTAGE')

      expect(matchesState(nextState, outageState)).toBe(true)
    })

    test('should transition from yellow state to outage', () => {
      const fromState = new State('yellow')
      const nextState = machine.transition(fromState, 'POWER_OUTAGE')

      expect(matchesState(nextState, outageState)).toBe(true)
    })

    test('should transition from green state to outage', () => {
      const fromState = new State('green')
      const nextState = machine.transition(fromState, 'POWER_OUTAGE')

      expect(matchesState(nextState, outageState)).toBe(true)
    })
  })

  describe('on POWER_RESTORE event', () => {
    test('should transition from outage state to red.walk', () => {
      const fromState = new State('outage')
      const expectedState = new State({ red: 'walk' })
      const nextState = machine.transition(fromState, 'POWER_RESTORE')

      expect(matchesState(nextState, expectedState)).toBe(true)
    })
  })
})
