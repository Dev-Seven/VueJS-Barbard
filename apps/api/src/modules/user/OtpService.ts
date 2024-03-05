import type { BarbaardUser } from "@barbaard/types";
import type { VerificationProvider } from "./VerificationProvider.js";
import data from "../../sys/data/data.js";
import firebase from "../../sys/firebase/firebase.js";

const userDataProvider = data.userDataProvider();
const firebaseApp = firebase;
export class OtpService {
  constructor(
    private localVerificationProvider: VerificationProvider,
    private twilioVerificationProvider: VerificationProvider,
  ) {}

  isLocalNumber(phoneNumber: string) {
    return phoneNumber.startsWith("+84");
  }

  getProvider(phoneNumber: string) {
    if (this.isLocalNumber(phoneNumber)) {
      return this.localVerificationProvider;
    }
    return this.twilioVerificationProvider;
  }

  async sendOtp(phoneNumber: string) {
    console.log({ phoneNumber });
    const data = await this.getProvider(phoneNumber).send(phoneNumber);
    console.log("send response", data);
    return data;
  }

  async checkOtp(phoneNumber: string, code: string) {
    console.log({ phoneNumber, code });
    const verification = await this.getProvider(phoneNumber).verify(
      phoneNumber,
      code,
    );
    if (!verification.verified) {
      return verification;
    }
    // otp is valid
    let user = (await userDataProvider.getUserByPhone(phoneNumber)).getOrNull();
    if (!user) {
      console.log("Create user from phoneNumber", phoneNumber);
      const userDoc: BarbaardUser = { phone: phoneNumber };
      const createdUser = (await userDataProvider.create(userDoc)).getOrNull();
      if (createdUser) {
        const [id] = createdUser;
        user = [id, userDoc];
        console.log("User created:", user);
        const token = await firebaseApp.auth().createCustomToken(id);
        return { ...verification, token };
      }
    }
    return { ...verification };
  }
}
