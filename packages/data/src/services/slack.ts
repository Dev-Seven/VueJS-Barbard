import { WebClient } from "@slack/web-api";

let state: WebClient | null = null;

const init = (apiKey: string) => {
  if (state) return state;
  state = new WebClient(apiKey);
  return state;
};

const instance = () => {
  try {
    return state!;
  } catch (_) {
    throw new Error("services/slack/instance: call the init function first");
  }
};

const send = async (
  message: string,
  conversationId: string,
  slack: WebClient,
): Promise<[ok: boolean, errors: string[]]> => {
  const result = await slack.chat.postMessage({
    text: message,
    channel: conversationId,
  });
  return [result.ok, result.errors ?? []];
};

export default {
  init,
  send,
  instance,
};
