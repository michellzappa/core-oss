interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={`w-8 h-8 border-4 border-[var(--accent)] border-t-black dark:border-t-white rounded-full animate-spin ${
        className || ""
      }`}
      role="status"
      aria-label="Loading"
    />
  );
}
