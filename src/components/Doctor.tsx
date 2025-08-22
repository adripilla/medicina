import { useEffect, useMemo, useState } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

// --- Debe coincidir con el configurador ---
const STORAGE_KEY = "avatar-settings";

// Fallbacks mínimos (por si no hay nada guardado)
const FALLBACK = {
  top: "bigHair",
  hairColor: "#000000",
  facialHair: "blank",
  facialHairColor: "#2c1b18",
  skinColor: "#F9D3B4",
  accessories: "blank",
  eyes: "default",
  mouth: "smile",
};

// Clasificadores (mismas reglas que tu configurador)
const isHatLike = (top: string) => /hat|turban|hijab/i.test(top);
const HAIR_ONLY = new Set([
  "bigHair","bob","bun","curly","curvy","dreads","dreads01","dreads02","frida",
  "frizzle","fro","froBand","longButNotTooLong","miaWallace","shaggy","shaggyMullet",
  "shavedSides","shortCurly","shortFlat","shortRound","shortWaved","sides",
  "straight01","straight02","straightAndStrand","theCaesar","theCaesarAndSidePart"
]);
const isHairLike = (top: string) => HAIR_ONLY.has(top);

// Carga segura desde localStorage
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return FALLBACK;
    const parsed = JSON.parse(raw);
    return {
      top: parsed.top ?? FALLBACK.top,
      hairColor: parsed.hairColor ?? FALLBACK.hairColor,
      facialHair: parsed.facialHair ?? FALLBACK.facialHair,
      facialHairColor: parsed.facialHairColor ?? FALLBACK.facialHairColor,
      skinColor: parsed.skinColor ?? FALLBACK.skinColor,
      accessories: parsed.accessory ?? parsed.accessories ?? FALLBACK.accessories, // por compat
      eyes: parsed.eyes ?? FALLBACK.eyes,
      mouth: parsed.mouth ?? FALLBACK.mouth,
    };
  } catch {
    return FALLBACK;
  }
}

export default function Doctor({
  className = "",
  size = 256,         // tamaño del contenedor (px)
  seed = "doctor1",   // semilla opcional para consistencia
}: {
  className?: string;
  size?: number;
  seed?: string;
}) {
  const [settings, setSettings] = useState(loadSaved());

  // Escucha cambios de localStorage desde otras pestañas/componentes (opcional)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSettings(loadSaved());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Si quisieras refrescar también cuando el mismo componente escriba (no aplica aquí sin controles):
  // useEffect(() => setSettings(loadSaved()), []); // ya se hace al montar

  const svg = useMemo(() => {
    const asHex = (v: string) => v.replace("#", "");
    const { top, hairColor, facialHair, facialHairColor, skinColor, accessories, eyes, mouth } = settings;

    const opts: any = {
      seed,
      top: [top],
      eyes: [eyes],
      mouth: [mouth],
      accessories: [accessories],
      eyebrows: ["default"],

      facialHair: [facialHair],
      facialHairColor: [asHex(facialHairColor)],
      facialHairProbability: facialHair === "blank" ? 0 : 100,

      clothing: ["blazerAndShirt"], // fijo
      clothesColor: ["ffffff"],

      skinColor: [asHex(skinColor)],

      ...(isHairLike(top) ? { hairColor: [asHex(hairColor)] } : {}),
      ...(isHatLike(top) ? { hatColor: [asHex(hairColor)] } : {}),
    };

    return createAvatar(avataaars, opts).toString();
  }, [settings, seed]);

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label="Avatar del doctor"
      title="Doctor"
    >
      <div
        style={{ width: "100%", height: "100%" }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
