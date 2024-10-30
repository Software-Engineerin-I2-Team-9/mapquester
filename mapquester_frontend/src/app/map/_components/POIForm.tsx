import React from 'react';

interface Point {
  name: string;
  longitude: number;
  latitude: number;
  description: string;
}

interface POIFormProps {
  newPoint: Partial<Point>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (field: keyof Point, value: string) => void;
}

const POIForm: React.FC<POIFormProps> = ({ newPoint, onSubmit, onChange }) => {
  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-100 mb-3">Create New Point</h3>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
          <input
            type="text"
            id="name"
            value={newPoint.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>
        <div>
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
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            id="description"
            value={newPoint.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            required
          ></textarea>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700">
          Create Point
        </button>
      </form>
    </div>
  );
};

export default POIForm;