type LoadingOverlayProps = {
  message?: string;
};

export function LoadingOverlay({
  message = "AIがレポートを作成しています…",
}: LoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 px-6 backdrop-blur-xl"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex max-w-sm flex-col items-center gap-7 text-center">
        <div className="loading-ring" aria-hidden="true" />
        <div className="space-y-3">
          <div className="flex justify-center gap-2" aria-hidden="true">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
          <p className="text-[17px] font-semibold tracking-tight text-black">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
