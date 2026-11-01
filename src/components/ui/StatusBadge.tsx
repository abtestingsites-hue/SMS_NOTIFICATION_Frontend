import React from 'react';

export type StatusVariant =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'RETRYING'
  | 'DEAD_LETTER'
  | 'ACTIVE'
  | 'PAUSED'
  | 'DRAFT'
  | 'LIVE'
  | 'SANDBOX';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md',
  pulse = false
}) => {
  const norm = (variant || status || '').toUpperCase();

  let colorClasses = 'bg-[#F1F4F9] text-[#737D90] border-[#E8EAF0]';
  let dotColor = 'bg-[#737D90]';

  if (norm === 'CONNECTED' || norm === 'COMPLETED' || norm === 'ACTIVE' || norm === 'LIVE') {
    colorClasses = 'bg-[#E8F7F0] text-[#16A36A] border-[#C8EEDC]';
    dotColor = 'bg-[#16A36A]';
  } else if (norm === 'SCHEDULED' || norm === 'RUNNING') {
    colorClasses = 'bg-[#EEF1FC] text-[#5269D9] border-[#D9E0F8]';
    dotColor = 'bg-[#5269D9]';
  } else if (norm === 'RETRYING' || norm === 'PAUSED' || norm === 'SANDBOX') {
    colorClasses = 'bg-[#FDF6EC] text-[#E5A23B] border-[#F8E3C3]';
    dotColor = 'bg-[#E5A23B]';
  } else if (norm === 'FAILED' || norm === 'DEAD_LETTER' || norm === 'DISCONNECTED') {
    colorClasses = 'bg-[#FDF0F1] text-[#D94D59] border-[#F9CFD3]';
    dotColor = 'bg-[#D94D59]';
  } else if (norm === 'CANCELLED' || norm === 'DRAFT') {
    colorClasses = 'bg-[#F7F8FC] text-[#737D90] border-[#E8EAF0]';
    dotColor = 'bg-[#A0AEC0]';
  }

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${colorClasses} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulse ? 'animate-ping' : ''}`}
      />
      <span>{status}</span>
    </span>
  );
};

