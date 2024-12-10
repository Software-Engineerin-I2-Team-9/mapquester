import { useRouter } from 'next/navigation';

const Footer = ({ currentPage }: { currentPage: 'explore' | 'saved' | 'profile' }) => {
  const router = useRouter();

  return (
    <div className="h-[60px] bg-white border-t border-gray-200 flex justify-around items-center px-4 w-full">
      <button 
        className={`flex flex-col items-center ${currentPage === 'explore' ? 'text-[#C91C1C]' : 'text-gray-400'}`}
        onClick={() => router.push('/')}
      >
        <span className="text-sm">Explore</span>
      </button>
      <button 
        className={`flex flex-col items-center ${currentPage === 'saved' ? 'text-[#C91C1C]' : 'text-gray-400'}`}
      >
        <span className="text-sm">Saved POI</span>
      </button>
      <button
        className={`flex flex-col items-center ${currentPage === 'profile' ? 'text-[#C91C1C]' : 'text-gray-400'}`}
        onClick={() => router.push('/profile')}
      >
        <span className="text-sm">Profile</span>
      </button>
    </div>
  );
};

export default Footer;
