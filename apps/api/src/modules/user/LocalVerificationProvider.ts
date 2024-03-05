import type { VerificationProvider } from "./VerificationProvider.js";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";

export interface VerificationResponse {
  CodeResult: string; //
  CountRegenerate: number;
  ErrorMessage?: string;
}

const SuccessCode = "100";

export class LocalVerificationProvider implements VerificationProvider {
  constructor(
    private apiKey: string,
    private secretKey: string,
  ) {}

  async send(phoneNumber: string): Promise<{ sent: boolean; error?: string }> {
    const options: AxiosRequestConfig = {
      method: "GET",
      url: "http://rest.esms.vn/MainService.svc/json/SendMessageAutoGenCode_V4_get",
      params: {
        Phone: phoneNumber,
        NumCharOfCode: "6",
        ApiKey: this.apiKey,
        SecretKey: this.secretKey,
        Brandname: "Barbaard",
        Type: "2",
        TimeAlive: "5",
        message: "Barbaard - Your OTP to log in houseofbarbaard.com is {OTP}",
      },
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const { data }: { data: VerificationResponse } =
        await axios.request(options);
      console.log({ data });
      if (data.CodeResult === SuccessCode) {
        return { sent: true };
      } else {
        return {
          sent: false,
          error: data.ErrorMessage,
        };
      }
    } catch (err) {
      console.log(err);
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
    const options: AxiosRequestConfig = {
      method: "GET",
      url: "http://rest.esms.vn/MainService.svc/json/CheckCodeGen_V4_get",
      params: {
        Phone: phoneNumber,
        ApiKey: this.apiKey,
        SecretKey: this.secretKey,
        Code: code,
      },
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const { data }: { data: VerificationResponse } =
        await axios.request(options);
      console.log({ data });
      if (data.CodeResult === SuccessCode) {
        return { verified: true };
      } else {
        return {
          verified: false,
          error: data.ErrorMessage,
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
