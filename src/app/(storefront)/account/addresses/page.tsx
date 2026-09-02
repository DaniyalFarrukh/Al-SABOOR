import { getAddresses } from '@/lib/actions/account'
import { AddressForm } from './AddressForm'
import { DeleteAddressButton } from './DeleteAddressButton'

export default async function AddressesPage() {
  const addresses = await getAddresses()

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        Saved Addresses
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Address List */}
        <div>
          {addresses.length === 0 ? (
            <p style={{ color: 'var(--muted-foreground)' }}>You haven't saved any addresses yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {addresses.map((addr: any) => (
                <div key={addr.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', position: 'relative' }}>
                  {addr.is_default && (
                    <span style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Default</span>
                  )}
                  <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{addr.first_name} {addr.last_name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{addr.address_line1}</p>
                  {addr.address_line2 && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{addr.address_line2}</p>}
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{addr.city}, {addr.postal_code}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>{addr.phone}</p>
                  
                  <DeleteAddressButton addressId={addr.id} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Address Form */}
        <AddressForm />
      </div>
    </div>
  )
}
