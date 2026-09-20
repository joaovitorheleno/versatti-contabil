import styled, { keyframes } from 'styled-components';

const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

export const LoginPageWrapper = styled.div`
    min-height: 100vh;
    width: 100vw;
    display: flex;
    font-family: 'Inter', -apple-system, sans-serif;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

export const BrandPanel = styled.div`
    flex: 0 0 42%;
    background: linear-gradient(160deg, #0E1F19 0%, #16302A 55%, #1D3D33 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        width: 520px;
        height: 520px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(168, 217, 192, 0.10) 0%, transparent 70%);
        top: -120px;
        right: -160px;
    }

    @media (max-width: 768px) {
        flex: 0 0 auto;
        padding: 32px 24px;
    }
`;

export const BrandContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1;
    animation: ${fadeInUp} 0.6s cubic-bezier(0.22, 1, 0.36, 1);

    @media (max-width: 768px) {
        align-items: center;
        text-align: center;
        gap: 16px;

        img {
            height: 64px !important;
        }
    }
`;

export const BrandTagline = styled.p`
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 26px;
    line-height: 1.35;
    color: #E9F1EC;
    max-width: 320px;
    margin: 0;

    @media (max-width: 768px) {
        font-size: 18px;
        max-width: none;
    }
`;

export const FormPanel = styled.div`
    flex: 1;
    background: #FAFAF8;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
`;

export const LoginCardContainer = styled.div`
    width: 100%;
    max-width: 360px;
    animation: ${fadeInUp} 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
`;

export const LoginTitle = styled.h1`
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 30px;
    font-weight: 600;
    color: #12231C;
    margin-bottom: 6px;
`;

export const LoginSubtitle = styled.p`
    font-size: 14px;
    color: #6B7A73;
    margin-bottom: 36px;
`;

export const ButtonContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    margin-top: 12px;
`;

export const RegisterLink = styled.div`
    font-size: 13.5px;
    color: #6B7A73;
    text-align: center;

    a {
        color: #16302A;
        font-weight: 600;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
`;