const MIRROR = 'https://ipfs.io/ipfs';

export function getHttpMirror(uri: string): string {
  if (uri.substr(0, 7) !== 'ipfs://') {
    throw new Error('not a valid ipfs uri');
  }
  return `${MIRROR}/${uri.substr(7)}`;
}

export async function getData(uri: string): Promise<any> {
  const url = getHttpMirror(uri);
  const res = await fetch(url);
  return await res.json();
}
