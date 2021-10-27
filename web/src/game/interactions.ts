export interface Inflict {
  name: "inflict";
  keywords: Keyword[];
}

export interface Discard {
  name: "discard";
  value: number;
}

export interface Empower {
  name: "empower";
  keywords: Keyword[];
}

export interface Flip {
  name: "flip";
  keywords: Keyword[];
}

export interface FlipResult {
  name: "flip-result";
  keywords: Keyword[];
  heads: boolean;
}

export interface Swap {
  name: "swap";
}

export interface Plus {
  name: "plus";
  value: number;
}

export interface Immune {
  name: "immune";
}

export interface Squelch {
  name: "squelch";
}

export interface Draw {
  name: "draw";
  value: number;
}

export interface FailedKeyword {
  name: "fail";
  keyword: Keyword;
}

export interface OwnedKeywordResult {
  isOther: boolean;
  result:
    | Inflict
    | Discard
    | Empower
    | FlipResult
    | Swap
    | Plus
    | Immune
    | Squelch
    | Draw
    | FailedKeyword;
}

export type Keyword =
  | Flip
  | Inflict
  | Empower
  | Swap
  | Plus
  | Discard
  | Immune
  | Draw
  | Squelch;

const PRIORITY_LIST = [
  "immune",
  "squelch",

  "flip",

  "inflict",
  "plus",

  "discard",
  "draw",

  "empower",

  "swap",
];

interface OwnedKeyword {
  isOther: boolean;
  keyword: Keyword;
}

export interface InteractionResult {
  keywords: OwnedKeywordResult[];
  won: boolean;
  otherWon: boolean;
}

export function computeInteraction(
  power: number,
  keywords: Keyword[],
  otherPower: number,
  otherKeywords: Keyword[],
  isFirst: boolean,
  randInt: (range: number) => number
): InteractionResult {
  const stats = {
    power,
    immune: false,
  };
  const otherStats = {
    power: otherPower,
    immune: false,
  };
  const ownedKeywords = keywords.map((keyword) => ({
    isOther: false,
    keyword,
  }));
  const otherOwnedKeywords = otherKeywords.map((keyword) => ({
    isOther: true,
    keyword,
  }));
  let allKeywords: OwnedKeyword[] = isFirst
    ? [...ownedKeywords, ...otherOwnedKeywords]
    : [...otherOwnedKeywords, ...ownedKeywords];

  const emittedKeywords: OwnedKeywordResult[] = [];

  while (allKeywords.length > 0) {
    allKeywords.sort(
      (a, b) =>
        PRIORITY_LIST.indexOf(a.keyword.name) -
        PRIORITY_LIST.indexOf(b.keyword.name)
    );
    const { isOther, keyword } = allKeywords.shift() as OwnedKeyword;

    switch (keyword.name) {
      case "immune": {
        if (isOther) {
          otherStats.immune = true;
        } else {
          stats.immune = true;
        }
        emittedKeywords.push({ isOther, result: keyword });
        break;
      }
      case "squelch": {
        if (isOther && stats.immune) {
          emittedKeywords.push({ isOther, result: { name: "fail", keyword } });
          break;
        }
        if (!isOther && otherStats.immune) {
          emittedKeywords.push({ isOther, result: { name: "fail", keyword } });
          break;
        }
        allKeywords = allKeywords.filter(
          (ownedKeyword) =>
            ownedKeyword.isOther === isOther ||
            ownedKeyword.keyword.name === "squelch"
        );
        emittedKeywords.push({ isOther, result: keyword });
        break;
      }
      case "flip": {
        const heads = randInt(2) === 1;
        if (heads) {
          allKeywords.push({ keyword: keyword.keywords[0], isOther });
        } else {
          allKeywords.push({ keyword: keyword.keywords[1], isOther });
        }
        emittedKeywords.push({
          isOther,
          result: { ...keyword, name: "flip-result", heads },
        });
        break;
      }
      case "inflict": {
        if (isOther && stats.immune) {
          emittedKeywords.push({ isOther, result: { name: "fail", keyword } });
          break;
        }
        if (!isOther && otherStats.immune) {
          emittedKeywords.push({ isOther, result: { name: "fail", keyword } });
          break;
        }
        allKeywords = allKeywords.concat(
          keyword.keywords.map((kw) => ({ keyword: kw, isOther: !isOther }))
        );
        emittedKeywords.push({ isOther, result: keyword });
        break;
      }
      case "plus": {
        if (isOther) {
          otherStats.power += keyword.value;
        } else {
          stats.power += keyword.value;
        }
        emittedKeywords.push({ isOther, result: keyword });
        break;
      }
      case "discard": {
        emittedKeywords.push({ isOther, result: keyword });
        break;
      }
      case "draw": {
        emittedKeywords.push({ isOther, result: keyword });
        break;
      }
      case "empower": {
        emittedKeywords.push({ isOther, result: keyword });
        break;
      }
      case "swap": {
        if (isOther && stats.immune) {
          emittedKeywords.push({ isOther, result: { name: "fail", keyword } });
          break;
        }
        if (!isOther && otherStats.immune) {
          emittedKeywords.push({ isOther, result: { name: "fail", keyword } });
          break;
        }
        const temp = stats.power;
        stats.power = otherStats.power;
        otherStats.power = temp;
        emittedKeywords.push({ isOther, result: keyword });
        break;
      }
    }
  }
  return {
    keywords: emittedKeywords,
    won: stats.power > otherStats.power,
    otherWon: otherStats.power > stats.power,
  };
}

export function keywordToTextPlus(
  kw: Keyword | FlipResult | FailedKeyword
): string {
  switch (kw.name) {
    case "flip-result": {
      if (kw.heads) {
        return `Flip Heads: ${keywordToText(kw.keywords[0])}`;
      } else {
        return `Flip Tails: ${keywordToText(kw.keywords[1])}`;
      }
    }
    case "fail": {
      return `${keywordToText(kw.keyword)} - Failed due to Immune`;
    }
  }
  return keywordToText(kw);
}

export function keywordToText(kw: Keyword): string {
  switch (kw.name) {
    case "draw": {
      return `Draw ${kw.value}`;
    }
    case "squelch": {
      return "Squelch";
    }
    case "immune": {
      return "Immune";
    }
    case "plus": {
      if (kw.value >= 0) {
        return `+${kw.value}`;
      } else {
        return `${kw.value}`;
      }
    }
    case "swap": {
      return "Swap";
    }
    case "flip": {
      return `Flip: (${keywordToText(kw.keywords[0])}) | (${keywordToText(
        kw.keywords[1]
      )})`;
    }
    case "empower": {
      return `Empower: ${kw.keywords.map(keywordToText).join(", ")}`;
    }
    case "discard": {
      return `Discard ${kw.value}`;
    }
    case "inflict": {
      return `Inflict: ${kw.keywords.map(keywordToText).join(", ")}`;
    }
  }
}
