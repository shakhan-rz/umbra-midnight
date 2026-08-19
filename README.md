# Umbra 🌑→🌕 — verified, anonymous feedback on Midnight

A privacy-first dApp built on the **Midnight** blockchain for the Rise In
**"New Moon to Full: Monthly Moonshots on Midnight"** program.

Midnight uses the **Compact** smart-contract language (zero-knowledge circuits),
the **Lace** wallet, and a Docker-based **proof server**. This repo starts from
the official `example-hello-world` template and grows through the six moon
phases below.

> Status: **🌑 Level 1 (New Moon)** — toolchain + first Compact contract.

---

## 💡 The idea — Umbra

**Umbra lets verified members of a community leave honest feedback that is
provably authentic but completely anonymous.** A person proves — in zero
knowledge — that they hold a valid membership credential, so their post counts
as coming from a real, authorized member; yet the contract never learns *which*
member wrote it. The feedback text is written to public ledger state for
everyone to read, while the author's identity stays a **private witness** that
never leaves their device. This is exactly what Midnight is for: the useful
fact ("a real member said this") is public, and the sensitive fact ("who")
stays private. Level 1 ships the minimal core — a public message store — and
later phases add the membership proof, categories, and a Lace-connected UI.

---

## 🌙 Roadmap (moon phases)

| Phase | Level | Goal | Status |
|---|---|---|---|
| 🌑 New Moon | 1 | Toolchain + first Compact contract, deploy to Preview/Preprod, seed idea | 🔨 in progress |
| 🌒 Waxing Crescent | 2 | Connect contract to a frontend + Lace wallet on Preprod | ⬜ |
| 🌓 First Quarter | 3 | Production-grade dApp + tests + CI/CD + pick problem statement | ⬜ |
| 🌓 Idea Submission | — | Submit concept, get approval | ⬜ |
| 🌔 Waxing Gibbous | 4 | MVP live on Preprod + docs + public X profile | ⬜ |
| 🌕 Full Moon | 5 | Feedback loop + 50 Preprod test users | ⬜ |
| 🌝 Supermoon | 6 | Mainnet launch + 20 mainnet users + brand assets | ⬜ |

---

## 🧰 Prerequisites (Windows)

The Compact toolchain runs on **Linux/Mac**; on Windows it must run inside
**WSL2 (Ubuntu)**. Docker Desktop is needed for the proof server.

Already present on this machine: Node 24 ✅ · npm ✅ · Docker Desktop ✅ · WSL2 kernel ✅.
Still needed: an **Ubuntu** WSL distro, the **Compact compiler**, **yarn**, and the **Lace** wallet.

### 1. Install Ubuntu on WSL (PowerShell as Administrator)
```powershell
wsl --install -d Ubuntu
```
Reboot if prompted, then set a Linux username/password when Ubuntu first opens.

### 2. Inside Ubuntu — install Node 22+, yarn, and the Compact compiler
```bash
# Node 22 (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc && nvm install 22 && nvm use 22
corepack enable        # provides yarn

# Compact compiler
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
source ~/.bashrc
compact update
compact --version      # verify
```

### 3. Lace wallet (browser)
Install the **Lace** extension (Chrome/Edge store) → Settings » Midnight →
set the proof server to `Local (http://localhost:6300)` when testing locally.

### 4. Get this repo inside WSL
The project lives at `D:\Midnight`, reachable from Ubuntu as `/mnt/d/Midnight`:
```bash
cd /mnt/d/Midnight
yarn install
```

---

## 🚀 Level 1 — compile, deploy, test

### Compile the contract
```bash
compact compile contracts/hello-world.compact contracts/managed/hello-world
# or: yarn compile
```
Expected: `Compiling 1 circuits: circuit "storeMessage" (k=6, rows=26)`

### Deploy & test on the local devnet (needs Docker running)
```bash
yarn env:up        # starts proof server + node + indexer (Docker)
yarn test:local    # deploys the contract and stores a message
yarn env:down
```

### Deploy to live Preprod (for the Level 1 submission)
1. Generate a wallet and fund it via the **Preprod faucet**:
   https://midnight-tmnight-preprod.nethermind.dev/ (needs tNIGHT; tDUST is
   delegated in 1AM / Lace Carbon).
2. Copy `.env.preprod.example` → `.env.preprod` and fill in **one** of the
   mnemonic/seed lines for that funded wallet.
3. Run:
   ```bash
   yarn proof:up
   yarn test:preprod
   ```

---

## 📄 The contract

`contracts/hello-world.compact` — a minimal public message store:

```compact
pragma language_version 0.23;

export ledger message: Opaque<"string">;

export circuit storeMessage(newMessage: Opaque<"string">): [] {
  message = disclose(newMessage);
}
```

Circuit inputs are **private by default** on Midnight; `disclose()` explicitly
marks a value as safe to write to public ledger state.

### 🔓 Public ledger state vs 🔒 private witness

This tiny contract already shows the core Midnight distinction the whole
program is built around:

- **`ledger message`** is **public ledger state**. It is stored on-chain, in the
  clear, and anyone can read it. Writing here is a deliberate act of publishing.
- **`newMessage` (the circuit parameter)** is a **private witness**. On Midnight
  every circuit input is private by default — it exists only inside the
  zero-knowledge proof generated on the user's machine and is *never* sent to
  the chain. The network verifies the proof was computed correctly without ever
  seeing the input.
- **`disclose()`** is the one-way gate between the two. Assigning a private value
  straight into public `ledger` state is a **compile error** on purpose;
  `disclose(newMessage)` is the developer stating, explicitly, "I intend this
  particular value to become public." Everything not disclosed stays private.

In **Umbra** this is the whole product: the feedback text is `disclose()`d into
public state so everyone can read it, while the author's membership credential
is a private witness that proves they are allowed to post **without** the
contract ever learning who they are.

---

## 📂 Structure

```
contracts/
  hello-world.compact      # the Compact contract (Level 1)
  index.ts                 # TypeScript binding to the compiled contract
  managed/                 # compiler output (generated by `compact compile`)
src/
  config.ts                # network config (local / preview / preprod)
  providers.ts             # Midnight.js providers wiring
  wallet.ts                # headless wallet used by the test suite
  test/hw.test.ts          # deploy + interact test
compose.yml                # proof server + node + indexer (Docker)
```

---

## 🔗 References
- [Midnight docs](https://docs.midnight.network/)
- [Install the toolchain](https://docs.midnight.network/getting-started/installation)
- [Hello world tutorial](https://docs.midnight.network/getting-started/hello-world)
- [example-hello-world](https://github.com/midnightntwrk/example-hello-world) (this template's origin)
