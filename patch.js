const fs = require('fs');
const content = fs.readFileSync('server/routes/api.js', 'utf8');

const target = `import sharp from "sharp";

const router = Router();`;

const replacement = `import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

// Tu URL y llave pública (Anon) de Supabase
const supabaseUrl = "https://qzkkiiymduefnbwmdtgb.supabase.co";
// NOTA: Para subir archivos a un bucket publico desde el backend, a veces es mejor usar el role_key o el anon_key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
let supabase = null;
if (supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const router = Router();`;

fs.writeFileSync('server/routes/api.js', content.replace(target, replacement));
