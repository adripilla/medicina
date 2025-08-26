import { useState, useEffect } from "react";

// Props para el componente Conversacion.
// - dialogos: array de strings, alternando doctor/paciente.
// - onFinish: callback opcional invocado cuando termina, recibe true si terminó.
// - className: clases CSS adicionales opcionales.
interface ConversacionProps {
  dialogos: string[];
  onFinish?: (done: boolean) => void;
  className?: string;
}

// Determina si el índice es doctor (par) o paciente (impar)
const isDoctor = (index: number) => index % 2 === 0;

/**
 * Conversacion muestra un diálogo entre doctor y paciente.
 * Cada clic avanza al siguiente mensaje. Al terminar, llama onFinish(true).
 */
export default function Conversacion({
  dialogos,
  onFinish,
  className = "",
}: ConversacionProps) {
  const [current, setCurrent] = useState(0);

  // Reinicia el índice al recibir nuevos diálogos
  useEffect(() => {
    setCurrent(0);
  }, [dialogos]);

  // Maneja el clic para avanzar
  const handleClick = () => {
    if (current < dialogos.length - 1) {
      setCurrent(current + 1);
      onFinish?.(false);
    } else {
      onFinish?.(true);
    }
  };

  const message = dialogos[current] || "";
  const speakerIsDoctor = isDoctor(current);

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div
        className={`max-w-md px-4 py-3 rounded-2xl shadow-md text-base ${
          speakerIsDoctor
            ? "bg-white text-gray-800 self-start"
            : "bg-blue-600 text-white self-end"
        }`}
      >
        {message}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        {current + 1} / {dialogos.length} — Click para continuar
      </p>
    </div>
  );
}
