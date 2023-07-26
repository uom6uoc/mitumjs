import { Assert, MitumError, ECODE } from "../../utils/error.js";
import { HintedObject } from "../../types/interface.js";
import { OperationFact } from "../../types/fact.js";

import { Address } from "../../account/address.js";
import { KYCItem } from "./item.js";

const RemoveControllersItemHint = "mitum-kyc-remove-controllers-item";
const RemoveControllersFactHint = "mitum-kyc-remove-controllers-operation-fact";
const RemoveControllersHint = "mitum-kyc-remove-controllers-operation";

const MaxRemoveControllersItems = 20;

export class RemoveControllersItem extends KYCItem {
  readonly controller: Address;

  constructor(
    contract: string,
    serviceID: string,
    controller: string,
    currency: string
  ) {
    super(RemoveControllersItemHint, contract, serviceID, currency);

    this.controller = new Address(controller);
  }

  toBuffer(): Buffer {
    return Buffer.concat([
      super.toBuffer(),
      this.controller.toBuffer(),
      this.currency.toBuffer(),
    ]);
  }

  toString(): string {
    return this.controller.toString();
  }

  toHintedObject(): HintedObject {
    return {
      ...super.toHintedObject(),
      controller: this.controller.toString(),
    };
  }
}

export class RemoveControllersFact extends OperationFact<RemoveControllersItem> {
  constructor(token: string, sender: string, items: RemoveControllersItem[]) {
    super(RemoveControllersFactHint, token, sender, items);

    items.forEach((item) => {
      Assert.check(
        item instanceof RemoveControllersItem,
        MitumError.detail(
          ECODE.INVALID_PARAMETER,
          "The type of items is incorrect."
        )
      );
      Assert.check(
        item.contract.toString() !== sender,
        MitumError.detail(
          ECODE.INVALID_PARAMETER,
          "The contract address is the same as the sender address."
        )
      );
    });

    Assert.check(
      items.length <= MaxRemoveControllersItems,
      MitumError.detail(
        ECODE.INVALID_PARAMETER,
        "The number of elements in items is too many."
      )
    );

    const iSet = new Set(items.map((item) => item.toString()));
    Assert.check(
      iSet.size === items.length,
      MitumError.detail(
        ECODE.INVALID_PARAMETER,
        "There are duplicate elements in items."
      )
    );
  }

  get operationHint() {
    return RemoveControllersHint;
  }
}
