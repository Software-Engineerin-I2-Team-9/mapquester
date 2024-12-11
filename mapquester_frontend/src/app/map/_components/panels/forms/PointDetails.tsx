import { FC, useState, useEffect, useRef } from 'react';
import { Point } from '@/app/utils/types';
import { capitalize } from '@/app/utils/fns';
import { useRecoilValue } from 'recoil';
import { authState } from '@/app/atoms/authState';
import apiClient from '@/app/api/axios';
import { tagToColorMapping } from '@/app/utils/data';

interface PointDetailsProps {
  point: Point;
  onClose: () => void;
  setShowReactionModal: (show: boolean) => void;
  setReactionUsers: (users: ReactionUser[]) => void;
}

interface Interaction {
  id: string;
  userId: string;
  interactionType: 'reaction' | 'comment';
  content: string;
  createdAt: string;
  username: string;
}

interface ReactionUser {
  username: string;
  createdAt: string;
}

const DEV_MODE = true; // Toggle between dev and prod mode

const DUMMY_INTERACTIONS: Interaction[] = [
  {
    id: '1',
    userId: '123',
    interactionType: 'reaction',
    content: '❤️',
    createdAt: '2024-03-15T10:00:00Z',
    username: 'alice_wonder'
  },
  {
    id: '2',
    userId: '456',
    interactionType: 'reaction',
    content: '❤️',
    createdAt: '2024-03-15T09:00:00Z',
    username: 'bob_builder'
  },
  {
    id: '3',
    userId: '789',
    interactionType: 'comment',
    content: 'This place is amazing! 🌟',
    createdAt: '2024-03-15T08:30:00Z',
    username: 'charlie_explorer'
  },
  {
    id: '4',
    userId: '101',
    interactionType: 'comment',
    content: 'Great spot for photos',
    createdAt: '2024-03-14T15:20:00Z',
    username: 'diana_photographer'
  },
  {
    id: '5',
    userId: '102',
    interactionType: 'reaction',
    content: '❤️',
    createdAt: '2024-03-14T12:00:00Z',
    username: 'evan_traveler'
  }
];

const PointDetails: FC<PointDetailsProps> = ({
  point,
  onClose,
  setShowReactionModal,
  setReactionUsers
}) => {
  const auth = useRecoilValue(authState);
  const [comment, setComment] = useState('');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [hasReacted, setHasReacted] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchInteractions();
  }, [point.id]);

  const fetchInteractions = async () => {
    if (DEV_MODE) {
      setInteractions(DUMMY_INTERACTIONS);
      setHasReacted(DUMMY_INTERACTIONS.some(i => 
        i.userId === auth.id && i.interactionType === 'reaction' && i.content === '❤️'
      ));
      return;
    }

    try {
      const response = await apiClient.get(`/api/v1/pois/interactions/${point.id}/`);
      setInteractions(response.data);
      setHasReacted(response.data.some((i: Interaction) => 
        i.userId === auth.id && i.interactionType === 'reaction' && i.content === '❤️'
      ));
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  const handleReaction = async () => {
    if (DEV_MODE) {
      if (hasReacted) {
        // Remove the reaction
        setInteractions(interactions.filter(i => 
          !(i.userId === auth.id && i.interactionType === 'reaction' && i.content === '❤️')
        ));
        setHasReacted(false);
      } else {
        // Add new reaction
        const newInteraction: Interaction = {
          id: String(Date.now()),
          userId: auth.id,
          interactionType: 'reaction',
          content: '❤️',
          createdAt: new Date().toISOString(),
          username: 'current_user'
        };
        setInteractions([newInteraction, ...interactions]);
        setHasReacted(true);
      }
      return;
    }

    try {
      await apiClient.post('/api/v1/pois/interactions/create/', {
        userId: auth.id,
        poiId: point.id,
        interactionType: 'reaction',
        content: '❤️'
      });
      fetchInteractions();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleReactionPress = () => {
    longPressTimer.current = setTimeout(() => {
      const reactionData = interactions
        .filter(i => i.interactionType === 'reaction' && i.content === '❤️')
        .map(i => ({
          username: i.username,
          createdAt: i.createdAt
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setReactionUsers(reactionData);
      setShowReactionModal(true);
    }, 500);
  };

  const handleReactionRelease = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (DEV_MODE) {
      const newComment: Interaction = {
        id: String(Date.now()),
        userId: auth.id,
        interactionType: 'comment',
        content: comment,
        createdAt: new Date().toISOString(),
        username: 'current_user'
      };
      setInteractions([newComment, ...interactions]);
      setComment('');
      return;
    }

    try {
      await apiClient.post('/api/v1/pois/interactions/create/', {
        userId: auth.id,
        poiId: point.id,
        interactionType: 'comment',
        content: comment
      });
      setComment('');
      fetchInteractions();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const reactionCount = () => 
    interactions.filter(i => i.interactionType === 'reaction' && i.content === '❤️').length;

  return (
    <div className="flex flex-col h-[450px]">
      {/* Fixed Header Section */}
      <div className="p-2">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          &times;
        </button>
        
        <div className="space-y-2">
          <div className='flex space-x-2 items-center'>
            <h3 className="text-xl font-semibold text-gray-800">{point.title}</h3>
            <span
              className="inline-block px-2 py-1 text-xs font-medium rounded-full text-white"
              style={{
                backgroundColor: tagToColorMapping[point.tag],
              }}
            >
              {capitalize(point.tag)}
            </span>
          </div>
          <p className="text-gray-800">{point.description}</p>
        </div>
      </div>

      {/* Scrollable Comments Section */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="space-y-3">
          {interactions
            .filter(i => i.interactionType === 'comment')
            .map(comment => (
              <div key={comment.id} className="bg-gray-50 p-2 rounded">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{comment.username}</span>
                  <span className="text-sm text-gray-800">{comment.content}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          }
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="border-t space-y-4 bg-white p-2">
        {/* Reactions Section */}
        <div className="flex justify-start">
          <button
            onClick={handleReaction}
            onMouseDown={handleReactionPress}
            onMouseUp={handleReactionRelease}
            onTouchStart={handleReactionPress}
            onTouchEnd={handleReactionRelease}
            className="flex items-center space-x-1"
          >
            <span className={hasReacted ? 'text-red-500' : 'text-gray-400'}>
              {hasReacted ? '❤️' : '♡'}
            </span>
            <span className="text-sm text-gray-500">{reactionCount()}</span>
          </button>
        </div>

        <form onSubmit={handleComment} className="flex space-x-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#C91C1C]"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-[#C91C1C] text-white rounded-lg hover:bg-red-700"
          >
            &gt;
          </button>
        </form>
      </div>
    </div>
  );
};

export default PointDetails;
