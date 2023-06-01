// Copyright 2017-2023 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SecuX } from '@polkadot/hw-secux';

import React, { useCallback, useRef, useState } from 'react';

import { Button, Dropdown, Input, MarkError, Modal } from '@polkadot/react-components';
import { useApi, useSecuX } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';
import { arrayRange } from '@polkadot/util';

import { useTranslation } from '../translate.js';

interface Option {
  text: string;
  value: number;
}

interface Props {
  className?: string;
  onClose: () => void;
}

export const AVAIL_INDEXES = arrayRange(20);

// query the SecuX for the address, adding it to the keyring
async function querySecuX (api: ApiPromise, getSecuX: () => SecuX, name: string, accountOffset: number, addressOffset: number): Promise<void> {
  const { address } = await getSecuX().getAddress(false, accountOffset, addressOffset);

  keyring.addHardware(address, 'SecuX', {
    accountOffset,
    addressOffset,
    genesisHash: api.genesisHash.toHex(),
    name: name || `secux ${accountOffset}/${addressOffset}`
  });
}

function SecuXModal ({ className, onClose }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const { getSecuX } = useSecuX();
  const [accIndex, setAccIndex] = useState(0);
  const [addIndex, setAddIndex] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [{ isNameValid, name }, setName] = useState({ isNameValid: false, name: '' });
  const [isBusy, setIsBusy] = useState(false);

  const accOps = useRef(AVAIL_INDEXES.map((value): Option => ({
    text: t<string>('Account type {{index}}', { replace: { index: value } }),
    value
  })));

  const addOps = useRef(AVAIL_INDEXES.map((value): Option => ({
    text: t<string>('Address index {{index}}', { replace: { index: value } }),
    value
  })));

  const _onChangeName = useCallback(
    (name: string) => setName({ isNameValid: !!name.trim(), name }),
    []
  );

  const _onSave = useCallback(
    (): void => {
      setError(null);
      setIsBusy(true);

      querySecuX(api, getSecuX, name, accIndex, addIndex)
        .then(() => onClose())
        .catch((error: Error): void => {
          console.error(error);

          setIsBusy(false);
          setError(error);
        });
    },
    [accIndex, addIndex, api, getSecuX, name, onClose]
  );

  return (
    <Modal
      className={className}
      header={t<string>('Add account via SecuX')}
      onClose={onClose}
      size='large'
    >
      <Modal.Content>
        <Modal.Columns hint={t<string>('The name for this account as it will appear under your accounts.')}>
          <Input
            autoFocus
            className='full'
            isError={!isNameValid}
            label={t<string>('name')}
            onChange={_onChangeName}
            placeholder={t<string>('account name')}
            value={name}
          />
        </Modal.Columns>
        <Modal.Columns hint={t<string>('The account type that you wish to create. This is the top-level derivation.')}>
          <Dropdown
            label={t<string>('account type')}
            onChange={setAccIndex}
            options={accOps.current}
            value={accIndex}
          />
        </Modal.Columns>
        <Modal.Columns hint={t<string>('The address index on the account that you wish to add. This is the second-level derivation.')}>
          <Dropdown
            label={t<string>('address index')}
            onChange={setAddIndex}
            options={addOps.current}
            value={addIndex}
          />
          {error && (
            <MarkError content={error.message} />
          )}
        </Modal.Columns>
      </Modal.Content>
      <Modal.Actions>
        <Button
          icon='plus'
          isBusy={isBusy}
          isDisabled={!isNameValid}
          label={t<string>('Save')}
          onClick={_onSave}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(SecuXModal);
