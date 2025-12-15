import { XMoney } from '../XMoney';
import { getBase64JsonRequest, getBase64Checksum } from '../utils';
import { OrderCreateRequest } from './Orders';

export class Checkout {
  private client: XMoney;

  constructor(client: XMoney) {
    this.client = client;
  }

  /**
   * Generates the HTML string for a hosted checkout form.
   * @param orderInput The order data.
   * @returns The HTML string containing the auto-submitting form.
   */
  public createHosted(orderInput: OrderCreateRequest): string {
    const secureUrl = this.client.getSecureBaseUrl();

    // Prepare order data
    const order = { ...orderInput };

    // Ensure saveCard is set
    if (order.saveCard === undefined) {
      order.saveCard = false;
    }

    const payload = getBase64JsonRequest(order);
    const checksum = getBase64Checksum(order, this.client.getSecretKey());

    return `<form id="xmoney-checkout-form" name="xmoney-checkout-form" 
    action="${secureUrl}" method="post" accept-charset="UTF-8">
    <input type="hidden" name="jsonRequest" value="${payload}">
    <input type="hidden" name="checksum" value="${checksum}">
    <input type="submit" style="visibility:hidden">
    </form>
    <script type="text/javascript">
      window.onload=function(){
        window.setTimeout('document.xmoney-checkout-form.submit()', 200)
      }
    </script>`;
  }
}
