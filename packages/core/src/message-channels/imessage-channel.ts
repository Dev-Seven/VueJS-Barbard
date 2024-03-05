export interface IMessageChannel {
  send(message: string): Promise<boolean>;
}
