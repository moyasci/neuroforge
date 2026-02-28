// 分野別読解ガイド - 分野ごとの認識論に基づく読解モードの使い分け

export interface ReadingGuide {
  domain: string;
  label: string;
  priorities: string[];
  evaluationAxes: string[];
  criticalQuestions: string[];
}

export const READING_GUIDES: Record<string, ReadingGuide> = {
  stem: {
    domain: "stem",
    label: "自然科学・STEM",
    priorities: [
      "手法の再現性",
      "データの透明性",
      "統計的有意性",
    ],
    evaluationAxes: ["客観的事実の積み上げ"],
    criticalQuestions: [
      "この実験は独立して再現可能か？",
      "サンプルサイズは統計的結論を支持するのに十分か？",
      "対照群は適切に設定されているか？",
      "交絡変数はコントロールされているか？",
      "統計的手法は適切か？p-hackingの兆候はないか？",
    ],
  },
  social_science: {
    domain: "social_science",
    label: "社会科学",
    priorities: [
      "理論とデータの整合性",
      "調査対象の代表性",
      "文脈の記述",
    ],
    evaluationAxes: ["実証データと理論の橋渡し"],
    criticalQuestions: [
      "理論的枠組みはデータの解釈を適切に支持しているか？",
      "サンプルは母集団を代表しているか？",
      "文化的・社会的文脈が十分に考慮されているか？",
      "因果関係と相関関係の区別は明確か？",
      "測定手法の妥当性と信頼性は確認されているか？",
    ],
  },
  humanities: {
    domain: "humanities",
    label: "人文科学",
    priorities: [
      "論理的一貫性",
      "解釈の独創性",
      "文献の批判的扱い",
    ],
    evaluationAxes: ["多面的解釈と意味の生成"],
    criticalQuestions: [
      "著者の議論は内部的に一貫しているか？",
      "先行研究に対する批判的な位置づけは十分か？",
      "代替的な解釈の可能性は検討されているか？",
      "使用されている概念の定義は明確か？",
      "論証の前提に隠れた価値判断はないか？",
    ],
  },
  applied: {
    domain: "applied",
    label: "応用・専門職",
    priorities: [
      "実務適用可能性",
      "費用対効果",
      "倫理的含意",
    ],
    evaluationAxes: ["行動に結びつく有用性"],
    criticalQuestions: [
      "この知見は実際の現場でどのように適用できるか？",
      "実装のコストと期待される効果のバランスは？",
      "倫理的なリスクや副作用は考慮されているか？",
      "スケーラビリティはどの程度か？",
      "既存の実践と比較してどのような利点があるか？",
    ],
  },
};

export const READING_GUIDE_SYSTEM_PROMPT = `あなたは分野横断的な学術読解のガイドです。

## 役割
ユーザーが論文を読む際に、その論文の分野に応じた適切な読解アプローチを提案します。

## 4パス読解法
1. **概観（Pass 1）**: タイトル、要旨、見出しで全体像を把握
2. **結論確認（Pass 2）**: 結論・考察から主要発見と主張の妥当性を評価
3. **データ解析（Pass 3）**: 図、表、キャプションからデータを直接理解
4. **詳細精読（Pass 4）**: 序論、方法、結果を精読し知識ギャップを特定

各パスの終了時に、分野に応じた批判的質問を3-5個投げかけてください。
`;
