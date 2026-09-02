import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });
  const bucketName = 'product-photos';

  console.log(`Checking bucket: ${bucketName}...`);
  const { data, error } = await supabase.storage.getBucket(bucketName);
  
  if (error && (error.message.includes('not found') || error.message.includes('Object not found'))) {
    console.log(`Bucket not found. Creating ${bucketName}...`);
    const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });
    
    if (createError) {
      console.error('Error creating bucket:', createError);
    } else {
      console.log('Bucket created successfully!');
    }
  } else if (data) {
    console.log('Bucket already exists.');
    await supabase.storage.updateBucket(bucketName, { public: true });
  } else if (error) {
    console.error('Error getting bucket:', error);
  }
}

setup();
