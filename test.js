import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function test() {
  const { data: categories } = await supabase.from('categories').select('id, name, slug')
  console.log('Categories:', categories)
  
  const { data: products } = await supabase.from('products').select('id, name, slug, category_id, is_active')
  console.log('Products:', products)
  
  const { data: pricing } = await supabase.from('product_pricing').select('product_id, retail_price')
  console.log('Pricing:', pricing)
}

test()
