"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/types";

const places = [
  { id: "vice-city-gym", key: "gym", x: 77, y: 32, source: "https://gta.exputer.com/gta-6/guides/join-a-gym/", publisher: "eXputer" },
  { id: "starfish-island", key: "island", x: 65, y: 42, source: "https://www.gtaboom.com/gta-6-starfish-island-mansion-garage-4cf3/", publisher: "GTA BOOM" },
  { id: "leonida-keys", key: "keys", x: 28, y: 83, source: "https://www.rockstargames.com/VI/only-in-leonida/leonida-keys", publisher: "Rockstar Games" },
  { id: "vice-city-portal", key: "portal", x: 46, y: 68, source: "https://www.reddit.com/r/GTA6unmoderated/comments/1y3e1f1/hidden_vice_city_portal_in_gta_6_full_steps/", publisher: "r/GTA6unmoderated" },
] as const;

const substations = [
  "Downtown Vice City · L → D", "Balsero · iF → D", "Key Lento · Ei → •",
  "Vice Beach (N) · S → A", "North Vice City · P → •", "Port Gellhorn · A → A",
  "Hamlet · Ss → A", "Gloriana Key · iN → A", "Hamlet · G → •",
  "Port Gellhorn · Me → W", "Hamlet · B → D", "Breakwater Quarry · Y → W",
];

export function LeonidaMap({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.guides;
  const [filter, setFilter] = useState("");
  const matches = places.filter(({ key }) => !filter || key === filter);
  return (
    <article className="container-shell py-10">
      <h1 className="gradient-text text-3xl font-black sm:text-5xl">{t.mapCrumb}</h1>
      <p className="my-4 max-w-3xl text-muted">{t.mapIntro}</p>
      <div className="panel grid overflow-hidden md:grid-cols-[2fr_1fr]">
        <div className="relative min-h-64 overflow-hidden bg-[#0c3543]" dir="ltr">
          <svg aria-hidden="true" className="absolute size-full" viewBox="0 0 600 320" preserveAspectRatio="none">
            <defs><pattern id="sea-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#30606b" strokeWidth=".7"/></pattern></defs>
            <rect width="600" height="320" fill="url(#sea-grid)"/>
            <g fill="#285348" stroke="#74ac91" strokeWidth="2">
              <path d="M0 0H397L388 35 369 57 365 90 333 129 332 163 304 179 281 176 258 201 239 199 235 179 210 171 198 149 166 146 145 128 111 130 85 106 51 117 0 95Z"/>
              <path d="M470 8l10 16-7 43 5 21-16 39-12 20-12 2 4-35 12-27 1-40Z M382 128l21-5 8 9-16 11-17 1Z"/>
              <path d="M290 208l-12 20-24 6 5-12 14-11Z M244 237l-23 17-14 1 9-12Z M195 255l-21 18-23 1 10-13Z M138 278l-22 13-20-2 13-8Z"/>
            </g>
            <g fill="none" stroke="#ccb583" strokeWidth="2"><path d="M235 66l76 60 77 8 62-21 M310 125l-24 76-16 21-43 24-52 19-60 19"/></g>
            <g fill="#c3e0d8" fontSize="14" letterSpacing="2"><text x="165" y="65">VICE CITY</text><text x="50" y="235">LEONIDA KEYS</text></g>
          </svg>
          {matches.map((p) => <a key={p.id} href={'#' + p.id} aria-label={t[p.key]} title={t[p.key]} style={{ left: p.x + '%', top: p.y + '%' }} className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline"><span className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#602f65] font-bold text-white">{places.indexOf(p) + 1}</span></a>)}
        </div>
        <div className="p-5">
          <label className="block text-sm font-bold">{t.filter}
            <select className="field mt-2 w-full" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">{t.allPlaces}</option>
              {places.map((p) => <option key={p.id} value={p.key}>{t[p.key]}</option>)}
            </select>
          </label>
          <ul className="mt-4">{matches.map((p) => <li key={p.id}><a className="inline-flex min-h-11 items-center gap-3 text-accent hover:underline" href={'#' + p.id}><b>{places.indexOf(p) + 1}</b>{t[p.key]}</a></li>)}</ul>
        </div>
      </div>
      {places.map((p) => <section key={p.id} id={p.id} className="panel mt-6 scroll-mt-4 p-6">
        <h2 className="text-2xl font-extrabold">{t[p.key + "Heading"]}</h2>
        <p className="mt-3 max-w-3xl">{t[p.key + "Body"]}</p>
        {p.key === "gym" && <p className="mt-3 max-w-3xl">{t.gymGains}</p>}
        {p.key === "portal" && <>
          <p className="my-3 max-w-3xl">{t.portalOrder}</p>
          <ol dir="ltr" className="grid list-inside list-decimal gap-2 text-sm sm:grid-cols-2">{substations.map((stop) => <li key={stop}>{stop}</li>)}</ol>
          <p className="mt-4">{t.portalEnd}</p>
        </>}
        <a className="mt-3 inline-block text-sm text-accent underline" href={p.source}>{p.publisher}</a>
      </section>)}
    </article>
  );
}
