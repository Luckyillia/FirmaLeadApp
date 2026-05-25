// ============================================================
// LEADAPP — Tworzenie użytkowników bezpośrednio w tabeli profiles
// (bez Supabase Auth — hasło SHA-256 + sól)
// ============================================================
// Uruchom: node create_users.js
// Wymagane: npm install @supabase/supabase-js dotenv
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { randomUUID } from 'crypto';
// Wczytaj zmienne z .env
config({ path: '../../.env' });

const SUPABASE_URL     = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // service_role key — NIE anon!
const SALT             = process.env.VITE_PASSWORD_SALT;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !SALT) {
  console.error('Brak wymaganych zmiennych środowiskowych:');
  console.error('  VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_PASSWORD_SALT');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function sha256(password) {
  const salted = `${SALT}${password}${SALT}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(salted);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const USERS = [
  { email: 'admin@leadapp.pl',  password: 'Admin1234!',  full_name: 'Anna Kowalska',     role: 'admin'        },
  { email: 'cc1@leadapp.pl',    password: 'Agent1234!',  full_name: 'Piotr Nowak',        role: 'agent_cc'     },
  { email: 'cc2@leadapp.pl',    password: 'Agent1234!',  full_name: 'Marta Wiśniewska',   role: 'agent_cc'     },
  { email: 'sd1@leadapp.pl',    password: 'Sales1234!',  full_name: 'Tomasz Lewandowski', role: 'sales_direct' },
  { email: 'sd2@leadapp.pl',    password: 'Sales1234!',  full_name: 'Karolina Zając',     role: 'sales_direct' },
  { email: 'buyer@techcorp.pl', password: 'Buyer1234!',  full_name: 'Marek Dąbrowski',    role: 'buyer'        },
];

async function main() {
  console.log('Tworzenie użytkowników w tabeli profiles...\n');

  for (const u of USERS) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: randomUUID(),
          email: u.email.toLowerCase(),
          full_name: u.full_name,
          role: u.role,
          is_active: true,
          password: await sha256(u.password),
        },
        { onConflict: 'email' }
      )
      .select('id')
      .single();

    if (error) {
      console.error(`✗ ${u.email}: ${error.message}`);
    } else {
      console.log(`✓ ${u.email}  →  ${data.id}`);
    }
  }

  console.log('\nGotowe!');
}

main();
