import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="
        px-6 py-3 
        bg-gradient-to-r from-blue-600 to-indigo-600 
        text-white 
        rounded-lg 
        shadow-md 
        font-sans 
        text-lg 
        font-semibold 
        transition 
        transform 
        hover:scale-105 
        hover:shadow-xl 
        focus:outline-none 
        focus:ring-4 
        focus:ring-blue-300
        active:scale-95
        cursor-pointer
      "
    >
      {label}
    </button>
  );
};

export default Button;
