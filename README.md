# Super Card Game

Super Card Game is an NFT trading card game with real-time gameplay. It features card
collecting, deck building, and online matchmaking.

Check out the [demo](https://0408s2lida82j3igmivbict8m8lobqs8no39hi4m3te03hjthufg5p0.siasky.net/)
on Polygon Testnet.

See our ETHOnline showcase [here](https://showcase.ethglobal.com/ethonline2021/super-card-game).

# Development

## Requirements

- Node 14 (can be installed with [nvm](https://github.com/nvm-sh/nvm))
- [Metamask](https://metamask.io) installed in your browser

## Ethereuem/IPFS Side

### Install

```bash
npm install
```

### Uploading Image Metadata to IPFS

Get an API key from (nft.storage)[https://nft.storage] and either save
it to a file named `.env` or use it as an environment variable.

**`.env`**
```
NFT_STORAGE_API_KEY="your api key here"
```

```bash
npm run upload-cards
```

### Running local node

```bash
npm run node
```

As long as this command is running, the local node is running. Once you close
the terminal or stop it with Ctrl-C, the local node is stopped.

Take note of the accounts listed and their private keys. You can use one of them
later if you need an account with a lot of funds.

### Deploy NFT to local node

With the local node running in a separate terminal:

 ```bash
 npm run deploy
 ```

## Web Side

```bash
cd ./web
```

### Install

```bash
npm install
```

### Start React Server

With the local node running in a separate terminal and the NFT deployed:

```bash
npm start
```

## Metamask Setup

You should have a local node running prior to this.

### Change the chain id of Localhost 8485 to 31337

- Click the metamask extension
- Account button (circle) on the top right
- Settings
- Networks
- Localhost 8485
- Change chain id to 31337
- Save

### Switch chain to Localhost 8485

- Click the metamask extension
- Dropdown that says 'Ethereuem Mainnet'
- Switch to Localhost 8485

### Use an account with a lot of funds

- Click the metamask extension
- Account button (circle) on the top right
- Import account
- Paste a private key from when you first ran the local node
