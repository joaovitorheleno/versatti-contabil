import SubmitButton from "../../components/button/SubmitButton"
import * as S from "./styles"

const LoginPage = () => {
    return (
        <>
            <S.LoginCardContainer>
                <S.ButtonContainer>
                    <SubmitButton
                        type="primary"
                        children="Entrar"
                        onClick={() => {}}
                        style={{ 
                            backgroundColor: "#C9A968",
                            borderColor: "#C9A968",
                            background: 'transparent',
                            color: "#C9A968",
                            width: "200px",
                            shadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                        }}
                    />
                </S.ButtonContainer>  
            </S.LoginCardContainer>
        </>
    )
}

export default LoginPage