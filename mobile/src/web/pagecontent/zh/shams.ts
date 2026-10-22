import type { ShamsPart } from "../../shamsContent";
// Chinese: the parts of the Shams Method shown on the app's Shams tab and the core of /shams; the rest falls back to
// English (see shamsContent.ts). No Quran or hadith text is typed here.
const c: ShamsPart = {
  heroKicker: "Quran Masterclass · 学习方法",
  heroTitle: "Shams 方法",
  heroLead: "一种让古兰经真正记得住的学习方式：每一节经文都要聆听、诵读、理解、讲解、凭记忆回想，并与您的生活相连——共七个步骤，视经文长短约需两到八分钟。语言学习与记忆研究对记忆保持的认识，与古兰经教师数百年来的教学方式融为一体。",
  heroBy: "由 Nami Shams 在迪拜创立",
  heroFacts: [
    { n: "7", l: "每节经文的步骤" },
    { n: "2–8", l: "学习一节新经文的分钟数（视长短而定）" },
    { n: "3–6", l: "经文记牢时三个月内的复习次数——不稳时更多" },
  ],
  stepsTitle: "七个步骤详解",
  stepsLead: "每个步骤都有一个明确的任务。所有步骤加起来，每节经文视长短约需两到八分钟。平台会引导您完成每一步——您无需做任何准备。",
  labels: { what: "您要做什么", why: "为什么有效", platform: "平台为您做什么", time: "用时" },
  steps: [
    { what: "您连续聆听三遍经文，同时用目光跟随阿拉伯文原文。暂时没有译文，也不跟着念——只是听和看。", time: "约 45 秒" },
    { what: "经文从结尾开始构建：先只有最后一个词，然后是最后两个词，再是最后三个词——直到整节经文。每一次您都跟着念。", time: "约 60 秒" },
    { what: "您逐词学习经文：阿拉伯文单词、音译、含义。", time: "约 30 秒" },
    { what: "您阅读整节经文的译文，并运用记忆钩子：关键词、节末的韵脚、通向下一节的衔接——如果愿意，还可以写下您自己的记忆提示。", time: "约 40 秒" },
    { what: "您阅读经典的讲解：上下文、降示背景以及学者们对此的教导。", time: "约 45 秒" },
    { what: "单词分阶段消失：起初您只看到每个词的首字母，然后什么也看不到。您凭记忆诵读，再揭开原文，诚实地为自己评分。", time: "约 40 秒" },
    { what: "您写下一两句话：这节经文告诉我关于安拉的什么？关于我自己的什么？今天我要从中带走什么？", time: "约 30 秒" },
  ],
  demoTitle: "一节经文，四个阶段",
  demoStages: ["整节经文", "倒序构建", "仅首字母", "凭记忆"],
  finalTitle: "您的第一节经文只需几分钟",
  finalLead: "从开端章开始。平台会引导您完成每一步。",
  finalPoints: ["无需任何准备——平台会引导您完成每一步。", "每个词下方都显示音译和含义。", "之后，记忆模型会为您安排复习。"],
  whyCloseApp: "这就是 Shams 方法存在的原因：让任何人都不必推迟人生中最重要的学习。",
};
export default c;
