export interface User {
  "id": string,
  "email": string,
  "password": string,
  "username": string,
  "firstName": string,
  "lastName": string,
  "mobile": string,
  "photo": string
  "lastAccess": Date
  "createdAt": Date,
  "updatedAt": Date,
}


export interface NewUser {
  "email": string,
  "password": string,
  "username": string,
}