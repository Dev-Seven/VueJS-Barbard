import type { VerificationProvider } from "./VerificationProvider.js";
import Twilio from "twilio/lib/rest/Twilio.js";

export class TwilioVerificationProvider implements VerificationProvider {
  constructor(
    private client: Twilio,
    private verificationServiceId: string,
  ) {}

  async send(phoneNumber: string): Promise<{ sent: boolean; error?: string }> {
    try {
      const response = await this.client.verify.v2
        .services(this.verificationServiceId)
        .verifications.create({
          to: phoneNumber,
          channel: "sms",
        });
      console.log(response);
      return { sent: true };
    } catch (err) {
      return {
        sent: false,
        error: err instanceof Error ? err.message : "unknown error",
      };
    }
  }

  async verify(
    phoneNumber: string,
    code: string,
  ): Promise<{ verified: boolean; error?: string }> {
    try {
      const response = await this.client.verify.v2
        .services(this.verificationServiceId)
        .verificationChecks.create({
          to: phoneNumber,
          code: code,
        });
      console.log(response);
      if (response.status == "approved") {
        return { verified: true };
      } else {
        return {
          verified: false,
          error: "invalid otp",
        };
      }
    } catch (err) {
      console.log(err);

      return {
        verified: false,
        error: err instanceof Error ? err.message : "unknown error",
      };
    }
  }
}
