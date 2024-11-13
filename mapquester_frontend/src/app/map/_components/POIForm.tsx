import React from 'react';
import { Point } from '@/app/utils/types';

interface POIFormProps {
  newPoint: Partial<Point>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (field: keyof Point, value: string) => void;
  onCancel: () => void;
}

const POIForm: React.FC<POIFormProps> = ({ newPoint, onSubmit, onChange, onCancel}) => {
  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Create New Point</h3>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-800">Name</label>
          <input
            type="text"
            id="name"
            value={newPoint.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            className="mt-1 block w-full rounded-md bg-mutedsand border-gray-600 text-gray-600"
            required
          />
        </div>
        {/*<div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-300">Latitude</label>
          <input
            type="number"
            id="latitude"
            value={newPoint.latitude}
            readOnly
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-300">Longitude</label>
          <input
            type="number"
            id="longitude"
            value={newPoint.longitude}
            readOnly
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          />
        </div>*/}
        <div>
          <label htmlFor="tag" className="block text-sm font-medium text-gray-800">Tag</label>
          <select
            id="tag"
            value={newPoint.tag || ''}
            onChange={(e) => onChange('tag', e.target.value)}
            className="mt-1 block w-full rounded-md bg-mutedsand border-gray-600 text-gray-600"
            required
          >
            <option value="" disabled selected>Select your option</option>
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
            value={newPoint.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            className="mt-1 block w-full rounded-md bg-mutedsand border-gray-600 text-gray-600"
            required
          ></textarea>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700">
          Create Point
        </button>
        <button onClick={onCancel} className="w-full bg-red-600 text-white rounded-md py-2 hover:bg-red-700">
          Cancel
        </button>
      </form>
    </div>
  );
};

export default POIForm;
