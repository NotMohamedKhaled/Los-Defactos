export interface ISignup{
    name: string,
    email:string,
    password:string,
    phone:string,
}

export interface ISignupResponse{
    message: string,
    data:any
}