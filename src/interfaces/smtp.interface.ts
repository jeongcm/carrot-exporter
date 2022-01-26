export interface SMTPMessage {
  from: string;
  to: string[];
  subject: string;
  html: string;
}
export interface SMTPConfig {
  host: string;
  port: number;
  userName: string;
  password: string;
}
