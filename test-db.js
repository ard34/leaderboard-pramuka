const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('peserta').select('*').eq('nama_regu', 'Regu Uji Coba');
  console.log("DATA:", data);
  if (error) console.error("ERROR:", error);
}

test();
