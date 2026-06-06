import { IProductInCart } from "./cart.model";
import { IProducts } from "./products.model";



export interface IOrder {
  _id?: string; // optional for new orders before MongoDB assigns an ID
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string[];
  };

  shippingName?: string;
  shippingEmail?: string;

  products: {
    _id:string,
    product:{
      _id: string,
      title: string,
      price: number,
      imgUrl: string,
    };
    price: number,
    quantity: number,
  }[];
  phone?: string;
  address?: string[];

  totalPrice: number,

  delivery: {
    id: string,
    date: string | Date,
    fee: number,
  };

  orderStat: 'pending' | 'preparing' | 'shipping' | 'recieved' | 'delivered' | 'cancelled' | 'rejected by admin';


  isDeleted: boolean;
  orderedAt?: string | Date;
}

export interface IOrederResponse{
   message: string,
   data:IOrder[]; 
}
