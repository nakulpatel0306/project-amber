import { useMessaging } from '../../contexts/MessagingContext';
import { MessagePanel } from './MessagePanel';

export function MessagePanelContainer() {
  const { openChats } = useMessaging();

  if (openChats.length === 0) return null;

  return (
    <>
      {openChats.map((chat, index) => (
        <MessagePanel
          key={chat.coffeeChatId}
          coffeeChatId={chat.coffeeChatId}
          partner={chat.partner}
          messages={chat.messages}
          isMinimized={chat.isMinimized}
          position={index}
        />
      ))}
    </>
  );
}
