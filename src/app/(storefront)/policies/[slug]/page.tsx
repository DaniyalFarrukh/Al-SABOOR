import { getStoreSettings } from '@/lib/actions/settings'
import { notFound } from 'next/navigation'

export default async function PolicyPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const slug = params.slug
  const settings = await getStoreSettings()

  if (!settings || !settings.policies) {
    notFound()
  }

  // Map slugs to JSON keys
  const policyMap: Record<string, { title: string, key: string }> = {
    'shipping-policy': { title: 'Shipping Policy', key: 'shipping_policy' },
    'return-policy': { title: 'Return Policy', key: 'return_policy' },
    'refund-policy': { title: 'Refund Policy', key: 'refund_policy' },
    'privacy-policy': { title: 'Privacy Policy', key: 'privacy_policy' },
    'terms-of-service': { title: 'Terms of Service', key: 'terms_of_service' },
  }

  const policy = policyMap[slug]
  if (!policy) notFound()

  const content = settings.policies[policy.key]
  
  if (!content) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>{policy.title}</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>This policy has not been configured yet.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>{policy.title}</h1>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--foreground)', fontSize: '1.125rem' }}>
        {content}
      </div>
    </div>
  )
}

// Generate static params for the known policies
export function generateStaticParams() {
  return [
    { slug: 'shipping-policy' },
    { slug: 'return-policy' },
    { slug: 'refund-policy' },
    { slug: 'privacy-policy' },
    { slug: 'terms-of-service' },
  ]
}
