export interface smtpMessage {
  from: string;
  to: string[];
  subject: string;
  text: string;
}
