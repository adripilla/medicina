import { useEffect, useMemo, useState } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

// Fallbacks por si falla el fetch del schema
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
  mouth: ["concerned","default","disbelief","eating","grimace","sad","screamOpen","serious","smile","tongue","twinkle","vomit"]
};

// Clasificadores
const isHatLike = (top: string) => /hat|turban|hijab/i.test(top);
const HAIR_ONLY = [
  "bigHair","bob","bun","curly","curvy","dreads","dreads01","dreads02","frida",
  "frizzle","fro","froBand","longButNotTooLong","miaWallace","shaggy","shaggyMullet",
  "shavedSides","shortCurly","shortFlat","shortRound","shortWaved","sides",
  "straight01","straight02","straightAndStrand","theCaesar","theCaesarAndSidePart"
];
const isHairLike = (top: string) => HAIR_ONLY.includes(top);

export default function Personalizar() {
  const [schema, setSchema] = useState<any | null>(null);

  // Estado principal
  const [top, setTop] = useState<string>(FALLBACK.top[0]);
  const [hairColor, setHairColor] = useState<string>("#000000");
  const [facialHair, setFacialHair] = useState<string>(FALLBACK.facialHair[0]);
  const [facialHairColor, setFacialHairColor] = useState<string>("#2c1b18");
  const [skinColor, setSkinColor] = useState<string>("#" + FALLBACK.skinColor[0]);
  const [accessory, setAccessory] = useState<string>(FALLBACK.accessories[0]);
  const [eyes, setEyes] = useState<string>(FALLBACK.eyes[2]); // default
  const [mouth, setMouth] = useState<string>(FALLBACK.mouth[8]); // smile

  // Cargar schema oficial
  useEffect(() => {
    fetch("https://api.dicebear.com/9.x/avataaars/schema.json")
      .then((r) => r.json())
      .then((j) => setSchema(j))
      .catch(() => setSchema(null));
  }, []);

  // Helper para extraer enums
  const getEnum = (key: string, fb: string[]) => {
    const p = schema?.properties?.[key];
    const enums =
      p?.enum ??
      p?.anyOf?.flatMap((x: any) => (Array.isArray(x.enum) ? x.enum : [])) ??
      [];
    return enums.length ? enums : fb;
  };

  // Enums (del schema o fallback)
  const enumTop = getEnum("top", FALLBACK.top);
  const enumFacialHair = getEnum("facialHair", FALLBACK.facialHair);
  const enumSkinHex = getEnum("skinColor", FALLBACK.skinColor).map((v: string) =>
    v.startsWith("#") ? v.slice(1) : v
  );
  const enumAccessories = getEnum("accessories", FALLBACK.accessories);
  const enumEyes = getEnum("eyes", FALLBACK.eyes);
  const enumMouth = getEnum("mouth", FALLBACK.mouth);

  // Render avatar
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

      clothing: ["blazerAndShirt"], // fijo
      clothesColor: ["ffffff"],

      skinColor: [asHex(skinColor)],

      ...(isHairLike(top) ? { hairColor: [asHex(hairColor)] } : {}),
      ...(isHatLike(top) ? { hatColor: [asHex(hairColor)] } : {}),
    };

    return createAvatar(avataaars, opts).toString();
  }, [top, hairColor, facialHair, facialHairColor, skinColor, accessory, eyes, mouth]);

  return (
    <div style={{ padding: 24 }}>
      <h1>✂️ Personalización de Avatar</h1>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{ width: 260, height: 260 }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          style={{
            display: "grid",
            gap: 12,
            minWidth: 320,
            background: "rgba(255,255,255,.75)",
            padding: 12,
            borderRadius: 12,
          }}
        >
          <label>
            Corte (top):
            <select value={top} onChange={(e) => setTop(e.target.value)}>
              {enumTop.map((v: string) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label>
            {isHatLike(top) ? "Color sombrero" : isHairLike(top) ? "Color de pelo" : "Color (no aplica a noHair)"}:
            <input
              type="color"
              value={hairColor}
              onChange={(e) => setHairColor(e.target.value)}
              disabled={!isHairLike(top) && !isHatLike(top)}
            />
          </label>

          <label>
            Vello facial:
            <select value={facialHair} onChange={(e) => setFacialHair(e.target.value)}>
              {enumFacialHair.map((v: string) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label>
            Color vello facial:
            <input
              type="color"
              value={facialHairColor}
              onChange={(e) => setFacialHairColor(e.target.value)}
              disabled={facialHair === "blank"}
            />
          </label>

          <label>
            Accesorios:
            <select value={accessory} onChange={(e) => setAccessory(e.target.value)}>
              {enumAccessories.map((v: string) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label>
            Ojos:
            <select value={eyes} onChange={(e) => setEyes(e.target.value)}>
              {enumEyes.map((v: string) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label>
            Boca:
            <select value={mouth} onChange={(e) => setMouth(e.target.value)}>
              {enumMouth.map((v: string) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          <label>
            Tono de piel:
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              {enumSkinHex.map((hex: string) => {
                const value = "#" + hex;
                const isActive = skinColor.toLowerCase() === value.toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setSkinColor(value)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      border: isActive ? "2px solid #111" : "1px solid #ccc",
                      background: value,
                      cursor: "pointer",
                    }}
                  />
                );
              })}
            </div>
          </label>
        </form>
      </div>
    </div>
  );
}
