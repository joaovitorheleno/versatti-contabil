import SubmitButton from "../../components/button/SubmitButton"
import { ButtonContainer } from "./styles"

const LoginPage = () => {
    return (
        <>
            <ButtonContainer>
                <SubmitButton
                    type="primary"
                    color="#18ff24"
                    children="Login"
                    onClick={() => {}}
                />

                <SubmitButton
                    type="primary"
                    color="#18ff24"
                    children="Register"
                    onClick={() => {}}
                />
            </ButtonContainer>  
        </>
    )
}

export default LoginPage