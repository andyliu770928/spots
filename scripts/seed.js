const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 讀取 .env.local 取得連線資訊
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('找不到 Supabase URL 或 Key，請確認 .env.local 內容');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('正在嘗試寫入資料到 Supabase...');
  
  const testData = {
    title: '新店 - 超人鱸魚湯 (米其林必比登)',
    category: 'food',
    city: '新北市',
    district: '新店區',
    address: '新北市新店區北新路一段349號',
    summary: '每日現煮現熬魚湯、肉質肥美彈牙、小菜茄子份量大、連滷肉飯評價都很高。',
    tags: ['新店', '鱸魚湯', '米其林', '在地美食'],
    status: 'shortlisted',
    cover_image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1471&auto=format&fit=crop',
    source_url: 'https://www.google.com/maps/search/?api=1&query=新店超人鱸魚湯'
  };

  const { data, error } = await supabase
    .from('places')
    .insert([testData])
    .select();

  if (error) {
    console.error('寫入失敗！');
    console.error('錯誤訊息:', error.message);
    if (error.message.includes('relation "public.places" does not exist')) {
      console.error('\n原因：您的資料庫中還沒有 "places" 表格。');
      console.error('請先到 Supabase SQL Editor 執行 supabase-setup.txt 裡的指令。');
    }
    process.exit(1);
  }

  console.log('寫入成功！資料內容:', data[0].title);
  console.log('現在重新整理網頁 (http://localhost:3000) 應該就能看到資料了！');
}

seed();
