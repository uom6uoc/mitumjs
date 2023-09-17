import { NFTItem } from "./item"
import { OperationFact } from "../base"

import { HINT } from "../../alias"
import { Address } from "../../key"
import { Big, HintedObject } from "../../types"
import { ContractID, CurrencyID } from "../../common"
import { Assert, ECODE, MitumError } from "../../error"

export class SignItem extends NFTItem {
    readonly nft: Big

    constructor(
        contract: string | Address, 
        collection: string | ContractID, 
        nft: string | number | Big, 
        currency: string | CurrencyID,
    ) {
        super(HINT.NFT.SIGN.ITEM, contract, collection, currency)
        this.nft = Big.from(nft)
    }

    toBuffer(): Buffer {
        return Buffer.concat([
            this.contract.toBuffer(),
            this.collection.toBuffer(),
            this.nft.toBuffer("fill"),
            this.currency.toBuffer(),
        ])
    }

    toHintedObject(): HintedObject {
        return {
            ...super.toHintedObject(),
            nft: this.nft.v,
        }
    }
}

export class SignFact extends OperationFact<SignItem> {
    constructor(token: string, sender: string | Address, items: SignItem[]) {
        super(HINT.NFT.SIGN.FACT, token, sender, items)

        this.items.forEach(
            it => Assert.check(
                this.sender.toString() != it.contract.toString(),
                MitumError.detail(ECODE.INVALID_ITEMS, "sender is same with contract address"),
            )
        )
    }

    get operationHint() {
        return HINT.NFT.SIGN.OPERATION
    }
}