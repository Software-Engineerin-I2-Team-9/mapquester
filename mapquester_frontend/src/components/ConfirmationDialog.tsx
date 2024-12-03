import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Create New Point
        </h2>
        <p className="text-gray-600 mb-6">
          Do you want to create a new point at this location?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full bg-[#C91C1C] text-white hover:opacity-90 font-medium"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;