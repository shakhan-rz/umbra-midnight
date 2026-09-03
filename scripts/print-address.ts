// Prints the UNSHIELDED receive address of the wallet built from
// MIDNIGHT_<NETWORK>_MNEMONIC, so it can be funded via the faucet directly.
// This is the address the test suite actually uses — which is NOT the same as
// the address Lace shows for the same recovery phrase.
import { readFileSync } from 'node:fs';
import pino from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  FluentWalletBuilder,
  DAppConnectorWalletAdapter,
  type EnvironmentConfiguration,
  type DustWalletOptions,
} from '@midnight-ntwrk/testkit-js';
import {
  ZswapSecretKeys,
  DustSecretKey,
  LedgerParameters,
} from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { getConfig } from '../src/config.js';

const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });
const network = process.env['MIDNIGHT_NETWORK'] ?? 'preview';

function readMnemonic(): string {
  const envVar = `MIDNIGHT_${network.toUpperCase()}_MNEMONIC`;
  const fromEnv = process.env[envVar];
  const raw =
    fromEnv ??
    (() => {
      const txt = readFileSync(new URL(`../.env.${network}`, import.meta.url), 'utf8');
      const m = txt.match(new RegExp(`^${envVar}=(.*)$`, 'm'));
      if (!m) throw new Error(`${envVar} not found`);
      return m[1];
    })();
  return raw.trim().replace(/\s+/g, ' ');
}

const config = getConfig();
setNetworkId(config.networkId);
const env: EnvironmentConfiguration = {
  walletNetworkId: config.networkId,
  networkId: config.networkId,
  indexer: config.indexer,
  indexerWS: config.indexerWS,
  node: config.node,
  nodeWS: config.nodeWS,
  faucet: config.faucet,
  proofServer: config.proofServer,
} as EnvironmentConfiguration;

const dustOptions: DustWalletOptions = {
  ledgerParams: LedgerParameters.initialParameters(),
  additionalFeeOverhead: 1_000n,
  feeBlocksMargin: 5,
};

const builder = FluentWalletBuilder.forEnvironment(env)
  .withDustOptions(dustOptions)
  .withMnemonic(readMnemonic());

const { wallet, seeds, keystore } = (await builder.buildWithoutStarting()) as any;
const adapter = new DAppConnectorWalletAdapter(
  {
    wallet,
    unshieldedKeystore: keystore,
    zswapSecretKeys: ZswapSecretKeys.fromSeed(seeds.shielded),
    dustSecretKey: DustSecretKey.fromSeed(seeds.dust),
  } as any,
  env as any,
);

const { unshieldedAddress } = await adapter.getUnshieldedAddress();
logger.info('=================================================');
logger.info(`NETWORK: ${network}`);
logger.info(`UNSHIELDED ADDRESS (fund THIS at the faucet):`);
console.log(unshieldedAddress);
logger.info('=================================================');
process.exit(0);
