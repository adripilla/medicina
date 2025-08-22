import { useEffect, useMemo, useState } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

// --- Fallbacks por si falla el fetch del schema ---
const FALLBACK = {
  top: [
    "bigHair","bob","bun","curly","curvy","dreads","dreads01","dreads02","frida",
    "frizzle","fro","froBand","hat","hijab","longButNotTooLong","miaWallace",
    "shaggy","shaggyMullet","shavedSides","shortCurly","shortFlat","shortRound",
    "shortWaved","sides","straight01","straight02","straightAndStrand","theCaesar",
    "theCaesarAndSidePart","turban","winterHat1","winterHat02","winterHat03","winterHat04","noHair"
  ],
  facialHair: ["blank", "beardLight", "beardMedium", "moustacheFancy", "moustacheMagnum"],
  skinColor: ["F9D3B4","EAC393","D0A17F","A67449","8D5524","F2D3B1","C58C85"],
  accessories: ["blank","eyepatch","kurt","prescription01","prescription02","round","sunglasses","wayfarers"],
  eyes: ["closed","cry","default","eyeRoll","happy","hearts","side","squint","surprised","wink","winkWacky","xDizzy"],
  mouth: ["concerned","default","disbelief","eating","grimace","sad","screamOpen","serious","smile","tongue","twinkle","vomit"],
  name: "chapatin", // 👈 nombre por defecto
};

// --- Clasificadores ---
const isHatLike = (top: string) => /hat|turban|hijab/i.test(top);
const HAIR_ONLY = [
  "bigHair","bob","bun","curly","curvy","dreads","dreads01","dreads02","frida",
  "frizzle","fro","froBand","longButNotTooLong","miaWallace","shaggy","shaggyMullet",
  "shavedSides","shortCurly","shortFlat","shortRound","shortWaved","sides",
  "straight01","straight02","straightAndStrand","theCaesar","theCaesarAndSidePart"
];
const isHairLike = (top: string) => HAIR_ONLY.includes(top);

// --- Clave de almacenamiento local ---
const STORAGE_KEY = "avatar-settings";

// Util para leer/mezclar settings guardados sin romper si faltan campos
function loadSaved<T extends Record<string, any>>(defaults: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export default function Personalizar() {
  const [schema, setSchema] = useState<any | null>(null);

  // --- Estado con valores iniciales ---
  const [top, setTop] = useState<string>(FALLBACK.top[0]);
  const [hairColor, setHairColor] = useState<string>("#000000");
  const [facialHair, setFacialHair] = useState<string>(FALLBACK.facialHair[0]);
  const [facialHairColor, setFacialHairColor] = useState<string>("#2c1b18");
  const [skinColor, setSkinColor] = useState<string>("#" + FALLBACK.skinColor[0]);
  const [accessory, setAccessory] = useState<string>(FALLBACK.accessories[0]);
  const [eyes, setEyes] = useState<string>(FALLBACK.eyes[2]);
  const [mouth, setMouth] = useState<string>(FALLBACK.mouth[8]);
  const [name, setName] = useState<string>(FALLBACK.name);

  // --- Al montar: restaurar desde localStorage ---
  useEffect(() => {
    const restored = loadSaved({
      top, hairColor, facialHair, facialHairColor, skinColor, accessory, eyes, mouth, name,
    });
    setTop(restored.top);
    setHairColor(restored.hairColor);
    setFacialHair(restored.facialHair);
    setFacialHairColor(restored.facialHairColor);
    setSkinColor(restored.skinColor);
    setAccessory(restored.accessory);
    setEyes(restored.eyes);
    setMouth(restored.mouth);
    setName(restored.name || FALLBACK.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Guardado automático con debounce ---
  useEffect(() => {
    const data = { top, hairColor, facialHair, facialHairColor, skinColor, accessory, eyes, mouth, name };
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, 250);
    return () => clearTimeout(t);
  }, [top, hairColor, facialHair, facialHairColor, skinColor, accessory, eyes, mouth, name]);

  // --- Cargar schema oficial ---
  useEffect(() => {
    fetch("https://api.dicebear.com/9.x/avataaars/schema.json")
      .then((r) => r.json())
      .then((j) => setSchema(j))
      .catch(() => setSchema(null));
  }, []);

  // --- Helper ---
  const getEnum = (key: string, fb: string[]) => {
    const p = schema?.properties?.[key];
    const enums =
      p?.enum ??
      p?.anyOf?.flatMap((x: any) => (Array.isArray(x.enum) ? x.enum : [])) ??
      [];
    return enums.length ? enums : fb;
  };

  const enumTop = getEnum("top", FALLBACK.top);
  const enumFacialHair = getEnum("facialHair", FALLBACK.facialHair);
  const enumSkinHex = getEnum("skinColor", FALLBACK.skinColor).map((v: string) =>
    v.startsWith("#") ? v.slice(1) : v
  );
  const enumAccessories = getEnum("accessories", FALLBACK.accessories);
  const enumEyes = getEnum("eyes", FALLBACK.eyes);
  const enumMouth = getEnum("mouth", FALLBACK.mouth);

  // --- Render del SVG ---
  const svg = useMemo(() => {
    const asHex = (v: string) => v.replace("#", "");
    const opts: any = {
      seed: "doctor1",
      top: [top],

      eyes: [eyes],
      mouth: [mouth],
      accessories: [accessory],
      eyebrows: ["default"],

      facialHair: [facialHair],
      facialHairColor: [asHex(facialHairColor)],
      facialHairProbability: facialHair === "blank" ? 0 : 100,

      clothing: ["blazerAndShirt"],
      clothesColor: ["ffffff"],

      skinColor: [asHex(skinColor)],

      ...(isHairLike(top) ? { hairColor: [asHex(hairColor)] } : {}),
      ...(isHatLike(top) ? { hatColor: [asHex(hairColor)] } : {}),
    };

    return createAvatar(avataaars, opts).toString();
  }, [top, hairColor, facialHair, facialHairColor, skinColor, accessory, eyes, mouth]);

  // --- Restablecer ---
  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTop(FALLBACK.top[0]);
    setHairColor("#000000");
    setFacialHair(FALLBACK.facialHair[0]);
    setFacialHairColor("#2c1b18");
    setSkinColor("#" + FALLBACK.skinColor[0]);
    setAccessory(FALLBACK.accessories[0]);
    setEyes(FALLBACK.eyes[2]);
    setMouth(FALLBACK.mouth[8]);
    setName(FALLBACK.name);
  };

  return (
    <div className="p-8 flex flex-col items-center bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">🎨 Personaliza tu Avatar</h1>
      <p className="text-gray-500 mb-6 text-sm">Tus selecciones se guardan automáticamente en este navegador.</p>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        {/* Vista */}
        <div className="flex flex-col items-center gap-3 bg-white shadow rounded-2xl p-6">
          <div
            className="w-64 h-64"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          {/* 👇 Mostrar nombre */}
          <p className="text-lg font-semibold text-gray-700">{name}</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50 transition"
            >
              Restablecer
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Controles */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid gap-4 bg-white shadow rounded-2xl p-6 flex-1"
        >
          <label className="flex flex-col text-sm font-medium text-gray-700">
            Nombre:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 border rounded p-2"
              placeholder="Escribe un nombre..."
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-gray-700">
            Corte (top):
            <select
              value={top}
              onChange={(e) => setTop(e.target.value)}
              className="mt-1 border rounded p-2"
            >
              {enumTop.map((v: string) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm font-medium text-gray-700">
            {isHatLike(top) ? "Color sombrero" : isHairLike(top) ? "Color de pelo" : "Color (no aplica)"}:
            <input
              type="color"
              value={hairColor}
              onChange={(e) => setHairColor(e.target.value)}
              disabled={!isHairLike(top) && !isHatLike(top)}
              className="mt-1 h-10 w-16 cursor-pointer"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-gray-700">
            Vello facial:
            <select
              value={facialHair}
              onChange={(e) => setFacialHair(e.target.value)}
              className="mt-1 border rounded p-2"
            >
              {enumFacialHair.map((v: string) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm font-medium text-gray-700">
            Color vello facial:
            <input
              type="color"
              value={facialHairColor}
              onChange={(e) => setFacialHairColor(e.target.value)}
              disabled={facialHair === "blank"}
              className="mt-1 h-10 w-16 cursor-pointer"
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-gray-700">
            Accesorios:
            <select
              value={accessory}
              onChange={(e) => setAccessory(e.target.value)}
              className="mt-1 border rounded p-2"
            >
              {enumAccessories.map((v: string) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm font-medium text-gray-700">
            Ojos:
            <select
              value={eyes}
              onChange={(e) => setEyes(e.target.value)}
              className="mt-1 border rounded p-2"
            >
              {enumEyes.map((v: string) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm font-medium text-gray-700">
            Boca:
            <select
              value={mouth}
              onChange={(e) => setMouth(e.target.value)}
              className="mt-1 border rounded p-2"
            >
              {enumMouth.map((v: string) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-sm font-medium text-gray-700">
            Tono de piel:
            <div className="flex gap-2 flex-wrap mt-2">
              {enumSkinHex.map((hex: string) => {
                const value = "#" + hex;
                const isActive = skinColor.toLowerCase() === value.toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setSkinColor(value)}
                    style={{ background: value }}
                    className={`w-7 h-7 rounded-full border ${isActive ? "ring-2 ring-gray-700" : "border-gray-300"}`}
                    title={value}
                  />
                );
              })}
              <input
                type="color"
                value={skinColor}
                onChange={(e) => setSkinColor(e.target.value)}
                className="h-8 w-10 rounded border cursor-pointer"
                title="Elegir otro tono"
              />
            </div>
          </label>
        </form>
      </div>
    </div>
  );
}
