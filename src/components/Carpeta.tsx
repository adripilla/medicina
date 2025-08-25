// components/Carpeta.tsx
import { useEffect, useState } from "react";

type CarpetaProps = {
  label?: string;          // Texto bajo el ícono (opcional)
  notes: string[];         // Array de notas a mostrar en el modal
  className?: string;      // Clases extra para el botón/ícono
};

export default function Carpeta({ label = "Carpeta", notes, className = "" }: CarpetaProps) {
  const [open, setOpen] = useState(false);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Botón / ícono de carpeta */}
      <button
        onClick={() => setOpen(true)}
        className={[
          "group flex flex-col items-center gap-2 p-3 rounded-xl border",
          "bg-white hover:bg-slate-50 border-slate-200 shadow-sm",
          "transition active:scale-[0.98]",
          className,
        ].join(" ")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {/* Ícono de carpeta en SVG (sin dependencias) */}
        <svg
          width="56"
          height="44"
          viewBox="0 0 56 44"
          className="drop-shadow-sm"
          aria-hidden
        >
          <path d="M4 10h16l4 4h28v22a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V10z" fill="#fbbf24"/>
          <path d="M4 10a6 6 0 0 1 6-6h10l4 4h16a6 6 0 0 1 6 6v2H4v-6z" fill="#f59e0b"/>
          <rect x="4" y="18" width="48" height="3" fill="#f59e0b" opacity=".7"/>
        </svg>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)} // click en backdrop cierra
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          {/* Contenido */}
          <div
            className="absolute inset-x-0 top-16 mx-auto w-[min(680px,92vw)]"
            onClick={(e) => e.stopPropagation()} // evitar cerrar al clickear dentro
          >
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800">Notas</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 hover:bg-slate-100 active:scale-95"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  ✖
                </button>
              </div>

              <div className="p-5">
                {notes.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay notas.</p>
                ) : (
                  <pre className="text-sm leading-6 text-slate-800 whitespace-pre-wrap">
{notes.map(n => `.${n}`).join('\n')}
                  </pre>
                )}
              </div>

              <div className="px-5 py-3 border-t border-slate-200 flex justify-end">
                <button
                  className="rounded-lg px-4 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800 active:scale-95"
                  onClick={() => setOpen(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
