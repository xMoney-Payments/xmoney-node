import { XMoney } from './XMoney';

export class XMoneyResource {
  protected client: XMoney;

  constructor(client: XMoney) {
    this.client = client;
  }
}
