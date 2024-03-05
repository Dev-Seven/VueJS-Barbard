export interface VerificationProvider {
  send(phoneNumber: string): Promise<{ sent: boolean; error?: string }>;
  verify(
    phoneNumber: string,
    code: string,
  ): Promise<{ verified: boolean; error?: string }>;
}
