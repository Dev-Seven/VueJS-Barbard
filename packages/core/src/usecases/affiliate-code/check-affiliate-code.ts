import { User } from "../../entities/user.js";
import {
  AffiliateCode,
  Promotion,
  Usecase,
  type UserRepository,
} from "../../index.js";
import type { ITransactionInterpreter } from "../../transaction-interpreter/itransaction-interpreter.js";
import {
  CreateTransactionOp,
  UpdateTransactionOp,
} from "../../transaction-interpreter/transaction-ops.js";

export class CheckAffiliateCodeUsecase implements Usecase<string[]> {
  constructor(
    private userRepository: UserRepository,
    private transaction: ITransactionInterpreter,
  ) {}

  async execute(userId: string, code: string): Promise<string[]> {
    let errs: string[] = [];
    let [ok, errors] = AffiliateCode.isValidated(code);
    if (!ok) {
      return (errs = errors);
    }

    const affiliateCode = new AffiliateCode(code);

    let maybeUser: User | null;
    [ok, maybeUser] = await this.userRepository.get(userId);
    if (!ok) {
      return (errs = ["user not found", ...errs]);
    }
    const recepient = maybeUser!;

    if (!recepient.isNewComer) {
      errs = ["not a newcomer", ...errs];
    }

    if (recepient.referrer) {
      errs = [
        `${recepient.fullName} (${recepient.firstName} ${recepient.lastName}) already redeemed the referral code ${recepient.referrer.code}`,
        ...errs,
      ];
    }

    if (errs.length) {
      return errs;
    }

    [ok, maybeUser] = await this.userRepository.getByAffiliateCode(code);

    if (!ok) {
      return (errs = [
        "cannot find the user with the provided affiliatecode",
        ...errs,
      ]);
    }
    const referrer = maybeUser!;

    if (!referrer.affiliateCodes.some((v) => v.value == code)) {
      return (errs = ["invalid code", ...errs]);
    }

    const [refPromotion, recPromotion] = Promotion.referralPromotions(
      affiliateCode,
      referrer,
      recepient,
    );

    [ok, errors] = await this.performUpdate(
      refPromotion,
      recPromotion,
      referrer,
      recepient,
      code,
    );

    console.error(errors);
    if (!ok) {
      return ["failed to process the action", ...errs];
    }

    return errs;
  }

  public async performUpdate(
    refPromotion: Promotion,
    recPromotion: Promotion,
    referrer: User,
    recepient: User,
    code: string,
  ) {
    return await this.transaction.run(
      new CreateTransactionOp<Promotion>(
        refPromotion.id,
        refPromotion,
        Promotion.to,
        Promotion.name,
      ),
      new CreateTransactionOp<Promotion>(
        recPromotion.id,
        recPromotion,
        Promotion.to,
        Promotion.name,
      ),
      new UpdateTransactionOp<User>(
        referrer.id,
        (user) => this.updateReferrerData(user, recepient, code, refPromotion),
        (raw) => User.from(raw)!,
        User.to,
        User.name,
      ),
      new UpdateTransactionOp<User>(
        recepient.id,
        (user) => this.updateReferreeData(user, referrer, code, recPromotion),
        (raw) => User.from(raw)!,
        User.to,
        User.name,
      ),
    );
  }

  public updateReferrerData(
    user: User,
    recepient: User,
    code: string,
    refPromotion: Promotion,
  ): User {
    if (!(user.referrals ?? []).some((v) => v.id == recepient.id)) {
      user.referrals = [
        ...(user.referrals ?? []),
        {
          code: code,
          id: recepient.id,
          date: refPromotion.startDate,
          userName: recepient.fullName,
        },
      ];
    }
    return user;
  }

  public updateReferreeData(
    user: User,
    referrer: User,
    code: string,
    recPromotion: Promotion,
  ): User {
    if (!user.referrer) {
      user.referrer = {
        code: code,
        id: referrer.id,
        date: recPromotion.startDate,
        userName: referrer.fullName,
      };
    }
    return user;
  }
}
