import React from 'react';

interface CustomButtonProps {
  paddingX: number;
  paddingY: number;
  text: string;
  buttonType: 'submit' | 'reset' | 'button';
  customWidth: string;
  textSize: string;
}

const CustomButton = ({
  paddingX,
  paddingY,
  text,
  buttonType,
  customWidth,
  textSize,
}: CustomButtonProps) => {
  return (
    <button
      type={`${buttonType}`}
      className={`${
        customWidth !== 'no' && `w-${customWidth}`
      } uppercase bg-white px-${paddingX} py-${paddingY} text-${textSize} border border-black font-bold text-blue-600 shadow-sm hover:bg-black focus:outline-none focus:ring-2`}
    >
      {text}
    </button>
  );
};

export default CustomButton;
