# Umbra — Level 2 (Waxing Crescent) 🌒

The Level 2 frontend dApp for **Umbra**: verified, anonymous feedback on the
**Midnight** blockchain. A React UI wired to a Compact contract, signed by the
**Lace** wallet in the browser, deployed on **Preprod**.

Built on the official [`example-bboard`](https://github.com/midnightntwrk/example-bboard)
template (Midnight-endorsed starting point) and adapted into Umbra.

---

## 🔒 The privacy claim (what is proven without being shown)

This is the heart of Level 2 — **an observable privacy behavior**.

Umbra lets someone post a message to a public board and later take it down, but
**only the original poster can take it down — and they prove that in zero
knowledge, without ever revealing who they are.**

How it works in the contract (`contract/src/*.compact`):

- `witness localSecretKey(): Bytes<32>` — the poster's **secret key**. It is a
  **private witness**: it lives only on the user's device, is fed into the
  zero-knowledge proof, and is **never written to the chain**.
- `post(message)` — writes the `message` to **public** ledger state, and stores
  `owner = publicKey(localSecretKey(), sequence)` — a *hash* of the secret. The
  secret itself is never disclosed; only its one-way hash becomes public.
- `takeDown()` — asserts `owner == publicKey(localSecretKey(), sequence)`. To
  pass, the caller must know the secret key behind the stored hash — but the
  proof reveals **nothing** about the key. The network verifies "this person is
  the owner" while learning **who** only as an anonymous hash.

So the useful fact — *"the real owner took this down"* — is public and
verifiable, while the sensitive fact — *the secret identity* — stays private.
That is exactly what Midnight is for, and what Umbra is built around.

You can watch it in the UI: an **open padlock** while a board is free to post
to, a **closed padlock** once occupied — and a takedown only succeeds from the
browser that holds the matching private state.

---

## 🧩 How the frontend talks to the chain

- **Lace wallet** via `@midnight-ntwrk/dapp-connector-api` — connect / disconnect,
  and it supplies the network configuration (indexer + prover URIs) and signs.
- **Providers** (browser): `FetchZkConfigProvider` serves the ZK keys/`zkir`
  from the app origin, `httpClientProofProvider` builds proofs against Lace's
  prover, `indexerPublicDataProvider` reads public ledger state, and an
  in-memory private-state provider holds the secret key.
- Calling a **circuit** from the UI: the "post" / "take down" buttons invoke the
  contract's `post` / `takeDown` circuits and wait for on-chain confirmation.

---

## 🚀 Run it locally

Prerequisites: Node ≥ 24, Yarn, the Compact compiler, Docker (proof server), and
the **Lace** wallet set to **Preprod**.

```bash
# from umbra-app/
yarn install
# build the contract (Compact -> ZK circuits + TS bindings), then the api, then the ui
yarn build           # builds all workspaces
cd bboard-ui && yarn dev
```

Open the printed URL, click **Connect** (approve in Lace on Preprod), then post
a message and take it down.

---

## 📦 Structure

```
umbra-app/
  contract/    # Compact contract (post / takeDown, private witness) + tests
  api/         # TypeScript API wrapping the contract (deploy/join/post/takeDown)
  bboard-ui/   # React + MUI frontend, Lace connector, live board UI
  bboard-cli/  # CLI to deploy / interact (used to deploy to Preprod)
```

> Internal package and symbol names inherited from the template still say
> `bboard`; the product, its UI, and this documentation are **Umbra**.

---

## 🔗 Deployment

- **Network:** Midnight Preprod
- **Contract address:** _(filled in after the Preprod deploy)_
- **Live demo:** _(Vercel link, added after deploy)_
