import type { IMessageChannel } from "core";
import { WebClient } from "@slack/web-api";
import slack from "../services/slack.js";

export class SlackMessageChannel implements IMessageChannel {
  constructor(
    private slackInstance: WebClient,
    private channel: string,
  ) {}

  async send(message: string): Promise<boolean> {
    const [ok, errs] = await slack.send(
      message,
      this.channel,
      this.slackInstance,
    );

    console.warn("SlackMessageChannel", errs.join(" ,"));
    return ok;
  }
}
