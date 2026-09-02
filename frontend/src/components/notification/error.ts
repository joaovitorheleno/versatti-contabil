import { notification } from "antd";
import type { NotificationProps } from "./types";

export const openErrorNotification = (errorNotification: NotificationProps) => {
  notification.error({
    title: errorNotification.title,
    description: errorNotification.description,
    showProgress: errorNotification.showProgress,
    pauseOnHover: errorNotification.pauseOnHover,
  });
};