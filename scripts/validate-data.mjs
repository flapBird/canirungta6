import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const validDeviceTypes = new Set(["desktop", "laptop", "integrated", "other"]);
const validBrands = new Set(["NVIDIA", "AMD", "Intel", "Apple", "Other"]);
const validArchitectures = new Set(["x64", "arm64", "other", "unknown"]);

export function validateDataset(dataset) {
  const errors = [];
  const { sources, cpus, gpus, profiles, statuses, guides, routes } = dataset;
  const sourceIds = new Set(sources.map((source) => source.id));
  const cpuIds = new Set(cpus.map((cpu) => cpu.id));
  const gpuIds = new Set(gpus.map((gpu) => gpu.id));

  const requireUnique = (items, label) => {
    const seen = new Set();
    for (const item of items) {
      if (!item.id || seen.has(item.id)) errors.push(`${label}: duplicate or empty id ${item.id}`);
      seen.add(item.id);
    }
  };
  const requireSources = (item, label) => {
    if (!Array.isArray(item.sourceIds) || item.sourceIds.length === 0) errors.push(`${label} ${item.id}: missing sourceIds`);
    for (const sourceId of item.sourceIds) if (!sourceIds.has(sourceId)) errors.push(`${label} ${item.id}: unknown source ${sourceId}`);
  };
  const validateScore = (score, itemId, label) => {
    if (score === null) return;
    if (!score || !Number.isFinite(score.value) || score.value <= 0) errors.push(`${label} ${itemId}: invalid benchmark value`);
    if (!score.datasetId) errors.push(`${label} ${itemId}: missing benchmark datasetId`);
    if (!sourceIds.has(score.sourceId)) errors.push(`${label} ${itemId}: unknown benchmark source ${score.sourceId}`);
    if (!Number.isFinite(Date.parse(score.measuredAt))) errors.push(`${label} ${itemId}: invalid measuredAt`);
  };

  requireUnique(sources, "source");
  requireUnique(cpus, "CPU");
  requireUnique(gpus, "GPU");
  requireUnique(profiles, "profile");
  const statusGames = new Set();
  for (const status of statuses) {
    if (!status.game || statusGames.has(status.game)) errors.push(`status: duplicate or empty game ${status.game}`);
    statusGames.add(status.game);
  }

  for (const source of sources) {
    if (!/^https:\/\//.test(source.url)) errors.push(`source ${source.id}: URL must use HTTPS`);
    if (!Number.isFinite(Date.parse(source.checkedAt))) errors.push(`source ${source.id}: invalid checkedAt`);
    if (!source.publisher || !source.title) errors.push(`source ${source.id}: missing publisher or title`);
  }

  for (const cpu of cpus) {
    requireSources(cpu, "CPU");
    if (!validBrands.has(cpu.brand)) errors.push(`CPU ${cpu.id}: invalid brand`);
    if (!validDeviceTypes.has(cpu.deviceType)) errors.push(`CPU ${cpu.id}: invalid deviceType`);
    if (!validArchitectures.has(cpu.instructionSet)) errors.push(`CPU ${cpu.id}: invalid instructionSet`);
    for (const field of ["cores", "threads"]) {
      if (cpu[field] !== null && (!Number.isInteger(cpu[field]) || cpu[field] < 1 || cpu[field] > 256)) errors.push(`CPU ${cpu.id}: invalid ${field}`);
    }
    if (cpu.cores !== null && cpu.threads !== null && cpu.threads < cpu.cores) errors.push(`CPU ${cpu.id}: threads below cores`);
    if (cpu.releaseYear !== null && (cpu.releaseYear < 1971 || cpu.releaseYear > 2030)) errors.push(`CPU ${cpu.id}: invalid releaseYear`);
    validateScore(cpu.gamingScore, cpu.id, "CPU");
    validateScore(cpu.singleCoreScore, cpu.id, "CPU");
    validateScore(cpu.multiCoreScore, cpu.id, "CPU");
  }

  for (const gpu of gpus) {
    requireSources(gpu, "GPU");
    if (!validBrands.has(gpu.brand)) errors.push(`GPU ${gpu.id}: invalid brand`);
    if (!validDeviceTypes.has(gpu.deviceType)) errors.push(`GPU ${gpu.id}: invalid deviceType`);
    if (!["dedicated", "shared", "unknown"].includes(gpu.memoryType)) errors.push(`GPU ${gpu.id}: invalid memoryType`);
    if (gpu.vramGB !== null && (!Number.isFinite(gpu.vramGB) || gpu.vramGB <= 0 || gpu.vramGB > 64)) errors.push(`GPU ${gpu.id}: invalid vramGB`);
    if (gpu.releaseYear !== null && (gpu.releaseYear < 1980 || gpu.releaseYear > 2030)) errors.push(`GPU ${gpu.id}: invalid releaseYear`);
    validateScore(gpu.rasterScore, gpu.id, "GPU");
    validateScore(gpu.rayTracingScore, gpu.id, "GPU");
  }

  for (const [items, label] of [[cpus, "CPU"], [gpus, "GPU"]]) {
    const aliases = new Map();
    for (const item of items) {
      for (const alias of item.aliases) {
        const key = alias.toLowerCase().replace(/\s+/g, " ").trim();
        const owner = aliases.get(key);
        if (owner && owner !== item.id) errors.push(`${label}: alias collision "${alias}" (${owner}, ${item.id})`);
        aliases.set(key, item.id);
      }
    }
  }

  for (const profile of profiles) {
    requireSources(profile, "profile");
    if (profile.consoleGpuBands) {
      const seen = new Set();
      for (const band of ["consoleBelow", "consoleNear", "consoleAbove"]) {
        const ids = profile.consoleGpuBands[band];
        if (!Array.isArray(ids) || !ids.length) {
          errors.push(`profile ${profile.id}: missing GPU band ${band}`);
          continue;
        }
        for (const id of ids) {
          if (seen.has(id) || !gpus.some((gpu) => gpu.id === id && gpu.deviceType === "desktop")) {
            errors.push(`profile ${profile.id}: duplicate or invalid desktop GPU ${id}`);
          }
          seen.add(id);
        }
      }
    }
    for (const id of profile.referenceCpuIds) if (!cpuIds.has(id)) errors.push(`profile ${profile.id}: unknown CPU ${id}`);
    for (const id of profile.referenceGpuIds) if (!gpuIds.has(id)) errors.push(`profile ${profile.id}: unknown GPU ${id}`);
    for (const field of ["ramGB", "vramGB", "storageReferenceGB"]) {
      if (profile[field] !== null && (!Number.isFinite(profile[field]) || profile[field] <= 0)) errors.push(`profile ${profile.id}: invalid ${field}`);
    }
    validateScore(profile.cpuTarget, profile.id, "profile");
    validateScore(profile.gpuTarget, profile.id, "profile");
    if (!Number.isFinite(Date.parse(profile.reviewedAt))) errors.push(`profile ${profile.id}: invalid reviewedAt`);
  }

  for (const status of statuses) {
    requireSources(status, "status");
    if (!Number.isFinite(Date.parse(status.checkedAt))) errors.push(`status ${status.game}: invalid checkedAt`);
  }

  if (!guides || !routes) {
    errors.push("guides: missing guide dataset or route registry");
    return errors;
  }
  if (!Number.isFinite(Date.parse(guides.updatedAt))) errors.push("guides: invalid updatedAt");
  requireUnique(guides.chapters, "chapter");
  requireUnique(guides.characters, "character");
  requireUnique(guides.moneyMethods, "money method");
  const routeIds = new Set(Object.keys(routes));
  const missionIds = new Set();
  const expectedGuidePages = ["chapters", "chapter1", "chapter2", "chapter3", "chapter4", "chapter5", "characters", "mandy", "money", "vehicleTracker"];

  for (const chapter of guides.chapters) {
    requireSources(chapter, "chapter");
    if (!Number.isInteger(chapter.number) || chapter.number < 1 || chapter.number > 5) errors.push(`chapter ${chapter.id}: invalid number`);
    if (!chapter.title) errors.push(`chapter ${chapter.id}: missing title`);
    for (const field of ["reportedMissions", "optionalMissions", "redacted"]) {
      if (!Number.isInteger(chapter[field]) || chapter[field] < 0) errors.push(`chapter ${chapter.id}: invalid ${field}`);
    }
    if (chapter.page !== `chapter${chapter.number}` || !routeIds.has(chapter.page)) errors.push(`chapter ${chapter.id}: invalid detail page`);
  }

  for (const [page, missions] of Object.entries(guides.missionLists)) {
    if (!["chapter3", "chapter4"].includes(page) || !routeIds.has(page)) errors.push(`mission list ${page}: unknown page`);
    if (!Array.isArray(missions) || missions.length === 0) {
      errors.push(`mission list ${page}: missing missions`);
      continue;
    }
    const chapter = guides.chapters.find((item) => item.page === page);
    if (chapter && chapter.reportedMissions !== missions.length) errors.push(`mission list ${page}: count differs from chapter`);
    missions.forEach((mission, index) => {
      if (!mission.id || missionIds.has(mission.id)) errors.push(`mission list ${page}: duplicate or empty id ${mission.id}`);
      missionIds.add(mission.id);
      if (!mission.name) errors.push(`mission ${mission.id}: missing name`);
      if (!new RegExp(`^c${chapter?.number ?? "\\d+"}-\\d{2}$`).test(mission.id) || Number(mission.id.slice(-2)) !== index + 1) errors.push(`mission ${mission.id}: invalid order or chapter prefix`);
      if (mission.optional && !chapter) errors.push(`mission ${mission.id}: optional flag without chapter`);
    });
    const optional = missions.filter((mission) => mission.optional).length;
    if (chapter && chapter.optionalMissions !== optional) errors.push(`mission list ${page}: optional count differs from chapter`);
  }

  for (const character of guides.characters) {
    requireSources(character, "character");
    if (!character.name || !character.performer) errors.push(`character ${character.id}: missing name or performer`);
    if (!["lead", "supporting", "contact"].includes(character.group)) errors.push(`character ${character.id}: invalid group`);
    if (character.page && character.page !== "mandy") errors.push(`character ${character.id}: invalid page`);
  }

  for (const method of guides.moneyMethods) {
    requireSources(method, "money method");
    if (method.id !== `m${method.n}` || !Number.isInteger(method.n) || method.n < 1 || method.n > guides.moneyMethods.length) errors.push(`money method ${method.id}: invalid number`);
    if (!Number.isInteger(method.chapter) || method.chapter < 1 || method.chapter > 5) errors.push(`money method ${method.id}: invalid chapter`);
    if (!["story", "repeatable", "reported"].includes(method.status)) errors.push(`money method ${method.id}: invalid status`);
  }

  for (const page of expectedGuidePages) {
    if (!routeIds.has(page)) errors.push(`guides: missing route ${page}`);
    const ids = guides.pageSourceIds?.[page];
    if (!Array.isArray(ids) || ids.length === 0) errors.push(`guides ${page}: missing sourceIds`);
    else for (const sourceId of ids) if (!sourceIds.has(sourceId)) errors.push(`guides ${page}: unknown source ${sourceId}`);
  }

  return errors;
}

export function loadDataset() {
  return {
    sources: readJson("../src/data/sources.json"),
    cpus: readJson("../src/data/cpus.json"),
    gpus: readJson("../src/data/gpus.json"),
    profiles: [
      readJson("../src/data/profiles/gta6.json"),
      readJson("../src/data/profiles/leonida-low.json"),
      readJson("../src/data/profiles/leonida-high.json"),
    ],
    statuses: [readJson("../src/data/status/gta6.json"), readJson("../src/data/status/leonida.json")],
    guides: readJson("../src/data/guides.json"),
    routes: readJson("../src/data/routes.json"),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dataset = loadDataset();
  const errors = validateDataset(dataset);
  if (errors.length) {
    console.error(`Data validation failed (${errors.length} errors):\n${errors.map((error) => `- ${error}`).join("\n")}`);
    process.exit(1);
  }
  console.log(`Data validation passed: ${dataset.cpus.length} CPUs, ${dataset.gpus.length} GPUs, ${dataset.sources.length} sources, ${dataset.profiles.length} profiles, ${dataset.guides.chapters.length} guide chapters.`);
}
