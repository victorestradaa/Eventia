
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBucket() {
  const { data, error } = await supabase.storage.getBucket('servicios');
  if (error) {
    console.error('Error getting bucket:', error);
  } else {
    console.log('Bucket "servicios" metadata:', data);
  }
  
  const { data: listData, error: listError } = await supabase.storage.from('servicios').list('catalogo', { limit: 5 });
  if (listError) {
    console.error('Error listing catalogo:', listError);
  } else {
    console.log('Last 5 files in catalogo:', listData);
    if (listData && listData.length > 0) {
        const { data: publicUrl } = supabase.storage.from('servicios').getPublicUrl(`catalogo/${listData[0].name}`);
        console.log('Example Public URL:', publicUrl.publicUrl);
    }
  }
}

checkBucket();
