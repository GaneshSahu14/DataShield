import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset"; // Added type prop
}

const Button: React.FC<ButtonProps> = ({ children, onClick, type = "button" }) => {
    return (
        <button onClick={onClick} type={type} className="bg-blue-500 text-white py-2 px-4 rounded">
            {children}
        </button>
    );
};

export default Button;
