// pages/Game.tsx
import { useEffect, useState, memo } from "react";
import "./style/Game.css";
import Doctor from "../components/Doctor";
import QuizCard from "../components/QuizCard";
import Persona from "../components/Persona";

// Corazón pixelado (8x7 “pixeles”)
const HeartPixel = memo(({ size = 20, empty = false }: { size?: number; empty?: boolean }) => {
  const pixels: Array<[number, number]> = [
    [1,1],[2,1],[5,1],[6,1],
    [0,2],[3,2],[4,2],[7,2],
    [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],
    [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
    [2,5],[3,5],[4,5],[5,5],
    [3,6],[4,6],
  ];
  return (
    <svg width={size} height={size * (7/8)} viewBox="0 0 8 7" shapeRendering="crispEdges">
      {pixels.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="1" height="1" fill={empty ? "#e5e7eb" : "#ef4444"} />
      ))}
    </svg>
  );
});

export default function Game() {
  const [name, setName] = useState("chapatin"); // default
  const [points, setPoints] = useState(0);
  const [lives, setLives] = useState(3);

  // Al entrar a la pantalla: leer nombre guardado e iniciar juego (0 pts, 3 vidas)
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
    localStorage.setItem("game-state", JSON.stringify({ points: 0, lives: 3, startedAt: Date.now() }));
  }, []);

   const handleAnswer = (ok: boolean) => {
    if (ok) {
      setPoints((p) => p + 100);
    } else {
      setLives((l) => Math.max(0, l - 1));
    }
  };

  return (
    <div className="h-full w-full flex">
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

          <Persona/>
      </div>

      {/* Contenedor derecho / menú / juego */}
      <div className="game-container flex-1 bg-white">
         <QuizCard
        question="¿Cuál es la capital de Francia?"
        answers={["Madrid", "París", "Roma", "Berlín"]}
        correctIndex={1} // París es la correcta
        onAnswer={handleAnswer}
      />
      
      </div>

     
    </div>
  );
}
