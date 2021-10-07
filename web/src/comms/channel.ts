const APP = 'super-card-game';
const VERSION = 1;
const ENCODING = 'json';

type MatchmakingChannelOpts = {
  key: 'matchmaking',
}

type GameChannelOpts = {
  key: 'game',
  id: string,
}

type ChannelOpts = MatchmakingChannelOpts | GameChannelOpts;

export class Channel {
  contentTopic: string;

  constructor(opts: ChannelOpts) {
    const name = 'id' in opts ? `${opts.key}-${opts.id}` : opts.key;
    this.contentTopic = `${APP}/${VERSION}/${name}/${ENCODING}`;
  }

  getContentTopic(): string {
    return this.contentTopic;
  }
}

export const matchmaking = new Channel({ key: 'matchmaking' });

export function CreateGameChannel(id: string) {
  return new Channel({ key: 'game', id });
}
