import styled from "styled-components";

export const PageWrapper = styled.div`
    max-width: 100%;
    padding: 40px 32px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    @media (max-width: 600px) {
        padding: 24px 16px;
    }
`;

export const PageHeader = styled.div`
    margin-bottom: 28px;
`;

export const PageTitle = styled.h1`
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 26px;
    font-weight: 600;
    color: #12231C;
    margin: 0 0 6px 0;
`;

export const PageSubtitle = styled.p`
    font-size: 14px;
    color: #6B7A73;
    margin: 0;
`;

export const FormCard = styled.div`
    background: #FFFFFF;
    border: 1px solid #E4E7E5;
    border-radius: 12px;
    padding: 32px;

    .ant-form-item {
        margin-bottom: 22px;
    }

    .ant-form-item-label > label {
        font-size: 13px;
        font-weight: 500;
        color: #12231C;
    }

    .ant-input:focus,
    .ant-input-focused,
    .ant-picker-focused {
        border-color: #16302A;
        box-shadow: none;
    }

    @media (max-width: 600px) {
        padding: 24px 20px;
    }
`;

export const FieldRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
        gap: 0;
    }
`;

export const DateFieldWrapper = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
        gap: 0;
    }
`;

export const ActionsRow = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
    padding-top: 20px;
    border-top: 1px solid #EEF0EF;
`;

export const CancelButton = styled.button`
    padding: 9px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #6B7A73;
    background: transparent;
    border: 1px solid #E4E7E5;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
        border-color: #C7CDC9;
        color: #12231C;
    }
`;

export const SaveButton = styled.button`
    padding: 9px 22px;
    font-size: 14px;
    font-weight: 500;
    color: #FAFAF8;
    background: #16302A;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
        background: #1D3D33;
    }
`;