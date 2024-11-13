import React from 'react';
import { Point } from '@/app/utils/types';

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
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Update Point</h3>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-800">Name</label>
          <input
            type="text"
            id="name"
            value={point.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="mt-1 block w-full rounded-md bg-mutedsand border-gray-600 text-gray-600"
            required
          />
        </div>
        <div>
          <label htmlFor="tag" className="block text-sm font-medium text-gray-800">Tag</label>
          <select
            id="tag"
            value={point.tag}
            onChange={(e) => onChange('tag', e.target.value)}
            className="mt-1 block w-full rounded-md bg-mutedsand border-gray-600 text-gray-600"
          >
            <option value="food">Food</option>
            <option value="event">Event</option>
            <option value="school">School</option>
            <option value="photo">Photo</option>
            <option value="music">Music</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-800">Description</label>
          <textarea
            id="description"
            value={point.description}
            onChange={(e) => onChange('description', e.target.value)}
            className="mt-1 block w-full rounded-md bg-mutedsand border-gray-600 text-gray-600"
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
