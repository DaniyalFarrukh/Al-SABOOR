import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { hasPermission } from '@/lib/actions/analytics'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const p = await params
  const type = p.type

  // 1. Verify Authentication & Base Export Permission
  const canExport = await hasPermission('export_data')
  if (!canExport) {
    return new NextResponse('Forbidden: You lack export permissions.', { status: 403 })
  }

  const supabase = await createClient()
  let csvContent = ''
  let filename = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`

  try {
    if (type === 'orders') {
      const { data } = await supabase.from('orders').select('order_number, created_at, status, grand_total, customer_first_name, customer_last_name, customer_email, shipping_city').order('created_at', { ascending: false })
      if (!data) throw new Error('No data')
      
      csvContent = 'Order Number,Date,Status,Total,Customer Name,Email,City\n'
      data.forEach((row: any) => {
        csvContent += `"${row.order_number}","${row.created_at}","${row.status}","${row.grand_total}","${row.customer_first_name} ${row.customer_last_name}","${row.customer_email}","${row.shipping_city}"\n`
      })
    } 
    
    else if (type === 'sales') {
      // Security check: Only revenue-permitted roles can export financial sales
      const canViewRevenue = await hasPermission('view_revenue')
      if (!canViewRevenue) return new NextResponse('Forbidden: You lack revenue viewing permissions.', { status: 403 })

      const { data } = await supabase.from('orders').select('order_number, created_at, subtotal, discount_amount, shipping_cost, grand_total').eq('status', 'delivered').order('created_at', { ascending: false })
      if (!data) throw new Error('No data')
      
      csvContent = 'Order Number,Date,Gross Sales (Subtotal),Discounts,Shipping Collected,Net Revenue (Grand Total)\n'
      data.forEach((row: any) => {
        csvContent += `"${row.order_number}","${row.created_at}","${row.subtotal}","${row.discount_amount}","${row.shipping_cost}","${row.grand_total}"\n`
      })
    }
    
    else if (type === 'inventory') {
      const { data } = await supabase.from('inventory').select('quantity, low_stock_threshold, products(name, sku, brands(name))')
      if (!data) throw new Error('No data')
      
      csvContent = 'SKU,Product Name,Brand,Current Quantity,Low Stock Threshold,Status\n'
      data.forEach((row: any) => {
        const status = row.quantity <= 0 ? 'Out of Stock' : (row.quantity <= row.low_stock_threshold ? 'Low Stock' : 'In Stock')
        csvContent += `"${row.products?.sku}","${row.products?.name}","${row.products?.brands?.name || 'N/A'}","${row.quantity}","${row.low_stock_threshold}","${status}"\n`
      })
    }
    
    else if (type === 'customers') {
      const { data } = await supabase.from('profiles').select('first_name, last_name, phone, is_blocked, created_at')
      if (!data) throw new Error('No data')
      
      csvContent = 'First Name,Last Name,Phone,Joined Date,Status\n'
      data.forEach((row: any) => {
        csvContent += `"${row.first_name}","${row.last_name}","${row.phone || ''}","${row.created_at}","${row.is_blocked ? 'Blocked' : 'Active'}"\n`
      })
    }
    
    else {
      return new NextResponse('Invalid export type requested.', { status: 400 })
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 })
  }
}
