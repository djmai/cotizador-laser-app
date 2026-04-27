import { NavLink, Outlet } from "react-router-dom";
import { Calculator, History, Layers, Settings as SettingsIcon, Zap, User } from "lucide-react";

const navItems = [
  { to: "/", label: "Cotizador", icon: Calculator, end: true, testid: "nav-cotizador" },
  { to: "/historial", label: "Historial", icon: History, testid: "nav-historial" },
  { to: "/materiales", label: "Materiales", icon: Layers, testid: "nav-materiales" },
  { to: "/configuracion", label: "Configuración", icon: SettingsIcon, testid: "nav-configuracion" },
  { to: "/autor", label: "Autor", icon: User, testid: "nav-autor" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-[#F4F4F5]">
      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className="hidden md:flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white"
      >
        <div className="px-5 py-5 border-b border-zinc-200 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF3333] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">CORTEX LÁSER</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500">
              Cost Engine v1.0
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                data-testid={item.testid}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 mb-1 text-sm transition-all duration-150 border ${
                    isActive
                      ? "bg-[#FF3333] text-white border-[#FF3333]"
                      : "text-zinc-700 border-transparent hover:border-zinc-200 hover:bg-zinc-50"
                  }`
                }
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-200">
          <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-400 mb-1">
            Status
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full" />
            <span className="font-mono text-zinc-600">SISTEMA OPERATIVO</span>
          </div>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-zinc-200">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FF3333] flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold">CORTEX LÁSER</span>
          </div>
        </div>
        <nav className="flex border-t border-zinc-200 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={`${item.testid}-mobile`}
              className={({ isActive }) =>
                `flex-1 min-w-fit text-center px-3 py-2 text-xs whitespace-nowrap ${
                  isActive
                    ? "border-b-2 border-[#FF3333] text-[#FF3333] font-semibold"
                    : "text-zinc-600 border-b-2 border-transparent"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="flex-1 md:pt-0 pt-24 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
