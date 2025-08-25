// pages/GameOver.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type GameState = {
  points?: number;
  lives?: number;
  qid?: number;
  startedAt?: number;
};

function formatDuration(ms: number) {
  if (!ms || ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function GameOver() {
  const navigate = useNavigate();
  const [best, setBest] = useState<number>(0);

  // Cargar estado del juego
  const { points, startedAt } = useMemo(() => {
    try {
      const raw = localStorage.getItem("game-state");
      const gs: GameState = raw ? JSON.parse(raw) : {};
      return {
        points: Number(gs.points ?? 0),
        startedAt: Number(gs.startedAt ?? Date.now()),
      };
    } catch {
      return { points: 0, startedAt: Date.now() };
    }
  }, []);

  // Guardar / cargar best score
  useEffect(() => {
    try {
      const prev = Number(localStorage.getItem("best-score") ?? 0);
      const next = Math.max(prev, points || 0);
      localStorage.setItem("best-score", String(next));
      setBest(next);
    } catch {}
  }, [points]);

  // Atajos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") navigate("/game");
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const duration = useMemo(() => formatDuration(Date.now() - (startedAt || Date.now())), [startedAt]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Fin del Juego <span className="inline-block">🎉</span>
        </h1>

        <p className="mt-2 text-gray-500">¡Buen intento! Aquí están tus resultados.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="text-xs uppercase tracking-wider text-gray-500">Puntos</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{points ?? 0}</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="text-xs uppercase tracking-wider text-gray-500">Mejor puntaje</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{best}</div>
          </div>
          <div className="rounded-xl border bg-gray-50 p-4">
            <div className="text-xs uppercase tracking-wider text-gray-500">Tiempo</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{duration}</div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/game")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 active:scale-[.98] transition"
          >
            Reintentar
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border font-semibold text-gray-700 hover:bg-gray-50 shadow-sm active:scale-[.98] transition"
          >
            Volver al Menú
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Atajos: <span className="font-semibold">Enter</span> para reintentar, <span className="font-semibold">Esc</span> para menú.
        </p>
      </div>
    </div>
  );
}
