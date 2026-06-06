import { IProducts } from "./products.model";

export interface IProductInCart {
  product: IProducts;
  quantity: number;
  color?: string;
  size?: string;
}
export interface ICart {
  _id?: string;
  user: string;
  products: IProductInCart[];
  totalPrice: number;
  totalItems: number;
  delivery: IDelivery;
}
export interface ICartResponse{
    message: string,
    data:ICart
}
export interface IDelivery {
  id: string | null;
  date: string | null | Date;
  fee: number;
  label?: string;
  etaDays?: number;
  dateLabel?: string;
}