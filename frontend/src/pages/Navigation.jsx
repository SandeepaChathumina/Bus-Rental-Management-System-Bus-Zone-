// Navigation.jsx
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold">
            Tourist & Event Charters
          </Link>
          <div className="space-x-4">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            <Link to="/attendance" className="hover:text-blue-200">Attendance</Link>
            {/* Other navigation links */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;