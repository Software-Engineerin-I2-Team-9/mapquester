import { FC, useState } from 'react';
import { Point } from '@/app/utils/types';
import { capitalize } from '@/app/utils/fns';

interface ContentItem {
  filename: string;
  data: File;
}

interface UpdatePointFormProps {
  point: Point;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (field: keyof Point, value: string | boolean | ContentItem[]) => void;
  onCancel: () => void;
  tags: string[];
}

const UpdatePointForm: FC<UpdatePointFormProps> = ({
  point,
  onSubmit,
  onChange,
  onCancel,
  tags
}) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>(point.content || []);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    const newContentItems = validFiles.map(file => ({
      filename: file.name,
      data: file
    }));

    setContentItems(prev => [...prev, ...newContentItems]);
    onChange('content', [...contentItems, ...newContentItems]);
  };

  const handleFilenameChange = (index: number, newFilename: string) => {
    const isValid = /^[a-zA-Z0-9-_\s]+\.[a-zA-Z0-9]+$/.test(newFilename);
    
    if (!isValid) {
      setErrors(prev => ({
        ...prev,
        [index]: 'Filename can only contain letters, numbers, spaces, hyphens, and underscores, and must have an extension'
      }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    const updatedItems = contentItems.map((item, idx) =>
      idx === index ? { ...item, filename: newFilename } : item
    );
    setContentItems(updatedItems);
    onChange('content', updatedItems);
  };

  const removeContent = (index: number) => {
    const updatedItems = contentItems.filter((_, idx) => idx !== index);
    setContentItems(updatedItems);
    onChange('content', updatedItems);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-[450px]">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={point.title}
            onChange={(e) => onChange('title', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C] sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tag</label>
          <select
            value={point.tag}
            onChange={(e) => onChange('tag', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C] sm:text-sm"
          >
            {tags.map(tag => (
              <option key={tag} value={tag}>
                {capitalize(tag)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={point.description}
            onChange={(e) => onChange('description', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C91C1C] focus:border-[#C91C1C] sm:text-sm"
            rows={3}
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Public</label>
          <div 
            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${point.isPublic ? 'bg-[#C91C1C]' : 'bg-gray-300'}`}
            onClick={() => onChange('isPublic', !point.isPublic)}
          >
            <div 
              className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${point.isPublic ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Add Files (PDF, JPG, PNG)</label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C91C1C] file:text-white hover:file:bg-red-600"
          />
        </div>

        <div className="mt-4 space-y-3">
          {contentItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={item.filename}
                onChange={(e) => handleFilenameChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm"
                placeholder="Filename with extension"
              />
              <button
                type="button"
                onClick={() => removeContent(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
              {errors[index] && (
                <p className="text-red-500 text-xs">{errors[index]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="bg-[#D69C89] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full"
        >
          Update
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default UpdatePointForm;
