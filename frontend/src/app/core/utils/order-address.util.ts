import { IOrder } from '../models/order.model';

export interface IOrderAddressView {
  lines: string[];
  hasAddress: boolean;
}

/** Build display lines for shipping address (order snapshot, then user profile fallback). */
export function getOrderAddressView(order: IOrder): IOrderAddressView {
  const lines: string[] = [];

  const name = order.shippingName || order.user?.name;
  const email = order.shippingEmail || order.user?.email;
  if (name) lines.push(name);
  if (email) lines.push(email);

  const street = order.address?.[0] || order.user?.address?.[0];
  const city = order.address?.[1] || order.user?.address?.[1];
  const zip = order.address?.[2] || order.user?.address?.[2];
  const addressLine = [street, city, zip].filter(Boolean).join(', ');
  if (addressLine) lines.push(addressLine);

  const phone = order.phone || order.user?.phone;
  if (phone) lines.push(`Phone: ${phone}`);

  return {
    lines,
    hasAddress: !!addressLine || !!phone,
  };
}
