import { useState } from 'react';

interface GetNumberButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export function GetNumberButton({ onPress, disabled = false }: GetNumberButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (disabled) return;

    setIsPressed(true);
    onPress();

    // Reset animation after a short delay
    setTimeout(() => {
      setIsPressed(false);
    }, 200);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative
          w-80 h-80
          rounded-full
          bg-gradient-to-br from-primary-500 to-primary-700
          hover:from-primary-600 hover:to-primary-800
          active:from-primary-700 active:to-primary-900
          text-white
          font-bold
          text-3xl
          shadow-2xl
          transition-all
          duration-200
          disabled:opacity-50
          disabled:cursor-not-allowed
          disabled:transform-none
          ${isPressed ? 'scale-95' : 'scale-100'}
          ${!disabled ? 'hover:scale-105' : ''}
        `}
        aria-label="Get queue number"
      >
        {/* Pulse animation ring */}
        {!disabled && (
          <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-25" />
        )}

        {/* Button content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {/* Icon */}
          <svg
            className="w-24 h-24 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>

          {/* Text */}
          <span className="leading-tight">
            Get Queue
            <br />
            Number
          </span>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 translate-x-[-200%] animate-shine" />
        </div>
      </button>

      {/* Instructions */}
      <p className="mt-8 text-xl text-gray-600 text-center max-w-md">
        Press the button above to receive your queue number and ticket
      </p>
    </div>
  );
}
