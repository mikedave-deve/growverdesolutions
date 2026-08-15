import React from "react";
import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "../constants/routes.js";
import { Logo } from "../components/brand/Logo.jsx";
import loginBg from "../assets/images/office/login.png";

export function AuthLayout() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-sand-50">
      <div className="flex flex-col justify-between p-8 md:p-12">
        <Link to={ROUTES.HOME}><Logo /></Link>
        <div className="w-full max-w-sm mx-auto py-12">
          <Outlet />
        </div>
        <p className="text-xs text-ink-700/40">© {new Date().getFullYear()} Growverde Solutions</p>
      </div>
      <div
        className="hidden md:flex flex-col justify-between text-white p-12 relative overflow-hidden bg-ink-900 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg})` }}
      >
        <div className="absolute inset-0 bg-ink-900/70" aria-hidden="true" />
        <div className="relative z-10">
          <p className="label-eyebrow text-forest-300 mb-3">Secure Employee Portal</p>
          <h2 className="font-display text-3xl font-bold leading-tight max-w-sm">
            Everything about your employment, organized in one place.
          </h2>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-6 text-sm text-white/70">
          <div>
            <p className="text-2xl font-display font-bold text-white">128-bit</p>
            <p>TLS encryption in transit</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-white">24/7</p>
            <p>Access to your records</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-white">Role-based</p>
            <p>Access controls</p>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-forest-700/30 blur-3xl" aria-hidden="true" />
      </div>
    </div>
  );
}
