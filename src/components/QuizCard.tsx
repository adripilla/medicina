import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * QuizCard — Componente tipo juego para una sola pregunta.
 *
 * Props:
 *  - question: string                     → Texto de la pregunta
 *  - answers: string[4]                   → Cuatro opciones de respuesta
 *  - correctIndex: 0 | 1 | 2 | 3          → Índice de la respuesta correcta según el array original
 *  - onAnswer?: (isCorrect: boolean)      → Callback al elegir una opción
 *  - shuffle?: boolean                    → Barajar opciones (default: true)
 */

export type QuizCardProps = {
  question: string;
  answers: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  onAnswer?: (isCorrect: boolean) => void;
  shuffle?: boolean;
};

const letters = ["A", "B", "C", "D"] as const;

function shuffleArray<T>(arr: readonly T[]): T[] {
  const a = arr.slice() as T[];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizCard({
  question,
  answers,
  correctIndex,
  onAnswer,
  shuffle = true,
}: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  // Mezcla estable por pregunta
  const { displayAnswers, correctShuffledIndex, mappingKey } = useMemo(() => {
    const indices = [0, 1, 2, 3] as const;
    const base = [...indices]; // copia mutable
    const order = shuffle ? shuffleArray(base) : base;
    const disp = order.map((i) => answers[i]);
    const correctIdx = order.indexOf(correctIndex);
    return {
      displayAnswers: disp,
      correctShuffledIndex: correctIdx,
      mappingKey: `${question}|${answers.join("|")}|${correctIndex}|${order.join(",")}`,
    };
  }, [question, answers, correctIndex, shuffle]);

  // Reset selección cuando cambie la pregunta/opciones
  useEffect(() => {
    setSelected(null);
  }, [mappingKey]);

  const isLocked = selected !== null;

  const handlePick = (idx: number) => {
    if (isLocked) return;
    setSelected(idx);
    const ok = idx === correctShuffledIndex;
    onAnswer?.(ok);
  };

  const status = selected === null
    ? null
    : selected === correctShuffledIndex
      ? { text: "¡Correcto!", ok: true }
      : { text: `Incorrecto. Respuesta: ${displayAnswers[correctShuffledIndex]}` , ok: false };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 md:p-8 shadow-xl bg-gradient-to-b from-slate-900/70 to-slate-800/70 backdrop-blur text-white border border-white/10"
      >
        <div className="mb-4 text-xs uppercase tracking-widest text-white/70">Pregunta</div>
        <h2 className="text-lg md:text-xl font-semibold mb-6 leading-snug">{question}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayAnswers.map((ans, i) => {
            const picked = selected === i;
            const isCorrect = i === correctShuffledIndex;
            const showAsCorrect = isLocked && isCorrect;
            const showAsWrong = isLocked && picked && !isCorrect;

            return (
              <motion.button
                key={`${i}-${ans}`}
                whileTap={{ scale: isLocked ? 1 : 0.98 }}
                onClick={() => handlePick(i)}
                className={[
                  "group relative w-full text-left rounded-xl p-4 border transition",
                  "focus:outline-none focus:ring-2 focus:ring-offset-0",
                  isLocked
                    ? showAsCorrect
                      ? "border-emerald-400/60 bg-emerald-500/10"
                      : showAsWrong
                        ? "border-rose-400/60 bg-rose-500/10"
                        : "border-white/10 bg-white/5 opacity-70"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                ].join(" ")}
                disabled={isLocked}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15 text-sm font-semibold">
                    {letters[i]}
                  </span>
                  <span className="text-sm md:text-base leading-snug pr-6">{ans}</span>
                </div>

                {/* Indicador */}
                <AnimatePresence>
                  {showAsCorrect && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute right-3 top-3 text-emerald-300"
                      aria-hidden
                    >
                      ✅
                    </motion.span>
                  )}
                  {showAsWrong && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute right-3 top-3 text-rose-300"
                      aria-hidden
                    >
                      ❌
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Estado */}
        <div className="min-h-8 mt-5">
          <AnimatePresence mode="wait">
            {status && (
              <motion.div
                key={status.text}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={[
                  "text-sm font-medium",
                  status.ok ? "text-emerald-300" : "text-rose-300",
                ].join(" ")}
              >
                {status.text}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hint de accesibilidad */}
        <p className="mt-2 text-[11px] text-white/50">Selecciona una opción. Una vez respondida, se revela la correcta.</p>
      </motion.div>
    </div>
  );
}