import React, { useState } from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
      setIsClosing(false);
    }, 500);
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      onConfirm();
      setIsClosing(false);
    }, 500);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30
        ${isClosing ? 'animate-[fadeOut_0.5s_ease-in-out]' : 'animate-[fadeIn_0.5s_ease-in-out]'}`}
    >
      <div 
        className={`bg-white rounded-lg p-6 max-w-sm w-full mx-4 transform transition-all
          ${isClosing ? 'animate-[slideOut_0.5s_ease-in-out]' : 'animate-[slideIn_0.5s_ease-in-out]'}`}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Point</h3>
        <p className="text-gray-600 mb-6">Do you want to create a new point at this location?</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
          >
            No
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;