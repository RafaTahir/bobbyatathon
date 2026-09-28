import { useState } from 'react'
import type { CapabilityAnswer, CapabilityId } from '../types'

interface Question {
  capId: CapabilityId
  title: string
  question: string
  options: { label: string; value: boolean | null; fallbackType?: string }[]
}

const QUESTIONS: Question[] = [
  {
    capId: 'emergencyContact',
    title: 'PEOPLE',
    question: 'If your phone disappeared, could you contact someone you trust?',
    options: [
      { label: 'Yes — I know a number by memory', value: true, fallbackType: 'memory' },
      { label: 'Yes — stored somewhere independent', value: true, fallbackType: 'stored' },
      { label: 'No', value: false },
      { label: 'Not sure', value: null },
    ],
  },
  {
    capId: 'primaryAccount',
    title: 'EMAIL / PRIMARY ACCOUNT',
    question: 'Can you access your primary email without approving anything on your phone?',
    options: [
      { label: 'Yes — independently', value: true },
      { label: 'No', value: false },
      { label: 'Not sure', value: null },
    ],
  },
  {
    capId: 'authentication',
    title: 'AUTHENTICATION',
    question: 'Do you have an authentication or recovery method that does not depend on this phone?',
    options: [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
      { label: 'Not sure', value: null },
    ],
  },
  {
    capId: 'money',
    title: 'MONEY',
    question: 'Could you pay for something if your phone and mobile wallet were unavailable?',
    options: [
      { label: 'Physical card', value: true, fallbackType: 'physicalCard' },
      { label: 'Cash', value: true, fallbackType: 'cash' },
      { label: 'Another independent method', value: true, fallbackType: 'other' },
      { label: 'No', value: false },
      { label: 'Not sure', value: null },
    ],
  },
  {
    capId: 'transport',
    title: 'TRANSPORT',
    question: 'Could you get home without using an app on your phone?',
    options: [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
      { label: 'Not sure', value: null },
    ],
  },
  {
    capId: 'deviceRecovery',
    title: 'SECURE THE DEVICE',
    question: 'Could you access the account needed to locate, lock or erase your phone — without using that phone to authenticate?',
    options: [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
      { label: 'Not sure', value: null },
    ],
  },
  {
    capId: 'identity',
    title: 'IDENTITY',
    question: 'Do you have access to important identity or emergency information somewhere other than this phone?',
    options: [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
      { label: 'Not sure', value: null },
    ],
  },
]

interface Props {
  onSubmit: (answers: Partial<Record<CapabilityId, CapabilityAnswer>>) => void
  onBack: () => void
}

export default function QuestionnaireScreen({ onSubmit, onBack }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Record<CapabilityId, CapabilityAnswer>>>({})

  const q = QUESTIONS[step]
  const total = QUESTIONS.length

  function handleOption(opt: { label: string; value: boolean | null; fallbackType?: string }) {
    const answer: CapabilityAnswer = {
      capabilityId: q.capId,
      hasFallback: opt.value,
      fallbackType: opt.fallbackType,
    }
    const newAnswers = { ...answers, [q.capId]: answer }
    setAnswers(newAnswers)

    if (step < total - 1) {
      setTimeout(() => setStep(step + 1), 220)
    } else {
      onSubmit(newAnswers)
    }
  }

  return (
    <div className="questionnaire">
      <div className="q-header">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <span className="q-progress">{step + 1} / {total}</span>
      </div>

      <div className="q-track">
        <div className="q-bar" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>

      <div className="q-body">
        <div className="q-category">{q.title}</div>
        <h2 className="q-question">{q.question}</h2>
        <div className="q-options">
          {q.options.map((opt) => (
            <button
              key={opt.label}
              className={`q-option ${opt.value === false ? 'q-option--no' : opt.value === null ? 'q-option--unsure' : 'q-option--yes'}`}
              onClick={() => handleOption(opt)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="privacy-note privacy-note--inline">
        Your answers stay in this browser. BLACKOUT does not need your passwords, recovery codes or financial credentials.
      </p>
    </div>
  )
}
