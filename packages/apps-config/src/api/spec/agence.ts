// Copyright 2017-2023 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { OverrideBundleDefinition } from '@polkadot/types/types';

// structs need to be in order
/* eslint-disable sort-keys */

const definitions: OverrideBundleDefinition = {
  signedExtensions: {
    ChargeOrDelegateTxPayment: {
      extrinsic: {
        tip: "Compact<Balance>",
        delegated: "bool"
      },
      payload: {}
    }
  }
};

export default definitions;
