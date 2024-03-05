import {
  CheckAffiliateCodeUsecase,
  CreateAffiliateCodeUsecase,
  DeleteAffiliateCodeUsecase,
} from "core";
import {
  FirebasePromotionRepository,
  FirebaseUserRepository,
} from "./repositories/index.js";
import { firebaseApp } from "./services/index.js";
import { FirebaseTransactionIntepreter } from "./transaction-interpreter/index.js";
import { SlackMessageChannel } from "./message-channels/slack-message-channel.js";
import slack from "./services/slack.js";

const store = firebaseApp.firestore();
const userRepository = new FirebaseUserRepository(store);
const promotionRepository = new FirebasePromotionRepository(store);
const interpreter = new FirebaseTransactionIntepreter(store);
interpreter.addRepository(userRepository);
interpreter.addRepository(promotionRepository);

export const initialization = {
  slack: slack.init,
};

export const affiliate = {
  check: new CheckAffiliateCodeUsecase(userRepository, interpreter),
  create: (channel: string) =>
    new CreateAffiliateCodeUsecase(
      userRepository,
      new SlackMessageChannel(slack.instance(), channel),
    ),
  delete: (channel: string) =>
    new DeleteAffiliateCodeUsecase(
      userRepository,
      new SlackMessageChannel(slack.instance(), channel),
    ),
};
