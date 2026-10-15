import type {
  TicketCategoryEnum,
  TicketPriorityEnum,
  TicketStatusEnum,
} from "../../common/enum/ticket.enum";

export type TicketSummary = {
  id: string;
  number: number;
  subject: string;
  category: TicketCategoryEnum;
  priority: TicketPriorityEnum;
  status: TicketStatusEnum;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  client: { id: string; name: string; cnpj: string };
  openedBy: { id: string; name: string };
};

export type TicketMessage = {
  id: string;
  body: string;
  fromOffice: boolean;
  createdAt: string;
  author: { id: string; name: string };
  file: { name: string; mime: string; size: string } | null;
};

export type TicketDetail = TicketSummary & { messages: TicketMessage[] };

export type CreateTicketPayload = {
  clientId: string;
  subject: string;
  category: TicketCategoryEnum;
  priority?: TicketPriorityEnum;
  message: string;
  file?: File;
};
