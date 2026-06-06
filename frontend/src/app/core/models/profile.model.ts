import { ITestimonial } from "./home.model";
import { IOrder } from "./order.model";

export interface IProfile{
name:string,
email:string,
role:string,
address:string[],
phone:string,
orders:IOrder[],
testimonials:ITestimonial[],
}
export interface IProfileResponse{
    message:string,
    data:IProfile
}