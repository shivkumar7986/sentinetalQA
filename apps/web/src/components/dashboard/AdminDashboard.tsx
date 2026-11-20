"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ChevronDown,
  RefreshCw,
  ArrowUpRight,
  ArrowRight,
  Check,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnvBadge, type EnvValue } from "@/components/domain/EnvBadge";
import { StatusBadge, type StatusValue } from "@/components/domain/StatusBadge";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import { mockClient } from "@/mocks/mockClient";
import type { Website } from "@/mocks/data/websites.mock";
import type { Task } from "@/mocks/data/tasks.mock";
import type { Run } from "@/mocks/data/runs.mock";
import type { TestPlan } from "@/mocks/data/plans.mock";
import { toast } from "sonner";

const ENV_OPTIONS = [
  { label: "All environments", value: "all", dot: null },
  { label: "Production", value: "production", dot: "bg-rose-500" },
  { label: "Staging", value: "staging", dot: "bg-sky-500" },
  { label: "QA", value: "qa", dot: "bg-indigo-500" },
  { label: "Dev", value: "dev", dot: "bg-neutral-400" },
];

interface AdminDashboardProps {
  websites: Website[];
  tasks: Task[];
  runs: Run[];
  plans: TestPlan[];
  loading: boolean;
  onReload: () => void;
}

export function AdminDashboard({
  websites,
  tasks,
  runs,
  plans,
  loading,
  onReload,
}: AdminDashboardProps) {
  const { openFormDrawer } = useUIStore();
  const [selectedEnv, setSelectedEnv] = useState("All environments");
  const [envOpen, setEnvOpen] = useState(false);

  // Filter runs by selected environment
  const filteredRuns = runs.filter((run) => {
    if (selectedEnv === "All environments") return true;
    return run.environment.toLowerCase() === selectedEnv.toLowerCase();
  });

  // Dynamic Metrics
  const activeWebsites = websites.filter((w) => w.status !== "archived");
  const archivedWebsitesCount = websites.length - activeWebsites.length;
  const activeTasks = tasks.filter((t) => t.status !== "archived").length;
  const totalRuns = runs.length;
  const passedRunsCount = runs.filter((r) => r.status === "passed").length;
  const failedRunsCount = runs.filter((r) => r.status === "failed").length;
  const otherRunsCount = totalRuns - passedRunsCount - failedRunsCount;

  const passRate =
    totalRuns > 0
      ? ((passedRunsCount / totalRuns) * 100).toFixed(1) + "%"
      : "100%";

  const passedPct =
    totalRuns > 0 ? ((passedRunsCount / totalRuns) * 100).toFixed(1) : "100";
  const failedPct =
    totalRuns > 0 ? ((failedRunsCount / totalRuns) * 100).toFixed(1) : "0";
  const otherPct =
    totalRuns > 0 ? ((otherRunsCount / totalRuns) * 100).toFixed(1) : "0";

  const pendingPlans = plans.filter(
    (plan) => plan.status === "in_review" || plan.status === "draft",
  );

  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  const TREND_BARS = [
    { height: 60 },
    { height: 65 },
    { height: 62 },
    { height: 75 },
    { height: 80 },
    { height: 72 },
    { height: 85 },
    { height: 88 },
    { height: 76 },
    { height: 84 },
    { height: 92 },
    { height: 82 },
    { height: 88 },
    { height: Math.min(100, Math.max(40, Math.round(parseFloat(passRate)))) },
  ];

  async function handleRerunLastTask() {
    if (tasks.length === 0) return;
    const targetTask = tasks[0];
    toast.info(`Triggered test run for: ${targetTask.title}`);
    try {
      if (targetTask.currentPlanId) {
        await mockClient.triggerRun(targetTask.currentPlanId);
        onReload();
      }
    } catch {
      // fallback
    }
  }

  return (
    <div className="space-y-5 animate-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            Test plans awaiting approval, live execution runs, and 30-day pass
            stability.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Environment dropdown button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setEnvOpen((v) => !v)}
              className={cn(
                "h-9 px-3.5 rounded-[6px] bg-[var(--surface)] border text-[13px] font-medium text-[var(--text)] flex items-center gap-2 transition-colors select-none",
                envOpen
                  ? "border-[var(--primary)] ring-2 ring-[var(--ai-ring)]"
                  : "border-[var(--border)] hover:border-[var(--border-hover)]",
              )}
              aria-haspopup="listbox"
              aria-expanded={envOpen}
            >
              <span>{selectedEnv}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-150",
                  envOpen && "rotate-180",
                )}
              />
            </button>

            {envOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setEnvOpen(false)}
                />
                <div
                  role="listbox"
                  className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-48 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] py-1 z-30 animate-enter"
                  style={{ boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)" }}
                >
                  {ENV_OPTIONS.map((opt) => {
                    const isSelected = selectedEnv === opt.label;
                    return (
                      <button
                        key={opt.value}
                        role="option"
                        aria-selected={isSelected}
                        type="button"
                        onClick={() => {
                          setSelectedEnv(opt.label);
                          setEnvOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3.5 py-2 text-[12px] flex items-center justify-between transition-colors",
                          isSelected
                            ? "bg-[var(--primary-tint)] text-[var(--primary)] font-semibold"
                            : "text-[var(--text)] hover:bg-[var(--hover-subtle)]",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {opt.dot ? (
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full shrink-0",
                                opt.dot,
                              )}
                            />
                          ) : (
                            <span className="h-2 w-2 rounded-full border border-[var(--border-hover)] shrink-0" />
                          )}
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-[var(--primary)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* + Add website */}
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={() => openFormDrawer("add-website")}
            className="gap-1.5 font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Add website
          </Button>

          {/* + Create task */}
          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={() => openFormDrawer("create-task")}
            className="gap-1.5 font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Create task
          </Button>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered websites */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">
            Registered websites
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">
              {loading ? "—" : activeWebsites.length}
            </span>
            <span className="text-[12px] text-[var(--text-muted)]">
              {archivedWebsitesCount > 0
                ? `${activeWebsites.length} active (${archivedWebsitesCount} archived)`
                : activeWebsites.length === 1
                  ? "1 active app"
                  : `${activeWebsites.length} active apps`}
            </span>
          </div>
        </Card>

        {/* Card 2: Active tasks */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">
            Active tasks
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">
              {loading ? "—" : activeTasks}
            </span>
            <span className="text-[12px] text-[var(--text-muted)]">
              {pendingPlans.length > 0
                ? `${pendingPlans.length} in review`
                : "All ready"}
            </span>
          </div>
        </Card>

        {/* Card 3: Total Runs */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">
            Total test runs
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">
              {loading ? "—" : totalRuns}
            </span>
            <span className="mono-data text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
              {passedRunsCount} passed
            </span>
          </div>
        </Card>

        {/* Card 4: Overall pass rate */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">
            Overall pass rate
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">
              {loading ? "—" : passRate}
            </span>
            <span className="mono-data text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
              {failedRunsCount === 0
                ? "Zero failures"
                : `${failedRunsCount} failures`}
            </span>
          </div>
        </Card>
      </div>

      {/* Row 2: 30-Day Trend Chart & Run Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <Card className="p-5 flex flex-col justify-between h-[280px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold text-[var(--text)]">
                Pass / Fail trend (30 days)
              </span>
              <span className="mono-data text-[12px] text-[var(--text-muted)]">
                {totalRuns} total runs recorded
              </span>
            </div>

            <div className="flex-1 flex items-end justify-between gap-1.5 pt-4 pb-2 px-1">
              {TREND_BARS.map((bar, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center h-full justify-end group"
                >
                  <div
                    className="w-full rounded-t-[4px] bg-[#D4D7F8] dark:bg-[#3E4378] group-hover:bg-[var(--primary)] transition-colors duration-150"
                    style={{ height: `${bar.height}%` }}
                    title={`Interval ${i + 1}: ${bar.height}% stability`}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-[11px] mono-data text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
              <span>30d ago</span>
              <span>15d ago</span>
              <span>Today</span>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="p-5 flex flex-col justify-between h-[280px]">
            <div>
              <span className="text-[13px] font-semibold text-[var(--text)] block mb-4">
                Run status breakdown
              </span>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-[var(--text-muted)]">Passed</span>
                    <span className="mono-data font-semibold text-[var(--text)]">
                      {passedRunsCount} ({passedPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--track-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${passedPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-[var(--text-muted)]">Failed</span>
                    <span className="mono-data font-semibold text-[var(--text)]">
                      {failedRunsCount} ({failedPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--track-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-300"
                      style={{ width: `${failedPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-[var(--text-muted)]">
                      Running / Other
                    </span>
                    <span className="mono-data font-semibold text-[var(--text)]">
                      {otherRunsCount} ({otherPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--track-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-300"
                      style={{ width: `${otherPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-center">
              <button
                type="button"
                onClick={handleRerunLastTask}
                className="text-[12px] font-medium text-[var(--text)] hover:text-[var(--primary)] flex items-center gap-1.5 transition-colors py-1 px-3 rounded-[6px] hover:bg-[var(--hover-subtle)] cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-run last task
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Recent runs (8 cols) & Needs approval (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[var(--text)]">
                  Recent runs
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  ({filteredRuns.length} recorded)
                </span>
              </div>
              <Link
                href="/reports"
                className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center gap-1 font-medium transition-colors"
              >
                View all reports <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    <th className="text-left py-2.5 px-4 w-28">Status</th>
                    <th className="text-left py-2.5 px-4">Task / Website</th>
                    <th className="text-left py-2.5 px-4">Trigger</th>
                    <th className="text-left py-2.5 px-4">Duration</th>
                    <th className="text-right py-2.5 px-4">Started</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredRuns.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-[var(--text-muted)] text-[12px]"
                      >
                        No test runs recorded for {selectedEnv}.
                      </td>
                    </tr>
                  ) : (
                    filteredRuns.slice(0, 6).map((run) => (
                      <tr
                        key={run.id}
                        className="hover:bg-[var(--hover-row)] transition-colors"
                      >
                        <td className="py-3 px-4">
                          {run.status === "running" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium bg-[#E6F4FB] text-[#0284C7] dark:bg-sky-950/40 dark:text-sky-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#0284C7] dark:bg-sky-400 animate-pulse" />
                              Running
                            </span>
                          ) : (
                            <StatusBadge status={run.status as StatusValue} />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/reports/${run.id}`}
                            className="font-medium text-[var(--text)] hover:text-[var(--primary)] transition-colors block leading-snug"
                          >
                            {run.taskTitle}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {run.websiteName}
                            </span>
                            <EnvBadge env={run.environment as EnvValue} />
                          </div>
                        </td>
                        <td className="py-3 px-4 mono-data text-[12px] text-[var(--text-muted)] capitalize">
                          {run.trigger || "manual"}
                        </td>
                        <td className="py-3 px-4 mono-data text-[12px] text-[var(--text)]">
                          {run.durationMs
                            ? `${(run.durationMs / 1000).toFixed(1)}s`
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-right mono-data text-[12px] text-[var(--text-muted)]">
                          {run.dateLabel || "Today"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[13px] font-semibold text-[var(--text)]">
                Needs approval
              </span>
              <span
                className={cn(
                  "h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-semibold mono-data flex items-center justify-center",
                  pendingPlans.length > 0
                    ? "bg-[#FDF3E1] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400"
                    : "bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-950/40 dark:text-emerald-400",
                )}
              >
                {pendingPlans.length}
              </span>
            </div>

            {pendingPlans.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto opacity-80" />
                <p className="text-[13px] font-medium text-[var(--text)]">
                  All plans approved
                </p>
                <p className="text-[11px] text-[var(--text-muted)] max-w-[200px] mx-auto">
                  No test plans currently awaiting review. All tasks are ready
                  for execution.
                </p>
              </div>
            ) : (
              pendingPlans.map((plan) => {
                const associatedTask = taskMap.get(plan.taskId);
                const planTitle =
                  associatedTask?.title ||
                  associatedTask?.prompt ||
                  plan.summary ||
                  "Test Plan";

                return (
                  <div
                    key={plan.id}
                    className="p-3 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)] transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--text)] truncate">
                        {planTitle}{" "}
                        <span className="text-[var(--primary)] font-mono text-[11px]">
                          (v{plan.version})
                        </span>
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                        {plan.cases.length} cases · Status: In Review
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      asChild
                      className="shrink-0 gap-1 text-[12px] h-8"
                    >
                      <Link href={`/plans/${plan.id}`}>
                        Review <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                );
              })
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
