import axios from "axios";
import { supabase } from "./supabase";

const API_BASE = "https://vetcare-1.onrender.com";

// A dedicated instance (not the default `axios` export) so this call never
// runs through main.jsx's global 401 interceptor, which clears the token and
// force-redirects to /login. That interceptor is meant for *expired* sessions
// on already-logged-in pages — it must not fire on the very first profile
// lookup right after a fresh sign-in, or the redirect below never happens.
const api = axios.create({ baseURL: API_BASE });

// Persists the Supabase session token under the same "token" key the rest
// of the app already reads for Authorization headers, then routes the user
// to /create-account (first-time / incomplete profile) or /dashboard.
export const completeLogin = async (navigate) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    navigate("/login", { replace: true });
    return;
  }

  // ✅ THIS LINE WAS MISSING — save token so all other screens can use it
  localStorage.setItem("token", session.access_token);

  try {
    const res = await api.get("/api/profile", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    navigate(res.data.isProfileComplete ? "/dashboard" : "/create-account", {
      replace: true,
    });
  } catch {
    // Backend couldn't be reached or has no profile for this user yet —
    // treat as a first-time sign-in rather than logging them out.
    navigate("/create-account", { replace: true });
  }
};
