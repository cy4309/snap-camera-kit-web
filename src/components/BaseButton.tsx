interface IBaseButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const BaseButton: React.FC<IBaseButtonProps> = ({
  label,
  className,
  onClick,
  children,
}) => {
  return (
    <button
      className={`p-3 font-bold text-xl rounded-full bg-white text-black hover:bg-gray-500 ${className}`}
      onClick={onClick}
    >
      {label || children}
    </button>
  );
};

export default BaseButton;
