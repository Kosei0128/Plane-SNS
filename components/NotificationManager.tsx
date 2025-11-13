"use client";

import { useNotificationStore } from "@/lib/notification-store";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const icons = {
  success: <CheckCircle className="h-6 w-6 text-green-500" />,
  error: <XCircle className="h-6 w-6 text-red-500" />,
  info: <Info className="h-6 w-6 text-blue-500" />,
};

export function NotificationManager() {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-[100] flex items-start px-4 py-6 sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-transform duration-300 ease-in-out"
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">{icons[notification.type]}</div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
