import { mockClient } from './mockClient'
import type { Run, StepLog } from './data/runs.mock'
import type { TestPlan } from './data/plans.mock'

type SocketCallback = (event: string, payload: any) => void

class MockSocketBridge {
  private listeners: Map<string, Set<SocketCallback>> = new Map()
  private activeIntervals: Map<string, NodeJS.Timeout> = new Map()

  subscribe(room: string, cb: SocketCallback) {
    if (!this.listeners.has(room)) {
      this.listeners.set(room, new Set())
    }
    this.listeners.get(room)!.add(cb)

    return () => {
      this.listeners.get(room)?.delete(cb)
    }
  }

  private emit(room: string, event: string, payload: any) {
    const cbs = this.listeners.get(room)
    if (cbs) {
      cbs.forEach((cb) => cb(event, payload))
    }
  }

  startLiveRunSimulation(runId: string, plan: TestPlan) {
    if (this.activeIntervals.has(runId)) return

    let currentCaseIdx = 0
    let currentStepIdx = 0
    const totalCases = plan.cases.length
    let passedCount = 0
    const startTimestamp = Date.now()

    this.emit(`run:${runId}`, 'run.started', { runId, startedAt: new Date(startTimestamp).toISOString() })

    const interval = setInterval(async () => {
      if (currentCaseIdx >= totalCases) {
        // Complete run
        clearInterval(interval)
        this.activeIntervals.delete(runId)

        const run = await mockClient.getRunById(runId)
        if (run) {
          run.status = 'passed'
          run.finishedAt = new Date().toISOString()
          run.durationMs = Date.now() - startTimestamp
          run.passRate = 100
          run.passedCases = totalCases
          await mockClient.updateTask(run.taskId, { status: 'completed' })
          this.emit(`run:${runId}`, 'run.finished', run)
        }
        return
      }

      const curCase = plan.cases[currentCaseIdx]
      const curStep = curCase.steps[currentStepIdx]

      if (!curStep) {
        currentCaseIdx++
        currentStepIdx = 0
        return
      }

      const stepDuration = Math.floor(Math.random() * 400) + 80
      const stepStartTime = Date.now()

      const newLog: StepLog = {
        id: `log-${runId}-${curCase.id}-${curStep.id}`,
        runId,
        caseId: curCase.id,
        stepId: curStep.id,
        caseTitle: curCase.title,
        action: curStep.action,
        validationType: curStep.validationType,
        status: 'passed',
        startedAt: new Date(stepStartTime).toISOString(),
        endedAt: new Date(stepStartTime + stepDuration).toISOString(),
        durationMs: stepDuration,
        checkPerformed: `Validation type: ${curStep.validationType}`,
        responseSummary: {
          statusCode: 200,
          bodyPreview: 'Assertion verified successfully.',
        },
      }

      const run = await mockClient.getRunById(runId)
      if (run) {
        run.stepLogs.push(newLog)
        run.durationMs = Date.now() - startTimestamp
        this.emit(`run:${runId}`, 'step.finished', newLog)
      }

      currentStepIdx++
      if (currentStepIdx >= curCase.steps.length) {
        currentCaseIdx++
        currentStepIdx = 0
        passedCount++
        this.emit(`run:${runId}`, 'case.finished', { caseId: curCase.id, status: 'passed' })
      }
    }, 1200)

    this.activeIntervals.set(runId, interval)
  }

  stopRunSimulation(runId: string) {
    const timer = this.activeIntervals.get(runId)
    if (timer) {
      clearInterval(timer)
      this.activeIntervals.delete(runId)
      this.emit(`run:${runId}`, 'run.cancelled', { runId })
    }
  }
}

export const mockSocket = new MockSocketBridge()

