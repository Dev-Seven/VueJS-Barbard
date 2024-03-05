import { MainService } from "./service.js";
import { Trengo } from "./clients/trengo.js";
import { UserStoreService } from "./userstore.js";
import { WordpressService } from "./wordpress.js";
import { getConfig } from "./config.js";
import { RegisterService } from "./modules/register/RegisterService.js";
import { NotificationService } from "./modules/notification/NotificationService.js";
import { NotificationRepository } from "./modules/notification/NotificationRepository.js";
import { RewardService } from "./modules/reward/RewardService.js";
import { RedemptionRepository } from "./modules/reward/RedemptionRepository.js";
import { GiftChequeRepository } from "./modules/reward/GiftChequeRepository.js";
import { UserService } from "./modules/user/UserService.js";
import { AdminService } from "./modules/admin/AdminService.js";
import { AdminRepository } from "./modules/admin/AdminRepository.js";
import { OrderService } from "./modules/order/OrderService.js";
import { EventService } from "./modules/events/EventService.js";
import { OtpService } from "./modules/user/OtpService.js";
import { LocalVerificationProvider } from "./modules/user/LocalVerificationProvider.js";
import twilio from "twilio";
import { TwilioVerificationProvider } from "./modules/user/TwilioVerificationProvider.js";
import { OrderMigrationService } from "./commands/OrderMigrationService.js";
import { LockerBoxRepository } from "./modules/lockerbox/LockerBoxRepository.js";
import { LockerBoxService } from "./modules/lockerbox/LockerBoxService.js";
import { EventRepository } from "./modules/booking/EventRepository.js";
import { BookingService } from "./modules/booking/BookingService.js";
import firebase from "./sys/firebase/firebase.js";
import { BrevoService } from "./clients/BrevoService.js";

const config = getConfig();

const firebaseApp = firebase;

export const realtimeDb = firebaseApp.database();

export const userStore = new UserStoreService(firebaseApp.firestore());
export const trengo = new Trengo(config.trengo.token);

const brevoService = new BrevoService();
export const service = new MainService(brevoService, userStore, trengo);
export const wordpressService = new WordpressService(userStore, service);
export const registerService = new RegisterService(
  firebaseApp.firestore(),
  userStore,
);
export const notificationRepository = new NotificationRepository(
  firebaseApp.firestore(),
);
export const notificationService = new NotificationService(
  userStore,
  firebaseApp.firestore(),
  brevoService,
  notificationRepository,
);

export const redemptionRepoistory = new RedemptionRepository(
  firebaseApp.firestore(),
);
export const giftChequeRepoistory = new GiftChequeRepository(
  firebaseApp.firestore(),
);

export const rewardService = new RewardService(redemptionRepoistory);
export const userService = new UserService();
export const adminRepo = new AdminRepository(firebaseApp.firestore());
export const adminService = new AdminService(
  firebaseApp.auth(),
  adminRepo,
  realtimeDb,
);
export const orderService = new OrderService(userStore);
export const eventService = new EventService(userStore, trengo);

const twilioClient = twilio(
  getConfig()?.twilio?.account_sid,
  getConfig()?.twilio?.auth_token,
);

export const localVerificationProvider = new LocalVerificationProvider(
  getConfig().otp.api_key,
  getConfig().otp.secret_key,
);
export const twilioVerificationProvider = new TwilioVerificationProvider(
  twilioClient,
  getConfig().twilio.verification_service_id,
);
export const otpService = new OtpService(
  localVerificationProvider,
  twilioVerificationProvider,
);

export const orderMigrationService = new OrderMigrationService(
  userStore,
  orderService,
);
export const lockerBoxRepository = new LockerBoxRepository(
  firebaseApp.firestore(),
);
export const lockerBoxService = new LockerBoxService(lockerBoxRepository);
export const eventRepository = new EventRepository(firebaseApp.firestore());
export const bookingService = new BookingService(eventRepository);
