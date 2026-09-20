import axios from "axios"
import { BASE_URL } from "../../config/url/baseUrl"
import type { ClientsResponse } from "./types"
import { getToken } from "../../config/token/getToken";

export const listClients = async (): Promise<ClientsResponse[]> => {
    const token = getToken();
    
    const response = await axios.get(`${BASE_URL}/client`, {
        headers: {
                    Authorization: `Bearer ${token}`,
                },
    })

    const data = response.data.map((client: any) => {
        return {
            id: client.id,
            name: client.name,
            cnpj: client.cnpj,
            taxRegime: client.taxRegime
        }
    })

    return data;
}