export interface ICredentials{
    email:string,
    password:string
}

export interface IAuthResponse{
    message:string;
    token:string;
}

export interface ITokenDecode{
    id:string;
    name:string;
    role:string;
    iat:number;
    exp:number;
}