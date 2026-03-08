import { UserPlus, Clock, Check, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { ConnectionStatus } from '../../types/connections.types';

interface ConnectButtonProps {
  status: ConnectionStatus;
  onConnect: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function ConnectButton({
  status,
  onConnect,
  onAccept,
  onDecline,
  size = 'sm',
  className = '',
}: ConnectButtonProps) {
  switch (status) {
    case 'none':
    case 'rejected':
      return (
        <Button
          size={size}
          variant="outline"
          onClick={(e) => { e.stopPropagation(); onConnect(); }}
          className={className}
        >
          <UserPlus className="w-3.5 h-3.5 mr-1" />
          Connect
        </Button>
      );

    case 'pending_sent':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            color: 'var(--color-warning)',
          }}
        >
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );

    case 'pending_received':
      return (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <Button
            size={size}
            onClick={(e) => { e.stopPropagation(); onAccept?.(); }}
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Accept
          </Button>
          <Button
            size={size}
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onDecline?.(); }}
            style={{ color: 'var(--color-error)' }}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      );

    case 'accepted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}
          style={{
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            color: 'var(--color-success)',
          }}
        >
          <Check className="w-3 h-3" />
          Connected
        </span>
      );

    default:
      return null;
  }
}
