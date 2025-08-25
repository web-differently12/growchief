import { NotificationsIcon } from "@growchief/frontend/components/icons/notifications.icon.tsx";
import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { type FC, useRef, useState, useEffect } from "react";
import clsx from "clsx";
import { useNotificationsRequests } from "@growchief/frontend/requests/notifications.request.ts";

interface Notification {
  id: string;
  title: string;
  content: string;
  additionalInfo?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

const NotificationItem: FC<{ notification: Notification }> = ({
  notification,
}) => {
  return (
    <div
      className={clsx(
        "px-[16px] py-[12px] border-b border-background last:border-b-0 transition-all duration-500 ease-in-out",
        !notification.read && "bg-menu",
      )}
    >
      <div className="flex items-start gap-[12px]">
        <div
          className={clsx(
            "w-[8px] h-[8px] rounded-full mt-[6px] flex-shrink-0 transition-all duration-500 ease-in-out",
            !notification.read ? "bg-btn-primary" : "bg-secondary/30",
          )}
        />
        <div className="flex-1 min-w-0">
          <div
            className={clsx(
              "text-[14px] font-[600] mb-[4px] truncate transition-all duration-500 ease-in-out",
              !notification.read ? "text-text-menu" : "text-primary",
            )}
          >
            {notification.title}
          </div>
          <div
            className={clsx(
              "text-[12px] mb-[6px] line-clamp-2 transition-all duration-500 ease-in-out",
              !notification.read ? "text-text-menu" : "text-secondary",
            )}
          >
            {notification.content}
          </div>
          <div className="text-[11px] text-secondary/60 transition-all duration-500 ease-in-out">
            {formatRelativeTime(notification.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationsComponent = () => {
  const fetch = useFetch();
  const ref = useRef<SVGSVGElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const notificationRequests = useNotificationsRequests();

  const count = notificationRequests.count();
  const notifications = notificationRequests.notifications(isOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Mark all notifications as read after dropdown is open for a few seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isOpen && notifications.data && notifications.data.length > 0) {
      timeoutId = setTimeout(async () => {
        // Check if there are any unread notifications
        const hasUnread = notifications.data.some((n: Notification) => !n.read);

        if (hasUnread) {
          try {
            // Call the endpoint that marks all as read (this happens automatically in /recent endpoint)
            await fetch("/notifications/recent");
            // Update the notifications data to reflect read status
            notifications.mutate();
            // Update the count to 0
            count.mutate();
          } catch (error) {
            console.error("Failed to mark notifications as read:", error);
          }
        }
      }, 3000); // 3 seconds delay
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen, notifications.data, fetch, notifications, count]);

  // Revalidate count when dropdown closes
  useEffect(() => {
    if (!isOpen && notifications.data) {
      count.mutate();
    }
  }, [isOpen, notifications.data, count]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <NotificationsIcon
        exists={count?.data?.count > 0}
        ref={ref}
        onClick={handleToggle}
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-[100%] right-0 mt-[8px] w-[380px] max-h-[500px] bg-innerBackground rounded-[8px] border border-background shadow-lg overflow-hidden z-50"
        >
          <div className="px-[16px] py-[12px] border-b border-background bg-background/50">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-[600] text-primary">
                Notifications
              </h3>
              {count?.data?.count > 0 && (
                <div className="px-[8px] py-[2px] bg-btn-primary text-white text-[11px] font-[600] rounded-full">
                  {count.data.count}
                </div>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.isLoading ? (
              <div className="px-[16px] py-[20px] text-center text-secondary">
                Loading notifications...
              </div>
            ) : notifications.data && notifications.data.length > 0 ? (
              notifications.data.map((notification: Notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))
            ) : (
              <div className="px-[16px] py-[32px] text-center text-secondary">
                <div className="text-[14px] mb-[4px]">No notifications yet</div>
                <div className="text-[12px]">
                  You'll see your notifications here
                </div>
              </div>
            )}
          </div>

          {notifications.data && notifications.data.length > 0 && (
            <div className="px-[16px] py-[8px] border-t border-background bg-background/30">
              <div className="text-[11px] text-secondary text-center">
                Showing recent notifications
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
