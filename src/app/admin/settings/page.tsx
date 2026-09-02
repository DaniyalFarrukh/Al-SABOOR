import { getStoreSettings, updateStoreSettings } from '@/lib/actions/settings'
import { hasPermission } from '@/lib/actions/analytics'
import { Settings, Save, AlertCircle } from 'lucide-react'

export default async function AdminSettingsPage() {
  const canManage = await hasPermission('manage_settings')
  
  if (!canManage) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>You do not have permission to manage store settings.</p>
      </div>
    )
  }

  const settings = await getStoreSettings()
  
  if (!settings) {
    return <div>Error loading settings or no settings found. Run migrations.</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={28} /> Store Configuration
        </h1>
        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
          Manage global store settings, policies, and integrations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* General Settings */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>General Information</h2>
          <form action={async (formData) => {
            'use server'
            const data = {
              store_name: formData.get('store_name'),
              contact_number: formData.get('contact_number'),
              whatsapp_number: formData.get('whatsapp_number'),
              email: formData.get('email'),
              address: formData.get('address'),
              business_hours: formData.get('business_hours'),
            }
            await updateStoreSettings('general', data)
          }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Store Name</label>
              <input type="text" name="store_name" className="form-input" defaultValue={settings.general?.store_name} required />
            </div>
            <div>
              <label className="form-label">Contact Email</label>
              <input type="email" name="email" className="form-input" defaultValue={settings.general?.email} required />
            </div>
            <div>
              <label className="form-label">Contact Number</label>
              <input type="text" name="contact_number" className="form-input" defaultValue={settings.general?.contact_number} />
            </div>
            <div>
              <label className="form-label">WhatsApp Number</label>
              <input type="text" name="whatsapp_number" className="form-input" defaultValue={settings.general?.whatsapp_number} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Address</label>
              <input type="text" name="address" className="form-input" defaultValue={settings.general?.address} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Save General Settings
              </button>
            </div>
          </form>
        </div>

        {/* Shipping Settings */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Shipping Configuration</h2>
          <form action={async (formData) => {
            'use server'
            const data = {
              flat_rate_cost: Number(formData.get('flat_rate_cost')),
              free_shipping_threshold: Number(formData.get('free_shipping_threshold')),
              delivery_estimate: formData.get('delivery_estimate'),
            }
            await updateStoreSettings('shipping', data)
          }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Flat Rate Shipping Cost (Rs.)</label>
              <input type="number" name="flat_rate_cost" className="form-input" defaultValue={settings.shipping?.flat_rate_cost} required />
            </div>
            <div>
              <label className="form-label">Free Shipping Threshold (Rs.)</label>
              <input type="number" name="free_shipping_threshold" className="form-input" defaultValue={settings.shipping?.free_shipping_threshold} required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Delivery Estimate Text</label>
              <input type="text" name="delivery_estimate" className="form-input" defaultValue={settings.shipping?.delivery_estimate} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Save Shipping Settings
              </button>
            </div>
          </form>
        </div>

        {/* Payment Settings */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Payment Methods</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
            Enable or disable frontend payment methods. Note: API keys must be managed in environment variables for security.
          </p>
          <form action={async (formData) => {
            'use server'
            const data = {
              cod: formData.get('cod') === 'on',
              jazzcash: formData.get('jazzcash') === 'on',
              easypaisa: formData.get('easypaisa') === 'on',
              card: formData.get('card') === 'on',
            }
            await updateStoreSettings('payments', data)
          }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" name="cod" defaultChecked={settings.payments?.cod} style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={{ fontWeight: 500 }}>Cash on Delivery (COD)</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" name="jazzcash" defaultChecked={settings.payments?.jazzcash} style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={{ fontWeight: 500 }}>JazzCash</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" name="easypaisa" defaultChecked={settings.payments?.easypaisa} style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={{ fontWeight: 500 }}>Easypaisa</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" name="card" defaultChecked={settings.payments?.card} style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={{ fontWeight: 500 }}>Credit/Debit Card</span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Save Payment Settings
              </button>
            </div>
          </form>
        </div>

        {/* Policies */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Store Policies</h2>
          <form action={async (formData) => {
            'use server'
            const data = {
              shipping_policy: formData.get('shipping_policy'),
              return_policy: formData.get('return_policy'),
              refund_policy: formData.get('refund_policy'),
              privacy_policy: formData.get('privacy_policy'),
              terms_of_service: formData.get('terms_of_service'),
            }
            await updateStoreSettings('policies', data)
          }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div>
              <label className="form-label">Shipping Policy</label>
              <textarea name="shipping_policy" className="form-input" rows={4} defaultValue={settings.policies?.shipping_policy}></textarea>
            </div>

            <div>
              <label className="form-label">Return Policy</label>
              <textarea name="return_policy" className="form-input" rows={4} defaultValue={settings.policies?.return_policy}></textarea>
            </div>

            <div>
              <label className="form-label">Refund Policy</label>
              <textarea name="refund_policy" className="form-input" rows={4} defaultValue={settings.policies?.refund_policy}></textarea>
            </div>

            <div>
              <label className="form-label">Privacy Policy</label>
              <textarea name="privacy_policy" className="form-input" rows={4} defaultValue={settings.policies?.privacy_policy}></textarea>
            </div>

            <div>
              <label className="form-label">Terms of Service</label>
              <textarea name="terms_of_service" className="form-input" rows={4} defaultValue={settings.policies?.terms_of_service}></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Save Policies
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
