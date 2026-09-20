
import type { DatePickerProps } from 'antd';
import type { ComponentType } from 'react';
import ptBR from 'antd/es/date-picker/locale/pt_BR';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import * as S from './styles';

dayjs.locale('pt-br');

interface DateInputComponentProps extends Omit<DatePickerProps, 'locale' | 'format'> {
  format?: string;
}

const DateComponent = ({
  format = 'DD/MM/YYYY',
  placeholder = '00/00/0000',
  ...rest
}: DateInputComponentProps) => {
  const StyledDatePicker = S.StyledDatePicker as unknown as ComponentType<DatePickerProps>;

  return (
    <>
      <S.GlobalDatePickerStyle />
      <StyledDatePicker
        locale={ptBR}
        format={format}
        placeholder={placeholder}
        suffixIcon={<CalendarOutlined />}
        variant="underlined"
        popupClassName={S.datePickerPopupClassName}
        {...rest}
      />
    </>
  );
};

export default DateComponent;