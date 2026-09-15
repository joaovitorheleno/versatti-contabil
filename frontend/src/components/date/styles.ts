// components/date-input/styles.ts
import styled, { createGlobalStyle } from 'styled-components';
import { DatePicker } from 'antd';

export const datePickerPopupClassName = 'versatti-date-picker-popup';

export const StyledDatePicker = styled(DatePicker)`
    width: 100%;

    .ant-picker-input > input {
        font-size: 14px;
        color: #12231C;

        &::placeholder {
            color: #A6B2AC;
        }
    }

    .ant-picker-suffix {
        color: #6B7A73;
    }

    &.ant-picker-focused {
        border-color: #16302A;
        box-shadow: none;

        .ant-picker-suffix {
            color: #16302A;
        }
    }
`;

export const GlobalDatePickerStyle = createGlobalStyle`
    .${datePickerPopupClassName} {
        .ant-picker-panel-container {
            border-radius: 10px;
            box-shadow: 0 12px 32px rgba(18, 35, 28, 0.14);
        }

        .ant-picker-header {
            color: #12231C;

            button:hover {
                color: #16302A;
            }
        }

        .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
            background: #16302A;
        }

        .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
            border-color: #16302A;
        }

        .ant-picker-cell-in-view:not(.ant-picker-cell-selected):hover .ant-picker-cell-inner {
            background: #E9F1EC;
        }

        .ant-picker-now-btn,
        .ant-picker-today-btn {
            color: #16302A;
        }

        .ant-picker-ok button {
            background: #16302A;
            border-color: #16302A;

            &:hover {
                background: #1D3D33;
                border-color: #1D3D33;
            }
        }
    }
`;