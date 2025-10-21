import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NavbarSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); // Optional: clear search input after navigation
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center">
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-2 border rounded-l-md"
      />
      <button 
        type="submit" 
        className="bg-green-800 text-white p-2 rounded-r-md"
      >
        Search
      </button>
    </form>
  );
}