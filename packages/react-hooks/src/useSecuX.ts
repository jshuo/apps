// Copyright 2017-2023 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { TransportType } from '@polkadot/hw-ledger-transports/types';

import { useCallback, useMemo } from 'react';

import { SecuX } from '@polkadot/hw-secux';
import { knownGenesis, knownLedger } from '@polkadot/networks/defaults';
import uiSettings from '@polkadot/ui-settings';
import { assert } from '@polkadot/util';

import { createNamedHook } from './createNamedHook.js';
import { useApi } from './useApi.js';

interface StateBase {
  hasSecuXChain: boolean;
  hasWebUsb: boolean;
  isSecuXCapable: boolean;
  isSecuXEnabled: boolean;
}

interface State extends StateBase {
  getSecuX: () => SecuX;
}

const EMPTY_STATE: StateBase = {
  hasSecuXChain: false,
  hasWebUsb: false,
  isSecuXCapable: false,
  isSecuXEnabled: true
};

const hasWebUsb = !!(window as unknown as { USB?: unknown }).USB;
const SecuXChains = Object
  .keys(knownGenesis)
  .filter((n) => knownLedger[n]);
const SecuXHashes = SecuXChains.reduce<string[]>((all, n) => [...all, ...knownGenesis[n]], []);
let secux: SecuX | null = null;
let SecuXType: TransportType | null = null;

function retrieveSecuX (api: ApiPromise): SecuX {
  const currType = uiSettings.ledgerConn as TransportType;

  if (!secux || SecuXType !== currType) {
    const genesisHex = api.genesisHash.toHex();
    const network = SecuXChains.find((network) => knownGenesis[network].includes(genesisHex));

    assert(network, `Unable to find a known SecuX config for genesisHash ${genesisHex}`);

    secux = new SecuX(network);
    SecuXType = currType;
  }

  return secux;
}

function getState (api: ApiPromise): StateBase {
  const hasSecuXChain = SecuXHashes.includes(api.genesisHash.toHex());
  const isSecuXCapable = hasWebUsb && hasSecuXChain;

  return {
    hasSecuXChain,
    hasWebUsb,
    isSecuXCapable,
    isSecuXEnabled: isSecuXCapable && uiSettings.secuxConn !== 'none'
  };
}

function useSecuXImpl (): State {
  const { api, isApiReady } = useApi();

  const getSecuX = useCallback(
    () => retrieveSecuX(api),
    [api]
  );

  return useMemo(
    () => ({ ...(isApiReady ? getState(api) : EMPTY_STATE), getSecuX }),
    [api, getSecuX, isApiReady]
  );
}

export const useSecuX = createNamedHook('useSecuX', useSecuXImpl);
