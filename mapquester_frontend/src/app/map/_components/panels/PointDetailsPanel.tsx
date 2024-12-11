import { FC, useState } from 'react';
import { Point, ReactionUser } from '@/app/utils/types';
import { capitalize } from '@/app/utils/fns';
import CreatePointForm from './forms/CreatePointForm';
import UpdatePointForm from './forms/UpdatePointForm';
import PointDetails from './forms/PointDetails';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface PointDetailsPanelProps {
  feed?: boolean;
  newPoint: Partial<Point> | null;
  selectedPoint: Point | null;
  isUpdating: boolean;
  onFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onFormChange: (field: keyof Point, value: string | boolean | Array<{filename: string, data: File}>) => void;
  onCancelPointCreation: () => void;
  onUpdateSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onUpdateChange: (field: keyof Point, value: string | boolean | Array<{filename: string, data: File}>) => void;
  onDeletePoint: (point: Point) => void;
  setSelectedPoint: (point: Point | null) => void;
  setIsUpdating: (isUpdating: boolean) => void;
  tags: string[];
  setShowReactionModal: (show: boolean) => void;
  setReactionUsers: (users: ReactionUser[]) => void;
}

const PointDetailsPanel: FC<PointDetailsPanelProps> = ({
  feed,
  newPoint,
  selectedPoint,
  isUpdating,
  onFormSubmit,
  onFormChange,
  onCancelPointCreation,
  onUpdateSubmit,
  onUpdateChange,
  onDeletePoint,
  setSelectedPoint,
  setIsUpdating,
  tags,
  setShowReactionModal,
  setReactionUsers
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!newPoint && !selectedPoint) return null;

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedPoint) {
      onDeletePoint(selectedPoint);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="absolute inset-x-0 bottom-[60px] z-50">
        <div className="w-full bg-white/95 backdrop-blur-sm p-4 rounded-t-lg shadow-lg relative animate-slideUp">
          {newPoint ? (
            <CreatePointForm
              point={newPoint}
              onSubmit={onFormSubmit}
              onChange={onFormChange}
              onCancel={onCancelPointCreation}
              tags={tags}
            />
          ) : selectedPoint && (
            isUpdating ? (
              <UpdatePointForm
                point={selectedPoint}
                onSubmit={onUpdateSubmit}
                onChange={onUpdateChange}
                onCancel={() => setIsUpdating(false)}
                tags={tags}
              />
            ) : (
              <>
                <PointDetails
                    feed={feed}
                    point={selectedPoint}
                    onClose={() => setSelectedPoint(null)}
                    setShowReactionModal={setShowReactionModal}
                    setReactionUsers={setReactionUsers}
                />
                {!feed && (
                  <div className="mt-4 flex space-x-2">
                    <button 
                    onClick={() => setIsUpdating(true)}
                    className="bg-[#D69C89] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full"
                  >
                    Update
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
                  >
                    Delete
                    </button>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Delete Point"
        message="Are you sure you want to delete this point?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default PointDetailsPanel;
