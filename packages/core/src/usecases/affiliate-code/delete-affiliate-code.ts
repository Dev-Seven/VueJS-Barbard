import { AffiliateCode, User, type UserRepository } from "../../index.js";
import type { IMessageChannel } from "../../message-channels/imessage-channel.js";
import type { Usecase } from "../usecase.js";

export class DeleteAffiliateCodeUsecase implements Usecase<string[]> {
  constructor(
    private userRepository: UserRepository,
    private messageChannel: IMessageChannel,
  ) {}

  async execute(userId: string, code: string): Promise<string[]> {
    let [ok, errs] = AffiliateCode.isValidated(code);
    if (!ok) {
      return errs;
    }

    const affiliateCode = new AffiliateCode(code);

    let maybeUser: User | null = null;
    [ok, maybeUser] = await this.userRepository.get(userId);
    if (!ok) {
      return (errs = ["user not found", ...errs]);
    }
    const user = maybeUser!;

    if (!user.affiliateCodes.some((c) => c.value == affiliateCode.value)) {
      return (errs = [
        `affiliate code: ${code} does not exist on the user: ${user.fullName}`,
        ...errs,
      ]);
    }

    user.removeAffiliateCode(affiliateCode);

    if (!(await this.userRepository.update(user))[0]) {
      return (errs = ["failed to delete the affiliate", ...errs]);
    } else {
      await this.messageChannel.send(
        `Affilate code ${affiliateCode.value} was deleted from user ${
          user.fullName ??
          `${user.firstName ?? "First Name Not Found"} ${
            user.lastName ?? "Last Name Not Found"
          }`
        } - id ${user.id} - current affiliate codes: ${user.affiliateCodes
          .map((acs) => acs.value)
          .join(" ,")}`,
      );
    }

    return errs;
  }
}
