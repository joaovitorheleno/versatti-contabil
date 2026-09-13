import styled, { keyframes } from 'styled-components';

const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(24px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
`;

export const RecoverPasswordPageWrapper = styled.div`
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f9f7f3 0%, #f1ede4 100%);
    padding: 24px;
    box-sizing: border-box;
`;

export const RecoverPasswordCardContainer = styled.div`
    width: 100%;
    max-width: 400px;
    background: #ffffff;
    border-radius: 16px;
    padding: 40px 32px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    animation: ${fadeInUp} 0.5s cubic-bezier(0.22, 1, 0.36, 1);

    @media (max-width: 480px) {
        padding: 32px 24px;
        max-width: 90%;
    }
`;

export const RecoverPasswordTitle = styled.h1`
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    text-align: center;
    margin-bottom: 8px;
`;

export const RecoverPasswordSubtitle = styled.p`
    font-size: 14px;
    color: #8c8c8c;
    text-align: center;
    margin-bottom: 32px;
`;

export const ButtonContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
`;

export const RegisterLink = styled.div`
    font-size: 14px;
    color: #16302A;
    text-align: center;

    a {
        color: #16302A;
        font-weight: 500;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
`;