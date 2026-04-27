import {
  Sparkles,
  Cpu,
  Server,
  GraduationCap,
  Megaphone,
  Wrench,
  Globe,
  ExternalLink,
  HandCoins,
  Lightbulb,
  Mail,
  Award,
  Code2,
  Terminal,
} from "lucide-react";
import { Button } from "../components/ui/button";

const skills = [
  { icon: Terminal, label: "Linux & DevOps" },
  { icon: Code2, label: "Desarrollo web" },
  { icon: Server, label: "Servidores VPS" },
  { icon: Sparkles, label: "Sublimación" },
  { icon: Cpu, label: "Corte / Grabado láser" },
  { icon: Megaphone, label: "Marketing digital" },
  { icon: Wrench, label: "ERP · Dolibarr / Odoo" },
];

const links = [
  {
    label: "linktr.ee/eltresm",
    href: "https://linktr.ee/eltresm",
    primary: true,
  },
  {
    label: "linktr.ee/sublisilao",
    href: "https://linktr.ee/sublisilao",
    primary: false,
  },
];

export default function Autor() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.15em] text-zinc-500 mb-2">
          // Acerca de / Author
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Sobre el autor
        </h1>
        <p className="text-sm text-zinc-600 mt-2">
          Ficha técnica del creador y mantenedor de esta calculadora.
        </p>
      </div>

      {/* HERO CARD */}
      <div
        className="surface bracket-corner relative mb-6 overflow-hidden"
        data-testid="author-card"
      >
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
          {/* Left: avatar block */}
          <div className="bg-zinc-900 text-white p-6 md:p-8 flex flex-col justify-between min-h-[260px]">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-3">
                ID · 001
              </div>
              <div className="w-24 h-24 bg-[#FF3333] flex items-center justify-center mb-4">
                <span className="font-mono font-bold text-4xl tracking-tight">
                  MM
                </span>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400">
                Operador
              </div>
              <div className="text-base font-semibold mt-0.5">
                Miguel Martínez
              </div>
            </div>
            <div className="mt-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400">
                Status
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse" />
                <span className="text-xs font-mono">DISPONIBLE</span>
              </div>
            </div>
          </div>

          {/* Right: content */}
          <div className="p-6 md:p-8">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#FF3333] mb-2">
              // Director · SubliSilao
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
              Tecnología, sublimación y láser —{" "}
              <span className="text-[#FF3333]">en un solo taller.</span>
            </h2>
            <p className="text-sm text-zinc-700 mt-4 leading-relaxed">
              Apasionado por la tecnología, Linux, DevOps, marketing digital y la
              sublimación. También brindo asesoría en grabado y corte láser para
              talleres que están comenzando o quieren profesionalizar su flujo
              de trabajo.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {skills.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-mono text-zinc-700"
                >
                  <Icon className="w-3 h-3 text-[#FF3333]" strokeWidth={2.2} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN: Education + Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Education */}
        <section className="surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-4 h-4 text-[#FF3333]" />
            <h3 className="text-base font-semibold">Formación académica</h3>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <Award className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">
                  Maestría en Tecnologías de la Información Empresarial
                </div>
                <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-zinc-500 mt-0.5">
                  Postgrado
                </div>
              </div>
            </li>
            <li className="flex gap-3">
              <Award className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">
                  Ingeniería en Tecnologías de la Información y Comunicación
                </div>
                <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-zinc-500 mt-0.5">
                  Área · Sistemas informáticos
                </div>
              </div>
            </li>
          </ul>
        </section>

        {/* Services */}
        <section className="surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4 text-[#FF3333]" />
            <h3 className="text-base font-semibold">Servicios</h3>
          </div>
          <ul className="space-y-2.5 text-sm text-zinc-700">
            <ServiceItem>
              Implementación de ERPs (Dolibarr / Odoo)
            </ServiceItem>
            <ServiceItem>Gestión de servidores VPS</ServiceItem>
            <ServiceItem>Desarrollo web profesional</ServiceItem>
            <ServiceItem>
              Asesoría en sublimación, grabado y corte láser
            </ServiceItem>
            <ServiceItem>
              Capacitación presencial y en línea en estos temas
            </ServiceItem>
          </ul>
        </section>
      </div>

      {/* AFFILIATES BANNER */}
      <section className="surface mb-6 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] items-stretch">
          <div className="bg-[#FF3333] flex items-center justify-center p-4 md:p-6">
            <HandCoins className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <div className="p-6">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-500 mb-2">
              Programas de afiliados
            </div>
            <h3 className="text-lg font-semibold tracking-tight">
              Mercado Libre · AliExpress México · Marcas de productos
              personalizados
            </h3>
            <p className="text-sm text-zinc-700 mt-3 leading-relaxed">
              Formo parte del programa de afiliados de varias marcas del rubro
              de productos personalizados, lo que significa que gano una pequeña
              comisión por los productos que recomiendo.
            </p>

            <div className="mt-4 border-l-2 border-[#FF3333] pl-4 py-2 bg-zinc-50">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-[#FF3333]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-zinc-700 font-semibold">
                  ¿Cómo me apoyas?
                </span>
              </div>
              <p className="text-sm text-zinc-700">
                Antes de comprar algo, mándame mensaje y te comparto mi enlace
                de recomendado.{" "}
                <span className="font-semibold">¡Sin costo extra para ti!</span>{" "}
                Como agradecimiento, te doy asesoría personalizada en el tema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="surface p-6 md:p-8">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4 text-[#FF3333]" />
          <h3 className="text-base font-semibold">Contacto</h3>
        </div>
        <p className="text-sm text-zinc-600 mb-5">
          ¿Necesitas ayuda, sugerencia u opinión? Contáctame por WhatsApp o
          redes:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map((l) => (
            <Button
              key={l.href}
              asChild
              className={`rounded-sm justify-between group ${
                l.primary
                  ? "bg-[#FF3333] hover:bg-[#CC0000] text-white"
                  : "bg-zinc-900 hover:bg-zinc-800 text-white"
              }`}
              data-testid={`author-link-${l.label}`}
            >
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="font-mono">{l.label}</span>
                </span>
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </Button>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-zinc-200 text-center">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
            ¡Gracias por tu apoyo!
          </div>
        </div>
      </section>

      {/* Footer signature */}
      <div className="mt-8 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 border-t border-zinc-200 pt-4">
        <span>Cortex Láser · Cost Engine v1.0</span>
        <span>Designed & built by Miguel Martínez</span>
      </div>
    </div>
  );
}

function ServiceItem({ children }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="w-1 h-1 bg-[#FF3333] mt-2 shrink-0" />
      <span>{children}</span>
    </li>
  );
}
