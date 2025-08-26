// pages/Game.tsx
import { useEffect, useMemo, useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import "./style/Game.css";
import Doctor from "../components/Doctor";
import QuizCard from "../components/QuizCard";
import Persona from "../components/Persona";
import Carpeta from "../components/Carpeta";
import Conversacion from "../components/Conversacion";
import RAW from "./datos.json";

// ---------------- Tipos base ----------------
type CasoN1a4 = {
  preguntas: {
    introduccion: string;
    "1": string;
    "2": string;
    "3": string;
    "4": string;
    correcta: number; // 1..4
  };
  sintomas?: string[];
  dialogos?: string[]; // pares doctor, impares paciente
  retroalimentacion?: { acierto?: string; fallo?: string };
};
type Nivel1a4 = {
  contexto?: string;
  casos: Record<string, CasoN1a4>;
  resumen?: {
    puntos_totales?: number;
    powerups?: string[];
    logros?: string[];
    proximo_nivel?: string;
    titulo?: string;
  };
};

type CasoN5 = {
  id: number;
  titulo: string;
  presentacion: { personaje: string; dialogo: string };
  sintomas?: string[];
  opciones: { a: string; b: string; c: string; d: string };
  respuesta_correcta: "a" | "b" | "c" | "d";
  dialogos?: string[];
  retroalimentacion?: { acierto?: string; fallo?: string };
};
type Nivel5Loose = {
  nivel: number; // 5
  contexto?: string;
  intro_dialogo?: { personaje: string; dialogo: string };
  casos: CasoN5[];
  resumen?: {
    logros?: string[];
    proximo_nivel?: string;
    titulo?: string;
  };
};

// Pregunta aplanada
type FlatQ = {
  id: string;
  question: string;
  answers: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  sintomas: string[];
  dialogos: string[];
  retroalimentacion?: { acierto?: string; fallo?: string };
};

// ---------------- Utils ----------------
const pickN = <T,>(arr: T[], n: number): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.max(0, Math.min(n, a.length)));
};

const ensureDialogos = (
  fallbackIntro: string,
  sintomas: string[],
  existing?: string[]
): string[] => {
  if (existing && existing.length > 0) return existing;
  const doc = `Dra. Jessica: ${
    fallbackIntro || "Por favor, valoremos rápidamente al paciente."
  }`;
  const pac = `Paciente: ${
    sintomas.length
      ? `Me preocupa ${sintomas[0].toLowerCase()}`
      : "No me siento bien, doctora."
  }`;
  const doc2 = `Dra. Jessica: Haremos unas preguntas rápidas y decidiremos el manejo.`;
  return [doc, pac, doc2];
};

// ---------------- Adaptadores por nivel ----------------
const flattenNivel1a4 = (nivelKey: string, nivel: Nivel1a4): FlatQ[] => {
  const out: FlatQ[] = [];
  const ids = Object.keys(nivel.casos || {}).sort(
    (a, b) => Number(a) - Number(b)
  );
  const elegidos = pickN(ids, 2); // 2 casos por nivel
  elegidos.forEach((casoId) => {
    const caso = nivel.casos[casoId];
    if (!caso?.preguntas) return;
    const p = caso.preguntas;
    const answers = [
      String(p["1"] ?? ""),
      String(p["2"] ?? ""),
      String(p["3"] ?? ""),
      String(p["4"] ?? ""),
    ] as [string, string, string, string];
    const correctIndex = Math.max(
      0,
      Math.min(3, (Number(p.correcta) || 1) - 1)
    ) as 0 | 1 | 2 | 3;
    const sintomas = caso.sintomas ?? [];
    const question =
      p.introduccion ||
      `Paciente con ${
        sintomas.slice(0, 2).join(", ") || "cuadro compatible"
      }. ¿Cuál es la mejor opción?`;
    const dialogos = ensureDialogos(p.introduccion, sintomas, caso.dialogos);
    out.push({
      id: `${nivelKey.replace("nivel_", "")}:${casoId}`,
      question,
      answers,
      correctIndex,
      sintomas,
      dialogos,
      retroalimentacion: caso.retroalimentacion,
    });
  });
  return out;
};

const flattenNivel5 = (n5: Nivel5Loose): FlatQ[] => {
  const out: FlatQ[] = [];
  const letterToIndex: Record<"a" | "b" | "c" | "d", 0 | 1 | 2 | 3> = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
  };
  const elegidos = pickN(n5.casos || [], 2);
  elegidos.forEach((caso) => {
    const answers = [
      caso.opciones.a,
      caso.opciones.b,
      caso.opciones.c,
      caso.opciones.d,
    ] as [string, string, string, string];
    const correctIndex = letterToIndex[caso.respuesta_correcta];
    const sintomas = caso.sintomas ?? [];
    const intro =
      caso.presentacion?.dialogo ||
      `Paciente con ${sintomas.slice(0, 2).join(", ") || "cuadro complejo"}.`;
    const question = `${intro}\n¿Cuál es la mejor explicación/acción?`;
    const dialogos = ensureDialogos(intro, sintomas, caso.dialogos);
    out.push({
      id: `5:${caso.id}`,
      question,
      answers,
      correctIndex,
      sintomas,
      dialogos,
      retroalimentacion: caso.retroalimentacion,
    });
  });
  return out;
};

type PlayLevel = {
  key: string;
  contexto?: string;
  questions: FlatQ[];
  resumen?: Nivel1a4["resumen"] | Nivel5Loose["resumen"];
};

const buildLevels = (raw: any): PlayLevel[] => {
  const levels: PlayLevel[] = [];
  ["nivel_1", "nivel_2", "nivel_3", "nivel_4"].forEach((k) => {
    if (raw[k]) {
      const nivel = raw[k] as Nivel1a4;
      levels.push({
        key: k.replace("nivel_", ""),
        contexto: nivel.contexto,
        questions: flattenNivel1a4(k, nivel),
        resumen: nivel.resumen,
      });
    }
  });
  const n5 = raw?.nivel === 5 ? (raw as Nivel5Loose) : undefined;
  if (n5) {
    levels.push({
      key: "5",
      contexto: n5.contexto,
      questions: flattenNivel5(n5),
      resumen: n5.resumen,
    });
  }
  return levels;
};

// ---------------- UI: Corazón pixelado + Modales ----------------
const HeartPixel = memo(
  ({ size = 20, empty = false }: { size?: number; empty?: boolean }) => {
    const pixels: Array<[number, number]> = [
      [1, 1],
      [2, 1],
      [5, 1],
      [6, 1],
      [0, 2],
      [3, 2],
      [4, 2],
      [7, 2],
      [0, 3],
      [1, 3],
      [2, 3],
      [3, 3],
      [4, 3],
      [5, 3],
      [6, 3],
      [7, 3],
      [1, 4],
      [2, 4],
      [3, 4],
      [4, 4],
      [5, 4],
      [6, 4],
      [2, 5],
      [3, 5],
      [4, 5],
      [5, 5],
      [3, 6],
      [4, 6],
    ];
    return (
      <svg
        width={size}
        height={(size * 7) / 8}
        viewBox="0 0 8 7"
        shapeRendering="crispEdges"
      >
        {pixels.map(([x, y], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="1"
            height="1"
            fill={empty ? "#e5e7eb" : "#ef4444"}
          />
        ))}
      </svg>
    );
  }
);

function CenterModal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative mx-4 max-w-lg w-full rounded-2xl px-6 py-6 bg-white border border-gray-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ---------------- Estados del flujo ----------------
type Phase = "levelContext" | "conversation" | "quiz" | "levelComplete";

export default function Game() {
  const navigate = useNavigate();
  const LEVELS = useMemo(() => buildLevels(RAW), []);
  const [levelIdx, setLevelIdx] = useState(0);
  const [caseIdx, setCaseIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("levelContext");
  // Jugador
  const [name, setName] = useState("chapatin");
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);
  // Datos de la pregunta actual
  const currentLevel = LEVELS[levelIdx];
  const currentQ = currentLevel?.questions[caseIdx];
  const [notas, setNotas] = useState<string[]>(currentQ?.sintomas ?? []);
  // Toast (para correctas)
  const [toast, setToast] = useState<{
    show: boolean;
    kind: "ok" | "error";
    text: string;
  }>({ show: false, kind: "ok", text: "" });
  // Modal de retroalimentación para incorrectas
  const [retroModal, setRetroModal] = useState<{
    show: boolean;
    text: string;
    nextType: "case" | "levelComplete";
    newLives: number;
  } | null>(null);

  // Cargar nombre y estado inicial
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
    localStorage.setItem(
      "game-state",
      JSON.stringify({
        points: 0,
        lives: 3,
        levelIdx: 0,
        caseIdx: 0,
        startedAt: Date.now(),
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar notas y estado cuando cambia caso o nivel
  useEffect(() => {
    setNotas(currentQ?.sintomas ?? []);
    const raw = localStorage.getItem("game-state");
    const prev = raw ? JSON.parse(raw) : {};
    localStorage.setItem(
      "game-state",
      JSON.stringify({
        ...prev,
        points,
        lives,
        levelIdx,
        caseIdx,
      })
    );
  }, [caseIdx, levelIdx]);

  // Si vidas se acaban -> gameover
  useEffect(() => {
    if (lives <= 0) {
      const t = setTimeout(() => navigate("/gameover"), 600);
      return () => clearTimeout(t);
    }
  }, [lives, navigate]);

  // Avanzar fase
  const nextPhase = () => {
    if (phase === "levelContext") setPhase("conversation");
    else if (phase === "conversation") setPhase("quiz");
  };

  // Fin de conversación
  const handleConversationFinish = (done: boolean) => {
    if (done) setPhase("quiz");
  };

  // Manejar respuesta
  const handleAnswer = (ok: boolean) => {
    if (!currentQ || lives <= 0) return;

    if (ok) {
      const retroText = currentQ.retroalimentacion?.acierto || "¡Correcto!";
      setToast({ show: true, kind: "ok", text: retroText });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 1200);

      setPoints((p) => p + 100);
      setNotas((n) => [...n, "respuesta correcta"]);

      // Avance inmediato
      if (caseIdx + 1 < currentLevel.questions.length) {
        setCaseIdx(caseIdx + 1);
        setPhase("conversation");
      } else {
        setPhase("levelComplete");
      }
      return;
    }

    // Incorrecta: mostrar modal con retroalimentación y avanzar solo al cerrar
    const newLives = Math.max(0, lives - 1);
    const nextType: "case" | "levelComplete" =
      caseIdx + 1 < currentLevel.questions.length ? "case" : "levelComplete";
    const retroText =
      currentQ.retroalimentacion?.fallo ||
      "Respuesta incorrecta. Revisa los principios fisiológicos del caso.";

    setRetroModal({
      show: true,
      text: retroText,
      nextType,
      newLives,
    });
  };

  // Cerrar modal de retroalimentación (aplica efectos diferidos)
  const closeRetro = () => {
    if (!retroModal) return;
    setRetroModal(null);
    setNotas((n) => [...n, "respuesta incorrecta"]);
    setLives(retroModal.newLives);

    if (retroModal.newLives > 0) {
      if (retroModal.nextType === "case") {
        setCaseIdx((i) => i + 1);
        setPhase("conversation");
      } else {
        setPhase("levelComplete");
      }
    }
    // Si newLives es 0, el useEffect de vidas navegará a /gameover
  };

  // Continuar después del nivel
  const continueAfterLevel = () => {
    if (levelIdx + 1 >= LEVELS.length) {
      navigate("/gameover");
      return;
    }
    setLevelIdx(levelIdx + 1);
    setCaseIdx(0);
    setPhase("levelContext");
  };

  // Data para QuizCard
  const quizData = useMemo(() => {
    if (!currentQ) {
      return {
        question: "Cargando...",
        answers: ["", "", "", ""] as [string, string, string, string],
        correctIndex: 0 as 0 | 1 | 2 | 3,
      };
    }
    return {
      question: currentQ.question,
      answers: currentQ.answers,
      correctIndex: currentQ.correctIndex,
    };
  }, [currentQ]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row">
      {/* Izquierda: perfil */}
      <div className="w-full md:w-1/5 flex flex-col items-center gap-2 p-4 bg-gray-50">
        {/* Bloque Doctor + stats + corazones */}
        <div className="flex w-full items-center justify-between md:flex-col md:items-center md:justify-start md:gap-2">
          <div className="flex flex-col items-center">
            <Doctor size={160} className="md:size-[200px]" />
            <p className="text-lg font-semibold text-gray-700">{name}</p>
            <div className="flex items-center gap-2 mt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <HeartPixel key={i} size={22} empty={i >= lives} />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">Puntos: {points}</p>
          </div>

          {/* Persona: en móvil queda a la derecha, en desktop debajo */}
          <div className="md:mt-2">
            <Persona key={`persona-${levelIdx}-${caseIdx}`} />
          </div>
        </div>
      </div>

      {/* Derecha: contenido */}
      <div className="w-full md:flex-1 bg-white p-4 relative overflow-hidden">
        {/* Contexto del nivel */}
        {phase === "levelContext" && currentLevel?.contexto && (
          <CenterModal onClose={nextPhase}>
            <h2 className="text-2xl font-bold text-gray-800">
              Nivel {currentLevel.key}
            </h2>
            <p className="mt-4 text-base text-gray-700 whitespace-pre-line">
              {currentLevel.contexto}
            </p>
            <button
              className="mt-6 px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700"
              onClick={nextPhase}
            >
              Comenzar
            </button>
          </CenterModal>
        )}

        {/* Conversación */}
        {phase === "conversation" && currentQ && (
          <Conversacion
            dialogos={currentQ.dialogos}
            onFinish={(done) => handleConversationFinish(done)}
          />
        )}

        {/* Quiz */}
        {phase === "quiz" && currentQ && (
          <div>
            <QuizCard
              question={quizData.question}
              answers={quizData.answers}
              correctIndex={quizData.correctIndex}
              onAnswer={handleAnswer}
            />
            <div className="flex justify-end mt-4">
              <Carpeta
                label={`Expediente del paciente (${currentQ.id})`}
                notes={notas}
              />
            </div>
          </div>
        )}

        {/* Nivel completado */}
        {phase === "levelComplete" && (
          <CenterModal onClose={continueAfterLevel}>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Nivel {currentLevel?.key} completado
            </h2>
            {currentLevel?.resumen?.logros &&
              currentLevel.resumen.logros.length > 0 && (
                <p className="text-base text-gray-700">
                  Logros obtenidos: {currentLevel.resumen.logros.join(", ")}
                </p>
              )}
            {currentLevel?.resumen?.proximo_nivel && (
              <p className="mt-1 text-base text-gray-700">
                Próximo nivel: {currentLevel.resumen.proximo_nivel}
              </p>
            )}
            <button
              className="mt-6 px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700"
              onClick={continueAfterLevel}
            >
              Continuar
            </button>
          </CenterModal>
        )}

        {/* Toast feedback (para correctas) */}
        {toast.show && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setToast((t) => ({ ...t, show: false }))}
          >
            <div className="absolute inset-0 bg-black/30" />
            <div
              className={`relative mx-4 max-w-md w-full rounded-2xl px-6 py-5 text-center shadow-2xl border ${
                toast.kind === "ok"
                  ? "bg-green-50 text-green-900 border-green-300"
                  : "bg-rose-50 text-rose-900 border-rose-300"
              }`}
              role="status"
              aria-live="polite"
            >
              <p className="text-xl font-bold">{toast.text}</p>
              <p className="text-sm mt-1 opacity-80">Toca para continuar</p>
            </div>
          </div>
        )}

        {/* Modal de retroalimentación para incorrectas */}
        {retroModal?.show && (
          <CenterModal onClose={closeRetro}>
            <h3 className="text-xl font-bold text-rose-700">
              Retroalimentación
            </h3>
            <p className="mt-3 text-base text-gray-800 whitespace-pre-line">
              {retroModal.text}
            </p>
            <div className="mt-5 flex justify-end">
              <button
                className="px-5 py-2 rounded-lg bg-rose-600 text-white font-semibold shadow hover:bg-rose-700"
                onClick={closeRetro}
              >
                Continuar
              </button>
            </div>
          </CenterModal>
        )}
      </div>
    </div>
  );
}
