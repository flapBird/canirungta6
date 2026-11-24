import { matchRenderer } from "@/lib/hardware-matcher";
import type { Architecture, GPU, OperatingSystem } from "@/lib/types";

export interface HardwareDetection {
  gpuId: string | null;
  ramGB: number | null;
  os: OperatingSystem;
  architecture: Architecture;
  logicalThreads: number | null;
  osAmbiguous: boolean;
  rendererUnavailable: boolean;
  softwareRenderer: boolean;
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
  userAgentData?: {
    platform?: string;
    getHighEntropyValues?: (hints: string[]) => Promise<{ platformVersion?: string }>;
  };
}

function detectOs(navigatorWithHints: NavigatorWithMemory): { os: OperatingSystem; architecture: Architecture; ambiguous: boolean } {
  const ua = navigatorWithHints.userAgent.toLowerCase();
  const platform = (navigatorWithHints.userAgentData?.platform ?? navigatorWithHints.platform ?? "").toLowerCase();
  const architecture: Architecture = /arm64|aarch64/.test(ua) ? "arm64" : /win|windows|x64/.test(platform) ? "x64" : "unknown";
  if (/windows|win32|win64/.test(`${ua} ${platform}`)) return { os: "windows10", architecture, ambiguous: true };
  if (/macintosh|macintel|mac os/.test(`${ua} ${platform}`)) return { os: "macos", architecture, ambiguous: false };
  if (/linux|x11/.test(`${ua} ${platform}`)) return { os: "linux", architecture, ambiguous: false };
  return { os: "unknown", architecture: "unknown", ambiguous: false };
}

export async function detectHardware(gpus: GPU[]): Promise<HardwareDetection> {
  const nav = navigator as NavigatorWithMemory;
  const osInfo = detectOs(nav);
  let gpuId: string | null = null;
  let rendererUnavailable = true;
  let softwareRenderer = false;

  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    const gl = gl2 ?? canvas.getContext("webgl");
    if (gl) {
      rendererUnavailable = false;
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? "");
        softwareRenderer = /swiftshader|llvmpipe|software|microsoft basic/i.test(renderer);
        gpuId = softwareRenderer ? null : matchRenderer(renderer, gpus)?.id ?? null;
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    rendererUnavailable = true;
  }

  let os = osInfo.os;
  let osAmbiguous = osInfo.ambiguous;
  if (os === "windows10" && nav.userAgentData?.getHighEntropyValues) {
    try {
      const hints = await nav.userAgentData.getHighEntropyValues(["platformVersion"]);
      const major = Number.parseInt(hints.platformVersion?.split(".")[0] ?? "0", 10);
      if (major >= 13) {
        os = "windows11";
        osAmbiguous = false;
      }
    } catch {
      osAmbiguous = true;
    }
  }

  return {
    gpuId,
    ramGB: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
    os,
    architecture: osInfo.architecture,
    logicalThreads: Number.isInteger(nav.hardwareConcurrency) && nav.hardwareConcurrency > 0 ? nav.hardwareConcurrency : null,
    osAmbiguous,
    rendererUnavailable,
    softwareRenderer,
  };
}
