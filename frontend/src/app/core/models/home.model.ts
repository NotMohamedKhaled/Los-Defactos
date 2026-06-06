export interface ICategory{
    name: string,
    desc: string,
    imgUrl: string
}
export interface IFaq{
  _id: string;
    question: string,
    answer: string,
    isPosted: boolean
}
export interface ITestimonial {
  _id:string,
  user: {
    _id: string;
    name: string;
  };
  message: string;
  isPosted: boolean;
  createdAt:string
}



export interface ICategoryResponse{
message: string,
data: ICategory[],
}
export interface IFaqResponse{
message: string,
data: IFaq[];
}
export interface ITestimonialResponse{
message: string,
data: ITestimonial[];
}