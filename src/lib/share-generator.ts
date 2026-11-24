import { cpus, gpus } from "@/lib/data";
import type { CompatibilityResult, Dictionary, GameStatus, Locale, RequirementProfile, UserSpecs } from "@/lib/types";

export const SHARE_CARD_WIDTH = 1200;
export const SHARE_CARD_HEIGHT = 630;

export interface ShareCardInput {
  locale: Locale;
  dictionary: Dictionary;
  specs: UserSpecs;
  result: CompatibilityResult;
  profile: RequirementProfile;
  status: GameStatus;
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 2): number {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !line) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    let last = visible[maxLines - 1];
    while (context.measureText(`${last}…`).width > maxWidth && last.length > 1) last = last.slice(0, -1);
    visible[maxLines - 1] = `${last}…`;
  }
  visible.forEach((value, index) => context.fillText(value, x, y + index * lineHeight));
  return y + visible.length * lineHeight;
}

export async function generateShareCard(input: ShareCardInput): Promise<Blob> {
  const { locale, dictionary, specs, result, profile, status } = input;
  const t = dictionary.checker;
  const c = dictionary.common;
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("CANVAS_UNAVAILABLE");
  const rtl = locale === "ar";
  const align = rtl ? "right" : "left";
  const edge = rtl ? SHARE_CARD_WIDTH - 64 : 64;
  const font = rtl ? '"Geeza Pro", Tahoma, Arial, sans-serif' : 'Inter, Arial, sans-serif';
  context.direction = rtl ? "rtl" : "ltr";
  context.textAlign = align;

  const background = context.createLinearGradient(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
  background.addColorStop(0, "#101019");
  background.addColorStop(0.58, "#1c1726");
  background.addColorStop(1, "#261725");
  context.fillStyle = background;
  context.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
  context.fillStyle = "rgba(167,139,250,0.12)";
  context.beginPath();
  context.arc(1080, 40, 250, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgba(255,134,174,0.10)";
  context.beginPath();
  context.arc(70, 620, 230, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#ff86ae";
  context.font = `800 24px ${font}`;
  context.fillText("VI READY", edge, 62);
  context.fillStyle = "#b3b1c2";
  context.font = `600 15px ${font}`;
  context.fillText(t.shareCardBadge, edge, 91);

  context.fillStyle = "#f5f3fa";
  context.font = `800 46px ${font}`;
  wrapText(context, profile.game === "leonida" ? dictionary.leonida.reportTitle : t.shareCardTitle, edge, 154, 1072, 56, 2);

  context.fillStyle = "rgba(255,255,255,0.04)";
  roundedRect(context, 64, 222, 1072, 94, 16);
  context.fill();
  context.strokeStyle = "rgba(251,191,36,0.35)";
  context.lineWidth = 1;
  context.stroke();
  context.fillStyle = "#fbbf24";
  context.font = `700 16px ${font}`;
  context.fillText(t.shareCardResult, edge, 253);
  context.fillStyle = "#f5f3fa";
  context.font = `800 30px ${font}`;
  context.fillText(result.tier === "unknown" ? c.unknownTier : c[result.tier] ?? t[result.tier] ?? result.tier, edge, 292);

  const rows = [
    [t.processor, cpus.find((cpu) => cpu.id === specs.cpuId)?.name ?? c.unknown],
    [t.graphicsCard, gpus.find((gpu) => gpu.id === specs.gpuId)?.name ?? c.unknown],
    [t.ram, specs.ramGB === null ? c.unknown : `${specs.ramGB} GB`],
  ] as const;
  rows.forEach(([label, value], index) => {
    const y = 354 + index * 58;
    context.fillStyle = "#b3b1c2";
    context.font = `600 16px ${font}`;
    context.fillText(label, edge, y);
    context.fillStyle = "#f5f3fa";
    context.font = `700 23px ${font}`;
    context.textAlign = rtl ? "left" : "right";
    context.direction = "ltr";
    context.fillText(value, rtl ? 64 : 1136, y);
    context.textAlign = align;
    context.direction = rtl ? "rtl" : "ltr";
  });

  context.strokeStyle = "rgba(255,255,255,0.12)";
  context.beginPath();
  context.moveTo(64, 520);
  context.lineTo(1136, 520);
  context.stroke();
  context.fillStyle = "#b3b1c2";
  context.font = `500 16px ${font}`;
  wrapText(context, t.shareCardDisclaimer, edge, 549, 1072, 23, 2);
  context.font = `500 13px ${font}`;
  context.fillText(`${profile.id} · ${result.profileVersion} · ${status.checkedAt}`, edge, 606);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG_ENCODING_FAILED")), "image/png");
  });
}

export async function downloadShareCard(input: ShareCardInput): Promise<void> {
  const blob = await generateShareCard(input);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `vi-ready-${input.locale}.png`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
