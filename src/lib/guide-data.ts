import guideData from "@/data/guides.json";

export type ChapterDetailPage = `chapter${1 | 2 | 3 | 4 | 5}`;
export type GuidePage = "chapters" | ChapterDetailPage | "characters" | "mandy" | "money";

export interface GuideChapter {
  id: string;
  number: number;
  title: string;
  reportedMissions: number;
  optionalMissions: number;
  redacted: number;
  page: ChapterDetailPage;
  sourceIds: string[];
}

export interface Mission {
  id: string;
  name: string;
  optional?: boolean;
  secondaryTitle?: boolean;
}

export interface GuideCharacter {
  id: string;
  name: string;
  performer: string;
  group: "lead" | "supporting" | "contact";
  page?: "mandy";
  sourceIds: string[];
}

export interface MoneyMethod {
  id: string;
  n: number;
  chapter: number;
  status: "story" | "repeatable" | "reported";
  sourceIds: string[];
}

export const guideDataset = guideData as {
  updatedAt: string;
  chapters: GuideChapter[];
  missionLists: Record<"chapter3" | "chapter4", Mission[]>;
  characters: GuideCharacter[];
  moneyMethods: MoneyMethod[];
  pageSourceIds: Record<GuidePage, string[]>;
};

export const guideUpdatedAt = guideDataset.updatedAt;
export const guideChapters = guideDataset.chapters;
export const guideCharacters = guideDataset.characters;
export const moneyMethods = guideDataset.moneyMethods;
export const allMissionIds = new Set([
  ...guideDataset.missionLists.chapter3.map((mission) => mission.id),
  ...guideDataset.missionLists.chapter4.map((mission) => mission.id),
]);

export function chapterDetail(page: ChapterDetailPage): GuideChapter {
  const chapter = guideChapters.find((item) => item.page === page);
  if (!chapter) throw new Error(`Unknown chapter detail page: ${page}`);
  return chapter;
}

export function pageSourceIds(page: GuidePage): string[] {
  return guideDataset.pageSourceIds[page];
}
