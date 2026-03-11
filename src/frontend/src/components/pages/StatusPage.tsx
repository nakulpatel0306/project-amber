import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Monitor,
  Server,
  Database,
  Cpu,
  Shield,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { healthCheck, type HealthResponse } from '../../utils/api';

const SERVICE_META: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  api: { label: 'API', icon: Server, color: '#10B981' },
  database: { label: 'Database', icon: Database, color: '#8B5CF6' },
  supabase: { label: 'Supabase', icon: Monitor, color: '#3B82F6' },
  matching_engine: { label: 'Matching Engine', icon: Cpu, color: '#F59E0B' },
  auth: { label: 'Authentication', icon: Shield, color: '#EC4899' },
};

const STATUS_STYLES: Record<
  string,
  { dot: string; label: string; Icon: React.ElementType }
> = {
  operational: { dot: '#10B981', label: 'Operational', Icon: CheckCircle2 },
  degraded: { dot: '#F59E0B', label: 'Degraded', Icon: AlertTriangle },
  down: { dot: '#EF4444', label: 'Down', Icon: XCircle },
  unknown: { dot: '#6B7280', label: 'Unknown', Icon: AlertTriangle },
};

const POLL_INTERVAL = 30_000;

export function StatusPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await healthCheck();
      setData(res);
      setError(false);
    } catch {
      setError(true);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchHealth]);

  const overallStatus = error ? 'unknown' : (data?.status ?? 'unknown');
  const overallStyle = STATUS_STYLES[overallStatus] ?? STATUS_STYLES.unknown;

  type DisplayHealth = { status: "operational" | "degraded" | "down" | "unknown"; latency_ms?: number };
  const serviceEntries: [string, DisplayHealth][] = data
    ? Object.entries(data.services)
    : Object.keys(SERVICE_META).map((k) => [k, { status: 'unknown' as const }]);

  const formattedTime = data?.timestamp
    ? new Date(data.timestamp).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
    : null;

  return (
    <div style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-textMuted)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back To Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
          >
            <Activity className="w-5 h-5" style={{ color: '#10B981' }} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#10B981' }}
          >
            System Health
          </span>
        </div>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
        >
          System Status
        </h1>

        {loading ? (
          <div
            className="inline-block h-8 w-52 rounded-full animate-pulse"
            style={{ background: 'var(--color-backgroundSecondary)' }}
          />
        ) : (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{
              background: `${overallStyle.dot}15`,
              color: overallStyle.dot,
            }}
          >
            <overallStyle.Icon className="w-4 h-4" />
            {overallStatus === 'operational'
              ? 'All Systems Operational'
              : overallStatus === 'degraded'
                ? 'Some Systems Degraded'
                : overallStatus === 'down'
                  ? 'Systems Down'
                  : 'Unable to Reach Backend'}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {serviceEntries.map(([key, svc]) => {
            const meta = SERVICE_META[key] ?? {
              label: key,
              icon: Server,
              color: '#6B7280',
            };
            const Icon = meta.icon;
            const style = STATUS_STYLES[svc.status] ?? STATUS_STYLES.unknown;

            if (loading) {
              return (
                <div
                  key={key}
                  className="rounded-2xl p-5 animate-pulse"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    height: 100,
                  }}
                />
              );
            }

            return (
              <div
                key={key}
                className="rounded-2xl p-5"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: `${meta.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: meta.color }} />
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {meta.label}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: style.dot }}
                        />
                        <span className="text-[11px]" style={{ color: style.dot }}>
                          {style.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  {svc.latency_ms !== undefined && (
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: 'var(--color-backgroundSecondary)',
                        color: 'var(--color-textSecondary)',
                      }}
                    >
                      {svc.latency_ms} ms
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Incident History */}
        <div className="mb-10">
          <h2
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}
          >
            Incident History
          </h2>
          <p
            className="text-xs mb-4"
            style={{ color: 'var(--color-textSecondary)' }}
          >
            Last 30 days
          </p>
          <div
            className="rounded-2xl p-6 flex items-center gap-3"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <CheckCircle2
              className="w-5 h-5 flex-shrink-0"
              style={{ color: '#10B981' }}
            />
            <p
              className="text-sm"
              style={{ color: 'var(--color-textSecondary)' }}
            >
              No incidents reported in the last 30 days.
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center space-y-0.5">
          {formattedTime ? (
            <p
              className="text-[11px] inline-flex items-center gap-1.5"
              style={{ color: 'var(--color-textMuted)' }}
            >
              <RefreshCw className="w-3 h-3" />
              Last checked: {formattedTime}
            </p>
          ) : (
            <p className="text-[11px]" style={{ color: 'var(--color-textMuted)' }}>
              {loading ? 'Checking...' : 'Unable to reach backend'}
            </p>
          )}
          <p className="text-[11px]" style={{ color: 'var(--color-textMuted)' }}>
            Auto-refreshes every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
