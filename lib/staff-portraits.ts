import {
  STAFF_PORTRAIT_FALLBACKS,
  type StaffEthnicityLabel,
} from "@/lib/staff-image-map";

/**
 * Curated female-only portrait URLs for staff fallbacks.
 * Ethnicity matching is enforced via `portraitForEthnicity`.
 */
export { STAFF_PORTRAIT_FALLBACKS };

export type StaffProfileTemplate = {
  name: string;
  nameZh?: string;
  ethnicity: StaffEthnicityLabel;
  ethnicityZh?: string;
  heightCm: number;
  cup: string;
  styles: string[];
};

/** Deterministic premium roster templates — varied looks for AU + CN clientele. */
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
  {
    name: "Zara",
    nameZh: "扎拉",
    ethnicity: "Black",
    ethnicityZh: "非裔",
    heightCm: 171,
    cup: "D",
    styles: ["Glam", "Tall", "Elegant"],
  },
  {
    name: "Camila",
    nameZh: "卡米拉",
    ethnicity: "Latina",
    ethnicityZh: "拉美",
    heightCm: 167,
    cup: "C",
    styles: ["Sensual", "GFE", "Curvy"],
  },
  {
    name: "Ivy",
    nameZh: "艾薇",
    ethnicity: "Western",
    ethnicityZh: "欧美",
    heightCm: 169,
    cup: "B",
    styles: ["Slim", "Playful", "GFE"],
  },
  {
    name: "Sora",
    nameZh: "ソラ",
    ethnicity: "Japanese",
    ethnicityZh: "日系",
    heightCm: 158,
    cup: "B",
    styles: ["Petite", "Cute", "Sweet"],
  },
];
