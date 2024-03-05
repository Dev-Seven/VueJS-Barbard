export enum SendinblueEventType {
  Sent = 'request',
  Click = 'click',
  Deferred = 'deferred',
  Delivered = 'delivered',
  SoftBounce = 'soft_bounce',
  HardBounce = 'hard_bounce',
  Complaint = 'complaint',
  UniqueOpened = 'unique_opened', // first opening
  Opened = 'opened',
  InvalidEmail = 'invalid_email',
  Blocked = 'blocked',
  Error = 'error',
  Unsubscribed = 'unsubscribed',
  ProxyOpen = 'proxy_open'
}
