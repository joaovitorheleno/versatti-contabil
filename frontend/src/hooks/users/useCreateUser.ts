import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { openErrorNotification } from "../../components/notification/error";
import { openSuccessNotification } from "../../components/notification/success";
import { createUser } from "../../service/user/integration";
import type { CreateUserType } from "../../service/user/types";

const useCreateUser = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate()

    const handleCreateUser = async (user: CreateUserType) => {

        try {
            setLoading(true)
            const response = await createUser(user);

            if(response) {
                openSuccessNotification({
                    title: "Sucesso",
                    description: "Usuário cadastrado"
                })

                navigate('/users')
            }

            return response
        } catch (e: any) {
            setLoading(false);
            openErrorNotification({
                title: "Falha ao cadastrar usuário",
                description: `Não foi possível cadastrar o usuário: ${e?.response?.data?.message || e?.message || e}`
            });
        } finally {
            setLoading(false)
        }
    }

    return {
        handleCreateUser,
        loading
    }

}

export default useCreateUser;