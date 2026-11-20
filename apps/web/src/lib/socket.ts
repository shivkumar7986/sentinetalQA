'use client'

import { useEffect, useState } from 'react'
import { mockSocket } from '@/mocks/mockSocket'
import type { Run, StepLog } from '@/mocks/data/runs.mock'
import { mockClient } from '@/mocks/mockClient'

export function useRunSocket(runId: string) {
  const [run, setRun] = useState<Run | null>(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let mounted = true

    // Fetch initial
    mockClient.getRunById(runId).then((r) => {
      if (mounted && r) {
        setRun({ ...r })
        if (r.status === 'running') {
          setIsLive(true)
        }
      }
    })

    // Subscribe to mock socket
    const unsubscribe = mockSocket.subscribe(`run:${runId}`, (event, payload) => {
      if (!mounted) return

      if (event === 'run.started') {
        setIsLive(true)
        setRun((prev) => (prev ? { ...prev, status: 'running' } : prev))
      } else if (event === 'step.finished') {
        setRun((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            stepLogs: [...prev.stepLogs, payload as StepLog],
          }
        })
      } else if (event === 'run.finished') {
        setIsLive(false)
        setRun({ ...(payload as Run) })
      } else if (event === 'run.cancelled') {
        setIsLive(false)
        setRun((prev) => (prev ? { ...prev, status: 'cancelled' } : prev))
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [runId])

  return { run, isLive, setRun }
}

