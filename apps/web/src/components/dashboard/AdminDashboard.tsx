"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronDown,
  RefreshCw,
  Check,
  Users,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnvBadge, type EnvValue } from "@/components/domain/EnvBadge";
import { StatusBadge, type StatusValue } from "@/components/domain/StatusBadge";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import type { Website } from "@/mocks/data/websites.mock";
import type { Task } from "@/mocks/data/tasks.mock";
import type { Run } from "@/mocks/data/runs.mock";
import type { TestPlan } from "@/mocks/data/plans.mock";
import { INITIAL_MEMBERS, type Member } from "@/mocks/data/users.mock";
import { mockClient } from "@/mocks/mockClient";
import { EditUserDrawer } from "@/components/forms/EditUserDrawer";
import { toast } from "sonner";

const ENV_OPTIONS = [
  { label: "All environments", value: "all", dot: null },
  { label: "Production", value: "production", dot: "bg-rose-500" },
  { label: "Staging", value: "staging", dot: "bg-sky-500" },
  { label: "QA", value: "qa", dot: "bg-indigo-500" },
  { label: "Dev", value: "dev", dot: "bg-neutral-400" },
];

const ROLE_OPTIONS = ["All roles", "Admin", "QA Lead", "QA Employee"];

const TREND_BARS = [
  55, 62, 58, 70, 75, 68, 80, 83, 72, 79, 88, 78, 84, 86, 75, 82, 90, 85, 88,
  80, 86, 92, 84, 88, 90, 86, 92, 88, 94, 90,
];

const AUDIT_LOG = [
  {
    id: "a1",
    actor: "Riya Sharma",
    actorRole: "QA Lead",
    action: "added",
    target: "Karan Verma",
    targetRole: "QA Employee",
    time: "12m ago",
  },
  {
    id: "a2",
    actor: "Alex Chen",
    actorRole: "Admin",
    action: "updated Ollama model → qwen2.5:14b",
    target: null,
    targetRole: null,
    time: "1h ago",
  },
  {
    id: "a3",
    actor: "Vikram Patel",
    actorRole: "QA Lead",
    action: "invited",
    target: "Dev Joshi",
    targetRole: "QA Employee",
    time: "3h ago",
  },
  {
    id: "a4",
    actor: "Alex Chen",
    actorRole: "Admin",
    action: "promoted",
    target: "Riya Sharma",
    targetRole: "QA Lead",
    time: "5h ago",
  },
  {
    id: "a5",
    actor: "Karan Verma",
    actorRole: "QA Employee",
    action: "executed test run on",
    target: "Billing Admin",
    targetRole: null,
    time: "4h ago",
  },
  {
    id: "a6",
    actor: "Alex Chen",
    actorRole: "Admin",
    action: "enabled Kill Switch for",
    target: "Staging",
    targetRole: null,
    time: "1d ago",
  },
];

const MOCK_RECENT_RUNS = [
  {
    id: "r1",
    status: "passed",
    taskTitle: "Invoice export CSV rules",
    website: "Billing Admin",
    env: "qa" as EnvValue,
    author: "Karan V.",
    engine: "gemini-2.5-pro",
    duration: "8.1s",
    started: "14m ago",
  },
  {
    id: "r2",
    status: "failed",
    taskTitle: "Dispatcher role redirect",
    website: "Logistics Portal",
    env: "staging" as EnvValue,
    author: "Karan V.",
    engine: "ollama/qwen2.5",
    duration: "19.3s",
    started: "1h ago",
  },
  {
    id: "r3",
    status: "passed",
    taskTitle: "Guest coupon boundary",
    website: "Customer Checkout",
    env: "production" as EnvValue,
    author: "Meera N.",
    engine: "gemini-2.5-flash",
    duration: "6.8s",
    started: "3h ago",
  },
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
  runs,
  loading,
}: AdminDashboardProps) {
  const { openFormDrawer } = useUIStore();
  const [selectedEnv, setSelectedEnv] = useState("All environments");
  const [envOpen, setEnvOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [roleOpen, setRoleOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"team" | "runs">("team");
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      const list = await mockClient.getMembers();
      setMembers(list);
    }
    loadMembers();

    const handleUpdate = () => {
      loadMembers();
    };
    window.addEventListener("testing_agent_members_changed", handleUpdate);
    return () => window.removeEventListener("testing_agent_members_changed", handleUpdate);
  }, []);

  // Metrics
  const activeWebsites = websites.filter((w) => w.status !== "archived");
  const totalRuns = runs.length;
  const passedRuns = runs.filter((r) => r.status === "passed").length;
  const passRate =
    totalRuns > 0 ? ((passedRuns / totalRuns) * 100).toFixed(1) : "91.5";

  const leads = members.filter((m) => m.role === "qa_lead");
  const employees = members.filter((m) => m.role === "qa_engineer");
  const totalTeam = leads.length + employees.length;

  // Filter members by role
  const filteredMembers = members.filter((m) => {
    if (roleFilter === "All roles") return true;
    if (roleFilter === "Admin") return m.role === "admin";
    if (roleFilter === "QA Lead") return m.role === "qa_lead";
    if (roleFilter === "QA Employee") return m.role === "qa_engineer";
    return true;
  });

  function getRoleBadge(role: string) {
    if (role === "admin")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
          Admin
        </span>
      );
    if (role === "qa_lead")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
          QA Lead
        </span>
      );
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        QA Employee
      </span>
    );
  }

  function getLeadScope(m: Member) {
    if (m.role === "admin") return <span className="text-[var(--text-muted)]">—</span>;
    if (m.role === "qa_lead") return <span className="text-[12px] text-[var(--text-muted)]">Alex Chen (Admin)</span>;
    return (
      <span className="text-[12px] text-[var(--text-muted)]">
        {m.assignedLead ? m.assignedLead : leads.length > 0 ? `${leads[0].name} (QA Lead)` : "—"}
      </span>
    );
  }

  async function handleConfirmDelete() {
    if (!memberToDelete) return;
    setDeleteLoading(true);
    try {
      await mockClient.deleteMember(memberToDelete.id);
      toast.success(`${memberToDelete.name} has been deleted.`);
      setMemberToDelete(null);
    } catch (err: any) {
      toast.error("Failed to delete user", { description: err.message });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-5 animate-enter">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight">
            Organization Overview
          </h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            Manage QA Leads &amp; QA Employees, monitor AI engine health, and
            oversee workspace audit activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Environment dropdown */}
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
                  className="absolute right-0 top-full mt-1.5 w-48 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] py-1 z-30 animate-enter"
                  style={{ boxShadow: "0 4px 16px rgba(15,23,42,0.08)" }}
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

          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={() => openFormDrawer("add-website")}
            className="gap-1.5 font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Add website
          </Button>

          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={() => openFormDrawer("add-user")}
            className="gap-1.5 font-medium"
          >
            <Plus className="h-3.5 w-3.5" /> Add user
          </Button>
        </div>
      </div>

      {/* ── Row 1: 4 Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Team & Roles */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">
            Team &amp; Roles
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">
              {loading ? "—" : totalTeam}
            </span>
            <span className="text-[12px] font-semibold text-orange-500 dark:text-orange-400">
              {leads.length} Leads · {employees.length} Emp
            </span>
          </div>
        </Card>

        {/* Card 2: Registered websites */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">
            Registered websites
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">
              {loading ? "—" : activeWebsites.length}
            </span>
            <span className="text-[12px] text-[var(--text-muted)]">
              {activeWebsites.length} active apps
            </span>
          </div>
        </Card>

        {/* Card 3: Total runs (30 days) */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">
            Total runs (30 days)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">
              {loading ? "—" : totalRuns > 0 ? totalRuns : 142}
            </span>
            <span className="mono-data text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
              {passRate}% pass
            </span>
          </div>
        </Card>

        {/* Card 4: AI engine usage */}
        <Card className="p-4 flex flex-col justify-between h-[105px]">
          <span className="text-[12px] font-medium text-[var(--text-muted)]">
            AI engine usage (30d)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="mono-data text-[28px] font-bold text-[var(--text)] leading-none">
              246
            </span>
            <span className="mono-data text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
              0 errors
            </span>
          </div>
        </Card>
      </div>

      {/* ── Row 2: Global Trend Chart + AI Providers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Global Execution Trend */}
        <div className="lg:col-span-8">
          <Card className="p-5 flex flex-col h-[260px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold text-[var(--text)]">
                Global Execution Trend (30 days)
              </span>
              <span className="mono-data text-[12px] text-[var(--text-muted)]">
                {totalRuns > 0 ? totalRuns : 142} runs across {activeWebsites.length > 0 ? activeWebsites.length : 3} environments
              </span>
            </div>

            <div className="flex-1 flex items-end gap-[3px] pb-2 px-1">
              {TREND_BARS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col justify-end h-full group"
                >
                  <div
                    className="w-full rounded-t-[3px] bg-[#D4D7F8] dark:bg-[#3E4378] group-hover:bg-[var(--primary)] transition-colors duration-150"
                    style={{ height: `${h}%` }}
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

        {/* AI Providers & Governance */}
        <div className="lg:col-span-4">
          <Card className="p-5 flex flex-col h-[260px]">
            <span className="text-[13px] font-semibold text-[var(--text)] mb-4 block">
              AI Providers &amp; Governance
            </span>

            {/* Ollama */}
            <div className="p-3 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[var(--text)]">
                  Ollama (Local)
                </span>
                <span className="flex items-center gap-1.5 mono-data text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  28ms
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">
                qwen2.5:14b · 184 calls
              </span>
            </div>

            {/* Gemini */}
            <div className="p-3 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] mb-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[var(--text)]">
                  Gemini (Cloud)
                </span>
                <span className="flex items-center gap-1.5 mono-data text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                  138ms
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">
                2.5-pro · 62 calls
              </span>
            </div>

            <div className="border-t border-[var(--border)] pt-2.5 pb-2 flex items-center justify-between text-[12px]">
              <span className="text-[var(--text)]">
                Separate Approver:{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ON
                </span>
              </span>
              <span className="text-[var(--text-muted)]">
                Kill Switch:{" "}
                <span className="font-medium text-[var(--text)]">Idle</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => toast.info("Testing AI provider connections…")}
              className="mt-auto w-full h-9 rounded-[6px] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)] hover:bg-[var(--hover-subtle)] text-[12px] font-medium text-[var(--text)] flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Test AI provider connections
            </button>
          </Card>
        </div>
      </div>

      {/* ── Row 3: Team & Roles / Recent Runs + Governance Audit ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Team & Roles / Recent Runs */}
        <div className="lg:col-span-8">
          <Card className="p-0 overflow-hidden">
            {/* Tab bar */}
            <div className="p-4 pb-3 border-b border-[var(--border)] flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-[var(--hover-subtle)] rounded-[6px] p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("team")}
                  className={cn(
                    "px-3 py-1.5 rounded-[5px] text-[12px] font-medium transition-colors",
                    activeTab === "team"
                      ? "bg-white dark:bg-[var(--surface)] text-[var(--text)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]",
                  )}
                >
                  Team &amp; Roles
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("runs")}
                  className={cn(
                    "px-3 py-1.5 rounded-[5px] text-[12px] font-medium transition-colors",
                    activeTab === "runs"
                      ? "bg-white dark:bg-[var(--surface)] text-[var(--text)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]",
                  )}
                >
                  Recent Runs
                </button>
              </div>

              {activeTab === "team" && (
                <>
                  {/* Role filter dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRoleOpen((v) => !v)}
                      className="h-8 px-3 rounded-[6px] bg-[var(--surface)] border border-[var(--border)] text-[12px] font-medium text-[var(--text)] flex items-center gap-1.5 hover:border-[var(--border-hover)] transition-colors"
                    >
                      {roleFilter}
                      <ChevronDown className={cn("h-3 w-3 text-[var(--text-muted)] transition-transform", roleOpen && "rotate-180")} />
                    </button>
                    {roleOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setRoleOpen(false)} />
                        <div
                          className="absolute left-0 top-full mt-1.5 w-40 rounded-[8px] bg-[var(--surface)] border border-[var(--border)] py-1 z-30 animate-enter"
                          style={{ boxShadow: "0 4px 16px rgba(15,23,42,0.08)" }}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => { setRoleFilter(r); setRoleOpen(false); }}
                              className={cn(
                                "w-full text-left px-3.5 py-2 text-[12px] flex items-center justify-between transition-colors",
                                roleFilter === r
                                  ? "bg-[var(--primary-tint)] text-[var(--primary)] font-semibold"
                                  : "text-[var(--text)] hover:bg-[var(--hover-subtle)]",
                              )}
                            >
                              {r}
                              {roleFilter === r && <Check className="h-3.5 w-3.5 text-[var(--primary)]" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={() => openFormDrawer("add-user")}
                    className="gap-1.5 font-medium ml-auto"
                  >
                    <Users className="h-3.5 w-3.5" /> + Add QA Lead / Employee
                  </Button>
                </>
              )}
            </div>

            {/* Team & Roles Tab */}
            {activeTab === "team" && (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      <th className="text-left py-2.5 px-4">User</th>
                      <th className="text-left py-2.5 px-4">Role</th>
                      <th className="text-left py-2.5 px-4">Lead / Scope</th>
                      <th className="text-left py-2.5 px-4">Added By</th>
                      <th className="text-left py-2.5 px-4">Status</th>
                      <th className="text-left py-2.5 px-4">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredMembers.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-[var(--hover-row)] transition-colors"
                      >
                        {/* USER */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[var(--text)] leading-snug">
                            {m.name}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)]">
                            {m.email}
                          </p>
                        </td>
                        {/* ROLE */}
                        <td className="py-3 px-4">{getRoleBadge(m.role)}</td>
                        {/* LEAD / SCOPE */}
                        <td className="py-3 px-4">
                          {getLeadScope(m)}
                        </td>
                        {/* ADDED BY */}
                        <td className="py-3 px-4 text-[12px] text-[var(--text-muted)]">
                          Alex Chen
                        </td>
                        {/* STATUS */}
                        <td className="py-3 px-4">
                          {m.status === "invited" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                              Invited
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                              Active
                            </span>
                          )}
                        </td>
                        {/* MANAGE */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              type="button"
                              onClick={() => openFormDrawer('edit-user', { member: m })}
                              className="h-7 text-[11px] px-2.5"
                            >
                              Edit
                            </Button>
                            {m.role !== "admin" && (
                              <button
                                type="button"
                                onClick={() => setMemberToDelete(m)}
                                className="h-7 w-7 flex items-center justify-center rounded-[5px] border border-[var(--border)] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Recent Runs Tab */}
            {activeTab === "runs" && (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      <th className="text-left py-2.5 px-4 w-28">Status</th>
                      <th className="text-left py-2.5 px-4">Task / Website</th>
                      <th className="text-left py-2.5 px-4">Author</th>
                      <th className="text-left py-2.5 px-4">Engine</th>
                      <th className="text-left py-2.5 px-4">Duration</th>
                      <th className="text-right py-2.5 px-4">Started</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {MOCK_RECENT_RUNS.map((run) => (
                      <tr
                        key={run.id}
                        className="hover:bg-[var(--hover-row)] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <StatusBadge status={run.status as StatusValue} />
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-[var(--text)] leading-snug">
                            {run.taskTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {run.website}
                            </span>
                            <EnvBadge env={run.env} />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[12px] text-[var(--text-muted)]">
                          {run.author}
                        </td>
                        <td className="py-3 px-4 mono-data text-[12px] text-[var(--text-muted)]">
                          {run.engine}
                        </td>
                        <td className="py-3 px-4 mono-data text-[12px] text-[var(--text)]">
                          {run.duration}
                        </td>
                        <td className="py-3 px-4 text-right mono-data text-[12px] text-[var(--text-muted)]">
                          {run.started}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Governance Audit */} 
        <div className="lg:col-span-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold text-[var(--text)]">
                Governance Audit
              </span>
              <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--hover-subtle)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                Append-only
              </span>
            </div>

            <div className="space-y-4">
              {AUDIT_LOG.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-0.5">
                  <p className="text-[12px] text-[var(--text)] leading-snug">
                    <span className="font-semibold">{entry.actor}</span>
                    {entry.actorRole && (
                      <span className="text-[var(--text-muted)]">
                        {" "}({entry.actorRole})
                      </span>
                    )}{" "}
                    {entry.action}
                    {entry.target && (
                      <>
                        {" "}
                        <span className="font-semibold">{entry.target}</span>
                        {entry.targetRole && (
                          <span className="text-[var(--text-muted)]">
                            {" "}({entry.targetRole})
                          </span>
                        )}
                      </>
                    )}
                  </p>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {entry.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMemberToDelete(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4 animate-enter">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                  Delete {memberToDelete.name}?
                </h3>
                <p className="text-[13px] text-gray-500 dark:text-neutral-400 mt-1">
                  Are you sure you want to permanently delete this user ({memberToDelete.email})? Their account and access will be removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="h-9 px-4 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 text-[13px] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-medium transition-colors shadow-none disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
