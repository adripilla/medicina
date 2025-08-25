// pages/Game.tsx
import { useEffect, useMemo, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import "./style/Game.css";
import Doctor from "../components/Doctor";
import QuizCard from "../components/QuizCard";
import Persona from "../components/Persona";
import Carpeta from "../components/Carpeta";
import BANK from "./datos.json";

// Tipos
type PreguntaItem = {
  preguntas: {
    introduccion: string;
    "1": string;
    "2": string;
    "3": string;
    "4": string;
    correcta: number; // 1..4
  };
  sintomas: string[];
};
type Bank = Record<string, PreguntaItem>;

// Corazón pixelado
const HeartPixel = memo(
  ({ size = 20, empty = false }: { size?: number; empty?: boolean }) => {
    const pixels: Array<[number, number]> = [
      [1, 1],[2, 1],[5, 1],[6, 1],
      [0, 2],[3, 2],[4, 2],[7, 2],
      [0, 3],[1, 3],[2, 3],[3, 3],[4, 3],[5, 3],[6, 3],[7, 3],
      [1, 4],[2, 4],[3, 4],[4, 4],[5, 4],[6, 4],
      [2, 5],[3, 5],[4, 5],[5, 5],
      [3, 6],[4, 6],
    ];
    return (
      <svg width={size} height={size * (7 / 8)} viewBox="0 0 8 7" shapeRendering="crispEdges">
        {pixels.map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="1" height="1" fill={empty ? "#e5e7eb" : "#ef4444"} />
        ))}
      </svg>
    );
  }
);

// Toast centrado y grande
type ToastKind = "ok" | "error";
function Toast({ kind, text }: { kind: ToastKind; text: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />
      <div
        className={`relative mx-4 max-w-md w-full rounded-2xl px-6 py-5 text-center shadow-2xl border
        ${kind === "ok"
          ? "bg-green-50 text-green-900 border-green-300"
          : "bg-rose-50 text-rose-900 border-rose-300"}`}
        role="status"
        aria-live="polite"
      >
        <p className="text-xl font-bold">{text}</p>
        <p className="text-sm mt-1 opacity-80">toca para continuar</p>
      </div>
    </div>
  );
}

const randomFrom = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomExcept = (min: number, max: number, except: number) => {
  if (max - min <= 0) return except;
  let n = except;
  while (n === except) n = randomFrom(min, max);
  return n;
};

export default function Game() {
  const navigate = useNavigate();
  const bank = BANK as Bank;

  const [name, setName] = useState("chapatin");
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);
  const [notas, setNotas] = useState<string[]>([]);
  const [qid, setQid] = useState<number>(1);

  // toast state
  const [showToast, setShowToast] = useState(false);
  const [toastKind, setToastKind] = useState<ToastKind>("ok");
  const [toastText, setToastText] = useState("");

  // Inicializar juego
  useEffect(() => {
    try {
      const raw = localStorage.getItem("avatar-settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name) setName(parsed.name);
      }
    } catch {}
    setPoints(0);
    setLives(3);

    const first = randomFrom(1, 50);
    setQid(first);

    localStorage.setItem(
      "game-state",
      JSON.stringify({ points: 0, lives: 3, qid: first, startedAt: Date.now() })
    );
  }, []);

  const current = useMemo(() => bank[String(qid)], [bank, qid]);

  useEffect(() => {
    if (current?.sintomas) setNotas(current.sintomas);
    else setNotas([]);

    const raw = localStorage.getItem("game-state");
    const prev = raw ? JSON.parse(raw) : {};
    localStorage.setItem("game-state", JSON.stringify({ ...prev, qid, points, lives }));
  }, [qid]);

  // Si las vidas llegan a 0, ir a /gameover
  useEffect(() => {
    if (lives <= 0) {
      const t = setTimeout(() => navigate("/gameover"), 600);
      return () => clearTimeout(t);
    }
  }, [lives, navigate]);

  // Handler de respuestas
  const handleAnswer = (ok: boolean) => {
    if (lives <= 0) return;

    // Mostrar toast
    setToastKind(ok ? "ok" : "error");
    setToastText(ok ? "¡Correcto!" : "Incorrecto");
    setShowToast(true);

    // Ocultar al click/tap o a los 1.2s
    const auto = setTimeout(() => setShowToast(false), 1200);
    const onClick = () => {
      setShowToast(false);
      window.removeEventListener("click", onClick, { capture: true } as any);
      clearTimeout(auto);
    };
    window.addEventListener("click", onClick, { capture: true });

    if (ok) {
      setPoints((p) => p + 100);
      setNotas((prev) => [...prev, "respuesta correcta"]);
      const next = randomExcept(1, 50, qid);
      setQid(next); // provoca remontaje de Persona (clave depende de qid)
    } else {
      setLives((l) => {
        const newLives = Math.max(0, l - 1);
        if (newLives > 0) {
          const next = randomExcept(1, 50, qid);
          setQid(next);
        }
        return newLives;
      });
      setNotas((prev) => [...prev, "respuesta incorrecta"]);
    }
  };

  // Preparar datos para QuizCard
  const quizData = useMemo(() => {
    if (!current?.preguntas) {
      return {
        question: "Cargando...",
        answers: ["", "", "", ""] as [string, string, string, string],
        correctIndex: 0 as 0 | 1 | 2 | 3,
      };
    }

    const p = current.preguntas;
    const answers = [
      String(p["1"] ?? ""),
      String(p["2"] ?? ""),
      String(p["3"] ?? ""),
      String(p["4"] ?? ""),
    ] as [string, string, string, string];

    const tmp = (Number(p.correcta) || 1) - 1;
    const clamped = Math.max(0, Math.min(3, tmp));
    const correctIndex = clamped as 0 | 1 | 2 | 3;

    return {
      question: String(p.introduccion ?? "Pregunta"),
      answers,
      correctIndex,
    };
  }, [current]);

  return (
    <div className="h-full w-full flex">
      {showToast && <Toast kind={toastKind} text={toastText} />}

      {/* Columna izquierda */}
      <div className="h-full w-1/5 flex flex-col items-center gap-2 p-4 bg-gray-50">
        <Doctor size={200} />
        <p className="text-lg font-semibold text-gray-700">{name}</p>

        {/* Corazones pixelados */}
        <div className="flex items-center gap-2 mt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <HeartPixel key={i} size={22} empty={i >= lives} />
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-2">Puntos: {points}</p>
        {/* Remontar Persona para que sea diferente por pregunta */}
        <Persona key={`persona-${qid}`} />
      </div>

      {/* Contenedor derecho */}
      <div className="game-container flex-1 bg-white">
        <QuizCard
          question={quizData.question}
          answers={quizData.answers}
          correctIndex={quizData.correctIndex}
          onAnswer={handleAnswer}
        />

        <div className="flex justify-end mt-4 pr-4">
          <Carpeta label={`Expediente del paciente #${qid}`} notes={notas} />
        </div>
      </div>
    </div>
  );
}
