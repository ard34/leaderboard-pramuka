const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fixData() {
  console.log("Fixing data...");
  const dummyUrl = 'https://ftjgfkqprmftkjvrrvrg.supabase.co/storage/v1/object/public/berkas_peserta/ketersediaan/1788342475722-nhwaj.jpeg';
  
  const { data, error } = await supabase
    .from('peserta')
    .update({
      berkas_ketersediaan: dummyUrl,
      berkas_pendaftaran: dummyUrl,
      berkas_biodata_peserta: dummyUrl,
      berkas_biodata_pembina: dummyUrl
    })
    .eq('nama_regu', 'Regu Rajawali');
    
  if (error) {
    console.error("Error updating:", error);
  } else {
    console.log("Updated Regu Rajawali with dummy URLs!");
  }
}

fixData();
