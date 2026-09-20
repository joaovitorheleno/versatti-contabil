import { notification } from "antd";
import type { NotificationProps } from "./types";

export const openSuccessNotification = (successNotification: NotificationProps) => {
  notification.success({
    title: successNotification.title,
    description: successNotification.description,
    showProgress: successNotification.showProgress,
    pauseOnHover: successNotification.pauseOnHover,
  });
};