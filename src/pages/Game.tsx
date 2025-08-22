// pages/Game.tsx
import { useEffect, useState, memo } from "react";
import "./style/Game.css";
import Doctor from "../components/Doctor";

// Corazón pixelado (8x7 “pixeles”)
const HeartPixel = memo(({ size = 20 }: { size?: number }) => {
  // Coordenadas (x,y) de cada “pixel” del corazón
  const pixels: Array<[number, number]> = [
    [1,1],[2,1],[5,1],[6,1],
    [0,2],[3,2],[4,2],[7,2],
    [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],
    [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
    [2,5],[3,5],[4,5],[5,5],
    [3,6],[4,6],
  ];
  const scale = size / 8; // ancho base = 8 “pixeles”
  return (
    <svg
      width={size}
      height={(7 * scale)}
      viewBox="0 0 8 7"
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
      aria-label="corazón"
    >
      {/* borde oscuro opcional para look retro */}
      {pixels.map(([x, y], i) => (
        <rect key={`b-${i}`} x={x} y={y} width="1" height="1" fill="#7f1d1d" />
      ))}
      {/* relleno */}
      {pixels.map(([x, y], i) => (
        <rect key={i} x={x+0.1} y={y+0.1} width="0.8" height="0.8" fill="#ef4444" />
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
    // Inicializa estado del juego
    setPoints(0);
    setLives(3);

    // (Opcional) Persistir estado inicial del juego
    localStorage.setItem(
      "game-state",
      JSON.stringify({ points: 0, lives: 3, startedAt: Date.now() })
    );
  }, []);

  return (
    <div className="h-full w-full flex">
      {/* Columna izquierda */}
      <div className="h-full w-1/5 flex flex-col items-center gap-2 p-4 bg-gray-50">
        <Doctor size={200} />
        <p className="text-lg font-semibold text-gray-700">{name}</p>

        {/* Corazones pixelados */}
        <div className="flex items-center gap-2 mt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <HeartPixel key={i} size={22} />
          ))}
        </div>

       
         <p className="text-sm text-gray-500 mt-2">Puntos: {points}</p> 
      </div>

      {/* Contenedor derecho / menú / juego */}
      <div className="menu-container flex-1 bg-white">
        {/* Tu contenido de juego va aquí */}
      </div>
    </div>
  );
}
