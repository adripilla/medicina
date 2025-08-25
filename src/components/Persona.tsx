// components/Persona.tsx
import { useMemo } from "react";


const pacientes = [
  "paciente/IMG_5057.JPG",
  "paciente/IMG_5058.JPG",
  "paciente/IMG_5059.JPG",
  "paciente/IMG_5060.JPG",
  "paciente/IMG_5061.JPG",
  "paciente/IMG_5062.JPG",
  "paciente/IMG_5063.JPG",
  "paciente/IMG_5064.JPG",
  "paciente/IMG_5065.JPG",
  "paciente/IMG_5066.JPG",
  "paciente/IMG_5067.JPG",
  "paciente/IMG_5068.JPG",
  "paciente/IMG_5069.JPG",
  "paciente/IMG_5070.JPG",
  "paciente/IMG_5071.JPG",
  "paciente/IMG_5072.JPG",
  "paciente/IMG_5073.JPG",
  "paciente/IMG_5074.JPG",
  "paciente/IMG_5075.JPG",
  "paciente/IMG_5076.JPG",
  "paciente/IMG_5077.JPG",
  "paciente/IMG_5078.JPG",
  "paciente/IMG_5079.JPG",
  "paciente/IMG_5080.JPG",
  "paciente/IMG_5081.JPG",
  "paciente/IMG_5082.JPG",
  "paciente/IMG_5083.JPG",
  "paciente/IMG_5084.JPG",
  "paciente/IMG_5085.JPG",
  "paciente/IMG_5086.JPG",
  "paciente/IMG_5087.JPG",
  "paciente/IMG_5088.JPG",
  "paciente/IMG_5089.JPG",
  "paciente/IMG_5090.JPG",
  "paciente/IMG_5091.JPG",
  "paciente/IMG_5092.JPG",
];

export default function Persona() {
  // Escoge aleatorio al montar
  const src = useMemo(() => {
    const index = Math.floor(Math.random() * pacientes.length);
    console.log(pacientes[index]);
    
    return pacientes[index];
  }, []);

  return (
    <div className="flex flex-col items-center">
      <img src={src} alt="Paciente" className="w-full h-full object-cover rounded-xl shadow" />
    </div>
  );
}
