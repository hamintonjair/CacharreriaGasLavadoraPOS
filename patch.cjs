const fs = require('fs');
const content = fs.readFileSync('server/routes/api.js', 'utf8');

const target = `import sharp from "sharp";\n\nconst router = Router();`;

const replacement = `import sharp from "sharp";\nimport { createClient } from "@supabase/supabase-js";\n\nconst supabaseUrl = process.env.VITE_SUPABASE_URL || "https://qzkkiiymduefnbwmdtgb.supabase.co";\nconst supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;\nlet supabase = null;\nif (supabaseUrl) {\n  supabase = createClient(supabaseUrl, supabaseKey || "dummy");\n}\n\nconst router = Router();`;

fs.writeFileSync('server/routes/api.js', content.replace(target, replacement));
