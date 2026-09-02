import { createClient } from '@/utils/supabase/server'
import { Shield, FileText, Search, Clock } from 'lucide-react'
import { hasPermission } from '@/lib/actions/analytics'
import { AlertCircle } from 'lucide-react'

export default async function AdminAuditLogsPage() {
  const canViewLogs = await hasPermission('superadmin') || await hasPermission('manage_admins')
  
  if (!canViewLogs) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>You do not have permission to view system audit logs.</p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select('*, profiles(first_name, last_name, roles(name))')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Shield size={28} /> Security & Audit Logs
          </h1>
          <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
            System-generated audit trail of sensitive actions (Recent 100).
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Time</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Actor</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Action</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Entity</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: 'var(--muted-foreground)' }}>Diff</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log: any) => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', color: 'var(--muted-foreground)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} />
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {log.profiles ? (
                    <div>
                      <span style={{ fontWeight: 600 }}>{log.profiles.first_name} {log.profiles.last_name}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{(log.profiles.roles as any)?.name}</div>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>System</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    backgroundColor: log.action === 'DELETE' ? 'rgba(239, 68, 68, 0.1)' : (log.action === 'UPDATE' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)'),
                    color: log.action === 'DELETE' ? '#ef4444' : (log.action === 'UPDATE' ? '#3b82f6' : '#22c55e')
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{log.entity_type}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }} title={log.entity_id}>{log.entity_id.substring(0, 8)}...</div>
                </td>
                <td style={{ padding: '1rem', maxWidth: '300px' }}>
                  {log.action === 'UPDATE' && (
                    <div style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.75rem', backgroundColor: 'var(--muted)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(
                          Object.keys(log.new_value || {}).reduce((acc: any, key) => {
                            if (log.old_value && log.old_value[key] !== log.new_value[key]) {
                              acc[key] = { from: log.old_value[key], to: log.new_value[key] }
                            }
                            return acc
                          }, {}),
                        null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.action === 'INSERT' && <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Record Created</span>}
                  {log.action === 'DELETE' && <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Record Deleted</span>}
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
