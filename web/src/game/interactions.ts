const gen = require('random-seed');

interface Inflict {
  name: 'inflict';
  keywords: Keyword[];
}

interface Discard {
  name: 'discard';
  value: number;
}

interface Empower {
  name: 'empower';
  keywords: Keyword[];
}

interface Flip {
  name: 'flip';
  keywords: Keyword[];
}

interface Swap {
  name: 'swap';
}

interface Plus {
  name: 'plus';
  value: number;
}

interface Immune {
  name: 'immune';
}

interface Squelch {
  name: 'squelch';
}

interface Draw {
  name: 'draw';
  value: number
}

export type Keyword = Flip |
  Inflict |
  Empower |
  Swap |
  Plus |
  Discard |
  Immune |
  Draw |
  Squelch;


const PRIORITY_LIST = [
  'immune',
  'squelch',

  'flip',

  'inflict',
  'plus',

  'discard',
  'draw',

  'empower',

  'swap',
];

interface OwnedKeyword {
  isOther: boolean;
  keyword: Keyword;
}

export function isWinner(
  power: number,
  keywords: Keyword[],
  otherPower: number,
  otherKeywords: Keyword[],
  isFirst: boolean,
  seed: string,
): boolean {
  const stats = {
    power,
    immune: false,
  }
  const otherStats = {
    power: otherPower,
    immune: false,
  }
  const rand = gen.create(seed);
  const ownedKeywords = keywords.map(keyword => ({ isOther: false, keyword }));
  const otherOwnedKeywords = otherKeywords.map(keyword => ({ isOther: true, keyword }));
  let allKeywords: OwnedKeyword[] = isFirst
    ? [...ownedKeywords, ...otherOwnedKeywords]
    : [...otherOwnedKeywords, ...ownedKeywords];

  while(allKeywords.length > 0) {
    allKeywords.sort((a, b) => PRIORITY_LIST.indexOf(a.keyword.name) - PRIORITY_LIST.indexOf(b.keyword.name));
    const { isOther, keyword } = allKeywords.shift() as OwnedKeyword;
    switch (keyword.name) {
      case 'immune': {
        if (isOther) {
          otherStats.immune = true;
        } else {
          stats.immune = true;
        }
        break;
      }
      case 'squelch': {
        if (isOther && stats.immune) break;
        if (!isOther && otherStats.immune) break;
        allKeywords = allKeywords.filter(ownedKeyword => ownedKeyword.isOther === isOther
          || ownedKeyword.keyword.name === 'squelch');
        break;
      }
      case 'flip': {
        const heads = rand(2) === 1;
        if (heads) {
          allKeywords.push({ keyword: keyword.keywords[0], isOther });
        } else {
          allKeywords.push({ keyword: keyword.keywords[1], isOther });
        }
        break;
      }
      case 'inflict': {
        if (isOther && stats.immune) break;
        if (!isOther && otherStats.immune) break;
        keyword.keywords
          .forEach(kw => allKeywords.push({ keyword: kw, isOther: !isOther }));
        break;
      }
      case 'plus': {
        if (isOther) {
          otherStats.power += keyword.value;
        } else {
          stats.power += keyword.value;
        }
        break;
      }
      case 'discard': {
        // TODO: card discard
        break;
      }
      case 'draw': {
        // TODO: card draw
        break;
      }
      case 'empower': {
        // TODO: empower
        break;
      }
      case 'swap': {
        if (isOther && stats.immune) break;
        if (!isOther && otherStats.immune) break;
        const temp = stats.power;
        stats.power = otherStats.power;
        otherStats.power = temp;
        break;
      }
    }
  }
  return stats.power > otherStats.power;
}

export function keywordToText(kw: Keyword): string {
  switch(kw.name) {
    case 'draw': {
      return `Draw ${kw.value}`;
    }
    case 'squelch': {
      return 'Squelch';
    }
    case 'immune': {
      return 'Immune';
    }
    case 'plus': {
      if (kw.value >= 0) {
        return `+${kw.value}`;
      } else {
        return `${kw.value}`;
      }
    }
    case 'swap': {
      return 'Swap';
    }
    case 'flip': {
      return `Flip: (${keywordToText(kw.keywords[0])}) | (${keywordToText(kw.keywords[1])})`;
    }
    case 'empower': {
      return `Empower: ${kw.keywords.map(keywordToText).join(', ')}`;
    }
    case 'discard': {
      return `Discard ${kw.value}`;
    }
    case 'inflict': {
      return `Inflict: ${kw.keywords.map(keywordToText).join(', ')}`;
    }
  }
}
