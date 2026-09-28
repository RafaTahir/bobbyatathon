import { useState } from 'react'
import type { AppState, CapabilityAnswer, CapabilityId, Screen } from './types'
import { runSimulation } from './lib/simulation'
import { DEMO_ANSWERS } from './data/demo'
import LandingScreen from './components/LandingScreen'
import QuestionnaireScreen from './components/QuestionnaireScreen'
import GraphScreen from './components/GraphScreen'
import SimulationScreen from './components/SimulationScreen'
import ResultsScreen from './components/ResultsScreen'
import FixScreen from './components/FixScreen'
import CardScreen from './components/CardScreen'

const initialState: AppState = {
  screen: 'landing',
  answers: {},
  simulationResult: null,
  postFixResult: null,
  fixes: {},
  isDemoMode: false,
  isSimulating: false,
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState)

  function goTo(screen: Screen) {
    setState((s) => ({ ...s, screen }))
  }

  function startDemo() {
    setState((s) => ({
      ...s,
      screen: 'graph',
      answers: DEMO_ANSWERS,
      isDemoMode: true,
      simulationResult: null,
      postFixResult: null,
      fixes: {},
    }))
  }

  function startDrill() {
    setState((s) => ({
      ...s,
      screen: 'questionnaire',
      answers: {},
      isDemoMode: false,
      simulationResult: null,
      postFixResult: null,
      fixes: {},
    }))
  }

  function submitAnswers(answers: Partial<Record<CapabilityId, CapabilityAnswer>>) {
    setState((s) => ({ ...s, answers, screen: 'graph' }))
  }

  function killPhone() {
    setState((s) => ({ ...s, isSimulating: true, screen: 'simulation' }))
    // simulate slight delay for dramatic effect
    setTimeout(() => {
      const result = runSimulation(state.answers)
      setState((s) => ({
        ...s,
        simulationResult: result,
        isSimulating: false,
        screen: 'results',
      }))
    }, 2200)
  }

  function applyFix(capId: CapabilityId) {
    setState((s) => ({
      ...s,
      fixes: { ...s.fixes, [capId]: true },
    }))
  }

  function removeFix(capId: CapabilityId) {
    const newFixes = { ...state.fixes }
    delete newFixes[capId]
    setState((s) => ({ ...s, fixes: newFixes }))
  }

  function runAgain() {
    setState((s) => ({ ...s, isSimulating: true, screen: 'simulation' }))
    setTimeout(() => {
      const result = runSimulation(state.answers, state.fixes)
      setState((s) => ({
        ...s,
        postFixResult: result,
        isSimulating: false,
        screen: 'results',
      }))
    }, 2200)
  }

  function showCard() {
    goTo('card')
  }

  function resetAll() {
    setState(initialState)
  }

  const { screen, answers, simulationResult, postFixResult, fixes, isDemoMode, isSimulating } = state

  return (
    <div className="app">
      {screen === 'landing' && (
        <LandingScreen onRunDrill={startDrill} onDemo={startDemo} />
      )}
      {screen === 'questionnaire' && (
        <QuestionnaireScreen onSubmit={submitAnswers} onBack={() => goTo('landing')} />
      )}
      {screen === 'graph' && (
        <GraphScreen
          answers={answers}
          isDemoMode={isDemoMode}
          onKill={killPhone}
          onBack={() => goTo(isDemoMode ? 'landing' : 'questionnaire')}
        />
      )}
      {screen === 'simulation' && (
        <SimulationScreen />
      )}
      {screen === 'results' && simulationResult && (
        <ResultsScreen
          result={postFixResult ?? simulationResult}
          firstResult={simulationResult}
          isSecondRun={postFixResult !== null}
          fixes={fixes}
          answers={answers}
          onFix={() => goTo('fix')}
          onRunAgain={runAgain}
          onCard={showCard}
          onReset={resetAll}
        />
      )}
      {screen === 'fix' && simulationResult && (
        <FixScreen
          result={simulationResult}
          fixes={fixes}
          onApplyFix={applyFix}
          onRemoveFix={removeFix}
          onRunAgain={runAgain}
          onBack={() => goTo('results')}
        />
      )}
      {screen === 'card' && (
        <CardScreen
          result={postFixResult ?? simulationResult!}
          fixes={fixes}
          onReset={resetAll}
        />
      )}
    </div>
  )
}
