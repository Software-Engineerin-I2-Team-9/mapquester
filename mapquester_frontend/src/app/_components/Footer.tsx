import { useRouter } from 'next/navigation';

const Footer = ({ currentPage }: { currentPage?: 'explore' | 'feed' | 'profile' }) => {
  const router = useRouter();

  return (
      <div className="h-[60px] bg-white border-t border-gray-200 flex justify-around items-center px-4 w-full">
      <button
            onClick={() => router.push('/')}
            className={`flex flex-col items-center ${
              currentPage === 'explore' ? 'text-[#C91C1C]' : 'text-gray-500'
            }`}
          >
            <span>Explore</span>
          </button>
          <button
            onClick={() => router.push('/feed')}
            className={`flex flex-col items-center ${
              currentPage === 'feed' ? 'text-[#C91C1C]' : 'text-gray-500'
            }`}
          >
            <span>Feed</span>
          </button>
          <button
            onClick={() => router.push('/profile')}
            className={`flex flex-col items-center ${
              currentPage === 'profile' ? 'text-[#C91C1C]' : 'text-gray-500'
            }`}
          >
            <span>Profile</span>
          </button>
        </div>
  );
};

export default Footer;
