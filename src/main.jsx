import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { registerSW } from 'virtual:pwa-register';
import { supabase } from "./lib/supabase";

// ✅ Keep token fresh automatically
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    localStorage.setItem('token', session.access_token);
  }
  if (event === 'SIGNED_OUT') {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
});

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available. Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);