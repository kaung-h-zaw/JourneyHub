const ToastMessage = ({ open, message }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
      <p className="text-sm font-medium text-[var(--text-primary)]">
        {message}
      </p>
    </div>
  );
};

export default ToastMessage;
