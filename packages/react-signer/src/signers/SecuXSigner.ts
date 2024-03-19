// Copyright 2017-2023 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Signer, SignerResult } from '@polkadot/api/types';
import type { SecuX } from '@polkadot/hw-secux';
import type { Registry, SignerPayloadJSON } from '@polkadot/types/types';

let id = 0;

export class SecuXSigner implements Signer {
  readonly #accountOffset: number;
  readonly #addressOffset: number;
  readonly #getSecuX: () => SecuX;
  readonly #registry: Registry;

  constructor (registry: Registry, getSecuX: () => SecuX, accountOffset: number, addressOffset: number) {
    this.#accountOffset = accountOffset;
    this.#addressOffset = addressOffset;
    this.#getSecuX = getSecuX;
    this.#registry = registry;
  }

  public async signPayload (payload: SignerPayloadJSON): Promise<SignerResult> {
    const raw = this.#registry.createType('ExtrinsicPayload', payload, { version: payload.version });
    const { signature } = await this.#getSecuX().sign(raw.toU8a(true), this.#accountOffset, this.#addressOffset);

    return { id: ++id, signature };
  }
}
