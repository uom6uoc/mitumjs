import { ContractFact, FactJson } from "../base"

import { HINT } from "../../alias"
import { Address } from "../../key"
import { Amount, ContractID, CurrencyID } from "../../common"
import { Big } from "../../types"
import { Whitelist } from './whitelist';
import { Assert, ECODE, MitumError } from "../../error"
import { Config } from "../../node"

export class CreateDAOFact extends ContractFact {
    readonly dao: ContractID
    readonly option: "crypto" | "biz"
    readonly votingPowerToken: CurrencyID
    readonly threshold: Big
    readonly fee: Amount
    readonly whitelist: Whitelist
    readonly proposalReviewPeriod: Big
    readonly registrationPeriod: Big
    readonly preSnapshotPeriod: Big
    readonly votingPeriod: Big
    readonly postSnapshotPeriod: Big
    readonly executionDelayPeriod: Big
    readonly turnout: Big
    readonly quorum: Big

    constructor(
        token: string,
        sender: string | Address,
        contract: string | Address,
        dao: string | ContractID,
        option: "crypto" | "biz",
        votingPowerToken: string | CurrencyID,
        threshold: string | number | Big,
        fee: Amount,
        whitelist: Whitelist,
        proposalReviewPeriod: string | number | Big,
        registrationPeriod: string | number | Big,
        preSnapshotPeriod: string | number | Big,
        votingPeriod: string | number | Big,
        postSnapshotPeriod: string | number | Big,
        executionDelayPeriod: string | number | Big,
        turnout: string | number | Big,
        quorum: string | number | Big,
        currency: string | CurrencyID,
    ) {
        super(HINT.DAO.CREATE_DAO.FACT, token, sender, contract, currency)

        this.dao = ContractID.from(dao)
        this.option = option
        this.votingPowerToken = CurrencyID.from(votingPowerToken)
        this.threshold = Big.from(threshold)
        this.fee = fee
        this.whitelist = whitelist
        this.proposalReviewPeriod = Big.from(proposalReviewPeriod)
        this.registrationPeriod = Big.from(registrationPeriod)
        this.preSnapshotPeriod = Big.from(preSnapshotPeriod)
        this.votingPeriod = Big.from(votingPeriod)
        this.postSnapshotPeriod = Big.from(postSnapshotPeriod)
        this.executionDelayPeriod = Big.from(executionDelayPeriod)
        this.turnout = Big.from(turnout)
        this.quorum = Big.from(quorum)

        Assert.check(
            Config.DAO.QUORUM.satisfy(this.turnout.v),
            MitumError.detail(ECODE.INVALID_FACT, "turnout out of range"),
        )
        
        Assert.check(
            Config.DAO.QUORUM.satisfy(this.quorum.v),
            MitumError.detail(ECODE.INVALID_FACT, "quorum out of range"),    
        )

        this.whitelist.accounts.forEach(
            a => Assert.check(
                this.contract.toString() !== a.toString(),
                MitumError.detail(ECODE.INVALID_FACT, "contract is same with whitelist address")
            )
        )
    }

    toBuffer(): Buffer {
        return Buffer.concat([
            super.toBuffer(),
            this.dao.toBuffer(),
            Buffer.from(this.option),
            this.votingPowerToken.toBuffer(),
            this.threshold.toBuffer(),
            this.fee.toBuffer(),
            this.whitelist.toBuffer(),
            this.proposalReviewPeriod.toBuffer("fill"),
            this.registrationPeriod.toBuffer("fill"),
            this.preSnapshotPeriod.toBuffer("fill"),
            this.votingPeriod.toBuffer("fill"),
            this.postSnapshotPeriod.toBuffer("fill"),
            this.executionDelayPeriod.toBuffer("fill"),
            this.turnout.toBuffer(),
            this.quorum.toBuffer(),
            this.currency.toBuffer(),
        ])
    }

    toHintedObject(): FactJson {
        return {
            ...super.toHintedObject(),
            dao_id: this.dao.toString(),
            option: this.option,
            voting_power_token: this.votingPowerToken.toString(),
            threshold: this.threshold.toString(),
            fee: this.fee.toHintedObject(),
            whitelist: this.whitelist.toHintedObject(),
            proposal_review_period: this.proposalReviewPeriod.v,
            registration_period: this.registrationPeriod.v,
            pre_snapshot_period: this.preSnapshotPeriod.v,
            voting_period: this.votingPeriod.v,
            post_snapshot_period: this.postSnapshotPeriod.v,
            execution_delay_period: this.executionDelayPeriod.v,
            turnout: this.turnout.v,
            quorum: this.quorum.v,
        }
    }

    get operationHint() {
        return HINT.DAO.CREATE_DAO.OPERATION
    }
}