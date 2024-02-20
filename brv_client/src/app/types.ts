export class connectionConfirmation implements IMessageBody {
  constructor(clientId: string = '') {
    this.clientId = clientId;
  }
  timestamp: Date = new Date();
  message: string = '';
  clientId: string = '';
  source: string = 'server';
}

export class chatMessage implements IMessageBody {
  message: string = '';
  source: string = 'bot';
  context: any = undefined;
  timestamp: Date = new Date();
}
export interface IMessageBody {
  message: string;
  source: string;
  timestamp: Date;
}

export class SocketMessage {
  clientId: string = '';
  type: string = '';
  body: IMessageBody = <IMessageBody>{};
  context: any | never;
}


