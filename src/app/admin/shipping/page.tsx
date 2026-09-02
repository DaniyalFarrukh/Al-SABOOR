import { getShippingZones } from '@/lib/actions/shipping'
import { Truck } from 'lucide-react'

export default async function AdminShippingPage() {
  const zones = await getShippingZones()

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Truck size={28} /> Shipping Zones & Rules
        </h1>
        <button className="btn-primary">Add Zone</button>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {zones.map((zone: any) => (
          <div key={zone.id} className="admin-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{zone.name}</h2>
              <span style={{ padding: '0.25rem 0.5rem', backgroundColor: zone.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: zone.is_active ? '#22c55e' : '#ef4444', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {zone.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0', color: 'var(--muted-foreground)', fontWeight: 500 }}>Base Cost</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0', color: 'var(--muted-foreground)', fontWeight: 500 }}>Free Shipping Threshold</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0', color: 'var(--muted-foreground)', fontWeight: 500 }}>City Match (Regex)</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem 0', color: 'var(--muted-foreground)', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {zone.shipping_rules?.map((rule: any) => (
                  <tr key={rule.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 600 }}>Rs. {rule.base_cost}</td>
                    <td style={{ padding: '1rem 0' }}>{rule.free_shipping_threshold ? `Rs. ${rule.free_shipping_threshold}` : 'None'}</td>
                    <td style={{ padding: '1rem 0', fontFamily: 'monospace' }}>{rule.city_region_regex || '*'}</td>
                    <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                      <button className="btn-secondary" style={{ padding: '0.5rem' }}>Edit Rule</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
