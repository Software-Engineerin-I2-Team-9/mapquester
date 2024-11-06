import React from 'react';

interface Point {
  name: string;
  longitude: number;
  latitude: number;
  description: string;
}

interface UpdatePOIFormProps {
  point: Point;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (field: keyof Point, value: string) => void;
  onCancel: () => void;
}

const UpdatePOIForm: React.FC<UpdatePOIFormProps> = ({ point, onSubmit, onChange, onCancel }) => {
  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-100 mb-3">Update Point</h3>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
          <input
            type="text"
            id="name"
            value={point.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            id="description"
            value={point.description}
            onChange={(e) => onChange('description', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            required
          ></textarea>
        </div>
        <div className="flex justify-between">
          <button type="submit" className="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700">
            Update
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="bg-gray-600 text-white rounded-md py-2 px-4 hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePOIForm;