// The game stores some unlock lists as a string of one letter per index (event shop,
// superbits...). Index i ↔ SAVE_LETTERS[i] (Toolbox number2letter).
export const SAVE_LETTERS = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ肥肢肖肋肉職耐者箱管算箔策答筒筍白発癒痛痕病疾疲潤潜漬漠演漏漁滞毎殻殺段殖残歳歯歩武歓欲次欠櫛機色村材杉本末未木授掃捧彼役影彫彩胃堪城坑努助加功力創割借候倒老個景是明昇早既掴担想扉戻懸懲憩態感蛮蛍虫虚蘇薬薄蔵'

export function hasSaveLetter(codes, index) {
  const letter = SAVE_LETTERS[index]
  return Boolean(letter) && String(codes ?? '').includes(letter)
}
