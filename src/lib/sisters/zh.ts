import type { SistersText } from "./types";

// “姐妹专区” – Chinese (Simplified) translation of en.ts.
const zh: SistersText = {
  kicker: "姐妹专区",
  title: "您的学习每天都在继续",
  lead: "月经期（ḥayḍ）和产后血期（nifās）诵读方面有哪些变化，Shams 方法如何继续，以及传述和教授古兰经的女性。学习从不停止；在某些学派看来，改变的只是学习的形式。",
  reviewLine: "内容正在由学者审阅",
  notFatwa: "这是一份概述，不是教法判令（法特瓦）。请向您信任的学者请教，尤其是您所遵循学派的学者。",
  sourcesTitle: "出处",
  schools: { hanafi: "哈乃斐派", maliki: "马立克派", shafii: "沙斐仪派", hanbali: "罕百里派", jafari: "加法尔派（什叶派）", majority: "多数学者", contemporary: "当代教法机构" },
  open: "打开",
  readVerse: "在古兰经中阅读和聆听",
  entryTitle: "姐妹专区",
  entryLead: "月经期间的诵读、Shams 方法中的聆听与理解日，以及传承古兰经的女性。",
  entryCta: "查看",

  partRecite: {
    title: "诵读、背记与古兰经经本",
    lead: "各学派的分歧主要在于凭记忆诵读。根据此处列出的所有出处，聆听、记念（迪克尔）和祈祷都是允许的。",
    blocks: [
      {
        id: "memory",
        title: "凭记忆诵读",
        positions: [
          { school: "hanafi", text: "以诵读为举意时不允许，即使不足一节也不行。允许的是：以祈祷、记念或求护佑为举意而念的经文，以及不出声只用眼睛阅读。女教师可以逐词停顿地教授，因为这不算作诵读。", src: ["arij", "sgHanafi"] },
          { school: "maliki", text: "在出血持续期间，月经期的妇女——根据埃及教法判令院（Dar al-Ifta）的观点，产后血期的妇女也一样——可以凭记忆诵读，无论她是否担心遗忘。出血停止后、洗大净之前，只有在担心遗忘时才可以。", src: ["ifta12343"] },
          { school: "shafii", text: "即使一节也不允许。作为记念而念的古兰经语句是允许的。", src: ["sgShafii"] },
          { school: "hanbali", text: "本学派的立场是禁止。伊本·泰米叶认为诵读是允许的，在产后血期担心遗忘时也是如此。", src: ["muftiwp18", "iqa2564"] },
          { school: "jafari", text: "根据阿亚图拉西斯塔尼的观点，只有四节叩头经文被禁止（32:15、41:37、53:62、96:19）——仅指该节经文本身，而非整章。其他经文不在所列的禁止事项之内。产后血期同样适用，作为必须的谨慎。", src: ["sistani354", "sistani448", "sistani502"] },
          { school: "contemporary", text: "马来西亚联邦直辖区穆夫提认为，复习自己背记的内容是允许的，在背经学校中也是如此。islamqa.info 认为允许的观点依据更充分，并谨慎地建议只诵读担心会遗忘的部分。", src: ["muftiwp18", "iqa2564"] },
        ],
      },
      {
        id: "mushaf",
        title: "触摸古兰经经本",
        positions: [
          { school: "majority", text: "根据多数学者的观点，没有洁净时不允许触摸古兰经经本。", src: ["iqa2564"] },
          { school: "hanafi", text: "用不与身体相连的单独布料或套子隔开是允许的。", src: ["bham"] },
          { school: "maliki", text: "正在学习或教学的妇女，在学习或教学期间可以触摸和携带古兰经经本或其一部分。埃及教法判令院一般建议遵循多数学者的观点，但在确有需要时——背记、教学、以教学为职业——允许遵循马立克派的观点而无罪。", src: ["ifta12343"] },
          { school: "jafari", text: "触摸古兰经的文字是被禁止的。", src: ["sistani354", "sistani448"] },
        ],
      },
      {
        id: "screen",
        title: "通过屏幕或应用",
        positions: [
          { school: "contemporary", text: "islamqa.info：手机不是古兰经经本；没有洁净时也可以触摸。埃及教法判令院：根据多数学者的观点，无论通过何种媒介，诵读都是禁止的；不出声地看屏幕是允许的。", src: ["iqa106961", "ifta7815"] },
          { school: "hanafi", text: "Darul Iftaa Azaadville：当屏幕上显示古兰经文字时，屏幕及该页面上的图标适用古兰经经本的教法；请不要直接触摸，可以使用触控笔。聆听是允许的。", src: ["azaad"] },
        ],
      },
      {
        id: "always",
        title: "始终不变的",
        points: [
          { text: "聆听：听诵读是允许的；哈乃斐派的出处称之为非常值得称赞，听录音也是如此。马来西亚穆夫提办公室建议以聆听代替复习。", src: ["azaad", "sgHanafi", "muftiwp18"] },
          { text: "记念和祈祷是允许的；多数学者正是将这两者排除在禁止之外，只要不是以诵读为目的。", src: ["iqa2564", "sgShafii"] },
          { text: "先知ﷺ曾在阿伊莎（ʿĀʾisha）月经期间头枕在她的膝上诵读古兰经。与古兰经的亲近始终都在。", src: ["bukhari297", "muslim301"] },
        ],
      },
    ],
  },

  partShams: {
    title: "Shams 方法如何继续",
    lead: "在聆听与理解日，您的背记（ḥifẓ）无需出声诵读也能保持鲜活。您的连续天数和花园会继续增长。",
    steps: [
      { id: "listen", title: "通过聆听背记", text: "跟随一位诵读大师聆听今天的新课（sabaq）、您的近课（sabqī）和旧课（manzil），逐节聆听并重复多次。", src: ["muftiwp18", "sgHanafi"] },
      { id: "eyes", title: "用眼睛跟读", text: "不出声地默默跟读。跟读时是否触摸屏幕，取决于您所遵循的学派（见上文）。", src: ["sgHanafi", "ifta7815", "azaad"] },
      { id: "understand", title: "理解（tadabbur）", text: "您所学经文的含义、经注和背景：即 Shams 方法中的“理解”步骤。" },
      { id: "words", title: "词汇", text: "您所学经文中的词语及其词根，配有记忆卡片。" },
      { id: "tajweed", title: "诵读规则理论与发音部位（makhārij）", text: "学习规则，查看口腔示意图和发音部位的说明。是否出声练习单个字母，请向您的老师确认。" },
      { id: "dua", title: "记念与祈祷", text: "祈祷和记念伴随每一天。", src: ["iqa2564"] },
    ],
    notes: [
      { text: "遵循哈乃斐派的女教师可以逐词停顿地教授。", src: ["arij"] },
      { text: "遵循马立克派的人在出血持续期间可以继续诵读，并且在学习或教学期间可以触摸古兰经经本。", src: ["ifta12343"] },
      { text: "出血停止后：在马立克派中，只有洗大净之后才可以再次诵读，除非她担心遗忘。", src: ["ifta12343"] },
    ],
  },

  partSajda: {
    title: "诵读叩头（sajdat al-tilāwa）",
    lead: "当您听到或读到叩头经文时适用的规定。",
    positions: [
      { school: "hanafi", text: "在月经期和产后血期既不允许也不有效，既不成为应尽的义务，事后也无需补做。", src: ["sgSajda"] },
      { school: "majority", text: "洁净是条件；因此不做叩头（萨拉赫西、伊本·朱宰、纳瓦威、鲁海巴尼）。", src: ["ifta24156"] },
      { school: "contemporary", text: "另一种观点认为不要求洁净（伊本·泰米叶、绍卡尼）。埃及教法判令院倾向多数学者的观点，但认为遵循另一种观点的妇女没有罪。", src: ["ifta24156"] },
      { school: "jafari", text: "根据西斯塔尼的观点，诵读或听到四节叩头经文中的任何一节时，叩头是必须的；为此不要求小净或大净。从录音中听到时，叩头不成为必须——这包括本应用中的诵读。", src: ["sistani1079"] },
    ],
  },

  partWomen: {
    title: "女性与古兰经",
    lead: "用于“理解”步骤：关于女性的经文，以及保存、教授和诵读古兰经的女性。",
    versesTitle: "值得思考的经文",
    verses: [
      { ref: "33:35", topic: "信士与信女并列提及，所得的报酬相同。" },
      { ref: "3:195", topic: "无论男女，任何善行都不会白费。" },
      { ref: "4:124", topic: "有信仰的男女所行的善功引向天园。" },
      { ref: "16:97", topic: "行善并有信仰的人，无论男女，都将获得美好的生活。" },
      { ref: "58:1", topic: "真主听见了那位为丈夫之事申诉的妇女；这一章以她命名（al-Mujādila，辩诉者）。" },
      { ref: "66:11", topic: "法老之妻祈求在天园中得一座房屋。" },
      { ref: "66:12", topic: "麦尔彦，她确信她的主的言辞。" },
      { ref: "3:42", topic: "麦尔彦被拣选并被净化（至 3:43）。" },
      { ref: "28:7", topic: "对穆萨之母的启示：你不要害怕，也不要忧愁。" },
    ],
    companionsTitle: "传承古兰经的女圣门弟子",
    companions: [
      { text: "哈芙赛·宾特·欧麦尔保管了艾布·伯克尔汇集古兰经的册页（ṣuḥuf）；奥斯曼依据这些册页抄制了副本，然后将册页归还给她。", src: ["bukhari4986", "bukhari4987"] },
      { text: "温姆·瓦拉格诵读古兰经；先知ﷺ允许她在家中有一位宣礼员，并吩咐她带领家人礼拜。", src: ["abudawud591", "abudawud592"] },
      { text: "阿伊莎解释经文并纠正对经文的理解，例如对 2:158 和 4:3 的理解。", src: ["bukhari1643", "muslim3018"] },
      { text: "温姆·赛莱麦描述了先知ﷺ如何逐节诵读开端章（al-Fātiḥa），每节之后停顿——这是诵读规则和停读（waqf）的一个基础。", src: ["abudawud4001", "tirmidhi2927"] },
    ],
    scholarsTitle: "女学者",
    scholars: [
      { text: "卡丽玛·麦尔瓦齐耶（1069 年卒于麦加）是传述《布哈里圣训实录》（Ṣaḥīḥ al-Bukhārī）的权威。", src: ["karima"] },
      { text: "法蒂玛·宾特·穆罕默德·撒马尔罕迪能背诵她父亲的教法著作；教法判令上除了她父亲和丈夫的笔迹外，还有她的笔迹。", src: ["samarqandi"] },
      { text: "穆罕默德·阿克拉姆·纳德维用阿拉伯语编写了一部约 40 卷的女性圣训学者辞典；其导论以“Al-Muhaddithat: The Women Scholars in Islam”为题出版。", src: ["nadwi"] },
    ],
    recitersTitle: "女诵读家",
    reciters: [
      { text: "马来西亚国际古兰经诵读比赛设有女诵读家（qāriʾa）的专门组别；获胜者包括马来西亚的 Rogayah Sulong 和 Faridah Mat Saman，以及印度尼西亚的 Maria Ulfah。", src: ["mtq", "aljazeera"] },
      { text: "埃及女诵读家谢赫娃·迈布鲁卡（Shaykha Mabrūka）1905 年的一段录音保存至今；如今有一些倡议正在让女诵读家重新被看见。", src: ["aljazeera"] },
    ],
  },

  partTogether: {
    title: "跟女教师和姐妹们一起学习",
    lead: "诵读是通过聆听并在老师面前诵读来学习的。",
    teacher: "将您的 Shams 方法与您选择的女教师连接：她可以看到您的计划，以及您发送给她的录音。",
    circles: "在“一起”中有仅限姐妹参加的学习小组。",
    teacherCta: "连接老师",
    circlesCta: "姐妹学习小组",
  },

  setup: {
    title: "设置“姐妹专区”吗？",
    lead: "一个可选的区域，每天陪伴您的学习。",
    points: [
      "您选择自己遵循的教法学派。在您的特殊日子里暂停哪些内容，将以此为依据。",
      "“我的日子”是一个简单的开关：是或否。没有日期，没有记录，没有周期日历。",
      "所有内容只保存在这台设备上。不会与您的账户同步，也不会发送到服务器或人工智能；退出登录时会被删除。",
      "您可以随时更改或关闭。",
    ],
    agree: "是，进行设置",
    decline: "不用了，谢谢",
    declined: "好的。我们不会再询问任何问题。“姐妹专区”页面仍在“发现”中向您开放。",
    madhhabTitle: "您遵循哪个教法学派？",
    madhhabLead: "如果您不清楚，将适用多数学者的谨慎观点。",
    madhhabs: { hanafi: "哈乃斐派", maliki: "马立克派", shafii: "沙斐仪派", hanbali: "罕百里派", jafari: "加法尔派（什叶派）", unknown: "我不清楚" },
    done: "完成",
    later: "您可以在“发现 → 姐妹专区”中找到所有内容。",
  },

  days: {
    title: "我的日子",
    lead: "一个开关，只在这台设备上。开启期间，应用会暂停您所遵循的学派在这些日子里不允许的内容，并开启聆听与理解日。您的连续天数和花园保持不变；复习会顺延，而不会堆积。",
    question: "您现在正处于特殊日子吗？",
    yes: "是",
    no: "否",
    statusOn: "已开启：聆听与理解日正在进行。",
    statusOff: "已关闭。",
    rules: {
      hanafi: "哈乃斐派：凭记忆诵读和诵读练习暂停。聆听、用眼睛跟读、理解、词汇、诵读规则理论和祈祷保留。",
      maliki: "马立克派：出血持续期间仍允许凭记忆诵读。应用会提醒您这一点，而不是暂停。只在学习或教学期间触摸古兰经经本。",
      shafii: "沙斐仪派：凭记忆诵读和诵读练习暂停。聆听、用眼睛跟读、理解、词汇、诵读规则理论和祈祷保留。",
      hanbali: "罕百里派：凭记忆诵读和诵读练习暂停（本学派的立场）。聆听、跟读、理解、词汇、诵读规则理论和祈祷保留。",
      jafari: "加法尔派：请跳过四节叩头经文（32:15、41:37、53:62、96:19）；应用会标示出来。对于大不洁（janāba）状态，西斯塔尼（第 355 条）称诵读超过七节为可憎（makrūh）；这是否适用于月经期，请向您的效仿权威（marjaʿ）请教。",
      unknown: "多数学者的谨慎观点：凭记忆诵读和诵读练习暂停。聆听、用眼睛跟读、理解、词汇、诵读规则理论和祈祷保留。",
    },
    strictTitle: "严格模式",
    strictLead: "这是您自己的选择：在您的特殊日子里，除聆听和祈祷外一切暂停，包括经注和词汇。主要学派都没有这样要求；聆听、经注和祈祷是允许的。",
    offTitle: "我已恢复洁净",
    offNote: "出血停止后，必须洗大净（ghusl）；在马立克派中，只有洗大净之后才可以再次诵读，除非她担心遗忘。",
    ghuslLink: "前往大净指南",
    privacy: "只在这台设备上。没有日期，没有记录，不会传输。退出登录时删除。",
    changeMadhhab: "更改教法学派",
  },

  gate: {
    pausedTitle: "暂停，直到您的特殊日子结束",
    pausedMajority: "根据您所遵循的学派，在这些日子里不凭记忆诵读。您的背记（ḥifẓ）依然鲜活：今天聆听同样的经文，并学习它们的含义。",
    pausedStrict: "您选择了严格模式：今天保留聆听和祈祷。",
    noteMaliki: "根据马立克派，在出血持续期间您可以凭记忆诵读。",
    noteJafari: "请跳过叩头经文 32:15、41:37、53:62 和 96:19。",
    listenInstead: "今天以聆听代替诵读",
    toSection: "姐妹专区",
    openAnyway: "仍然打开",
  },

  ld: {
    title: "聆听与理解日",
    lead: "当您无法或不想出声诵读时——旅行中、嗓子沙哑、在您的特殊日子里：您的每日功课（wird）变为聆听、理解和词汇。连续天数和花园保持不变。",
    on: "聆听与理解日",
    onHint: "一个简单的开关，类似旅行模式，只在这台设备上。不保存任何日期。",
    activeTitle: "今天：聆听与理解日",
    activeLead: "您的背记（ḥifẓ）无需出声诵读也能保持鲜活。",
    done: "完成聆听日",
    doneMsg: "Mā shāʾ Allāh（真主意欲）。您的聆听日计入您的连续天数和花园。",
    off: "恢复诵读",
    sistersLink: "给姐妹的说明",
  },
};
export default zh;
