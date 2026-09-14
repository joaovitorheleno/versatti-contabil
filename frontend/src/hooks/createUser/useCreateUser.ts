import { useState } from "react";
import type { CreateUserType } from "../../service/user/types";
import { createUser } from "../../service/user/integration";

const useCreateUser = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const handleCreateUser = async (user: CreateUserType) => {

        if(!user.cpf || !user.email) {
            return;
        }
        const response = await createUser(user)

        return response
    }


}

export default useCreateUser;