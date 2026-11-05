/**
 * Curated high-resolution portrait URLs for staff fallbacks.
 * Mix of East Asian and Western glamour aesthetics (illustrative).
 */
export const STAFF_PORTRAIT_FALLBACKS = [
  // East Asian glam / soft beauty
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85",
  // Western glam / editorial
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=85&sat=-10",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85",
] as const;

export type StaffProfileTemplate = {
  name: string;
  nameZh?: string;
  ethnicity: string;
  ethnicityZh?: string;
  heightCm: number;
  cup: string;
  styles: string[];
};

/** Deterministic premium roster templates for AU + CN clientele. */
export const STAFF_PROFILE_TEMPLATES: StaffProfileTemplate[] = [
  {
    name: "Mei Lin",
    nameZh: "美琳",
    ethnicity: "Chinese",
    ethnicityZh: "华人",
    heightCm: 165,
    cup: "C",
    styles: ["GFE", "Cute", "Sensual"],
  },
  {
    name: "Sofia",
    nameZh: "索菲亚",
    ethnicity: "European",
    ethnicityZh: "欧美",
    heightCm: 172,
    cup: "D",
    styles: ["GFE", "Slim", "Elegant"],
  },
  {
    name: "Hana",
    nameZh: "花",
    ethnicity: "Japanese",
    ethnicityZh: "日系",
    heightCm: 160,
    cup: "B",
    styles: ["Cute", "Sensual", "Petite"],
  },
  {
    name: "Aria",
    nameZh: "艾瑞娅",
    ethnicity: "Australian",
    ethnicityZh: "澳洲本地",
    heightCm: 168,
    cup: "C",
    styles: ["GFE", "Playful", "Fit"],
  },
  {
    name: "Yuna",
    nameZh: "宥娜",
    ethnicity: "Korean",
    ethnicityZh: "韩系",
    heightCm: 166,
    cup: "C",
    styles: ["Cute", "Slim", "GFE"],
  },
  {
    name: "Valentina",
    nameZh: "瓦伦蒂娜",
    ethnicity: "Latina",
    ethnicityZh: "拉美",
    heightCm: 170,
    cup: "D",
    styles: ["Sensual", "Busty", "Glam"],
  },
  {
    name: "Chloe",
    nameZh: "克洛伊",
    ethnicity: "Western",
    ethnicityZh: "欧美",
    heightCm: 174,
    cup: "C",
    styles: ["Tall", "GFE", "Elegant"],
  },
  {
    name: "Ling",
    nameZh: "玲",
    ethnicity: "Chinese",
    ethnicityZh: "华人",
    heightCm: 162,
    cup: "B",
    styles: ["Cute", "GFE", "Sweet"],
  },
];
