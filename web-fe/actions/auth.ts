import { userloginSchemafe, userRegestraionSchemafe } from "@/types"
import axios from "axios"
import { redirect } from "next/navigation"


const API_URL = process.env.NEXT_BACKEND_URL as string


export const registerUser = async(body : userRegestraionSchemafe)=>{
    try {
        const response = await axios.post(`${API_URL}/auth/user/register`,
            body
        )
        const user = response.data
        const token = user.token
        localStorage.setItem("token",token)
        return user
    } catch (error) {
        console.log(error)
    }
}

export const resgsterAdmin = async(body : userRegestraionSchemafe)=>{
    try {
        const response = await axios.post(`${API_URL}/auth/admin/register`,
            body
        )
        const user = response.data
        const token = user.token
        localStorage.setItem("token",token)
        return user
    } catch (error) {
        console.log(error)
    }
}


export const loginUser = async(body : userloginSchemafe)=>{
    try {
        const response = await axios.post(`${API_URL}/auth/user/login`,
            body
        )
        const user = response.data
        const token = user.token
        localStorage.setItem("token",token)
        return user
    } catch (error) {
        console.log(error)
    }
}

export const getUser = async()=>{
    try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`${API_URL}/auth/me`,
           { headers :  {
                authorization : `Bearer ${token}`       
            }}
        )
        const user = response.data
       if(user){
        return user
       }
       else{
        redirect("/login")
       }
    }
    catch (error) {
        console.log(error)
    }
}