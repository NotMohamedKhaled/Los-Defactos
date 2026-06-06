import { IOrder } from "./order.model";

 export interface IUser{
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string[]; // Array of addresses
  role: 'user' | 'admin';
  isDeleted?: boolean;
  orders?: IOrder[]; // list of Order IDs
    showOrders?: boolean; // ✅ Add this line

  testimonials?: string[]; // list of Testimonial IDs
  createdAt?: Date;
  updatedAt?: Date;
}