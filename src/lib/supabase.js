import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rlpeuraolsjfawvcchki.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscGV1cmFvbHNqZmF3dmNjaGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MzM5NjIsImV4cCI6MjA2ODA5OTk2Mn0.V_58f67Oa_y239pT37O-m674Fof0XlR3iR1h81Dq-Xk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);