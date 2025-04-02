import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [artworks, setArtworks] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE.replace(/\/$/, '');
  const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN || '';
  const IS_OWNER = !!AUTH_TOKEN;

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/artworks`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setArtworks(data);
    } catch (err) {
      console.error('Error fetching artworks:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert('Please select an image!');

    const formData = new FormData();
    formData.append('image', image);
    formData.append('title', title);
    formData.append('description', description);

    setUploading(true);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`
        }
      });

      const data = await res.json();
      alert('Artwork uploaded!');
      setTitle('');
      setDescription('');
      setImage(null);
      fetchArtworks();
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
    }

    setUploading(false);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this artwork?');
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/artworks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`
        }
      });

      const data = await res.json();
      if (data.success) {
        setArtworks((prev) => prev.filter((art) => art.id !== id));
      } else {
        alert('Failed to delete artwork.');
      }
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-10">
      <h1 className="text-5xl font-extrabold text-pink-400 text-center drop-shadow-lg mb-4">
        My Pixel Art Portfolio
      </h1>
      <p className="text-gray-400 text-center mb-8 max-w-xl">
        Here you'll see my pixel art 😸
      </p>

      {/* ✅ Only show upload form if you're the artist */}
      {IS_OWNER && (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg mb-12"
        >
          <div className="mb-4">
            <label className="block mb-1">Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 text-black rounded-lg outline-none focus:ring-2 ring-pink-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 text-black rounded-lg outline-none focus:ring-2 ring-pink-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-white bg-gray-800 border border-white/10 rounded-lg px-4 py-2 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded font-semibold"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      )}

      {/* 🖼️ Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {artworks.map((art) => (
          <div
            key={art.id}
            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105 duration-200"
          >
            <img
              src={`${API_BASE}/uploads/${art.filename}`}
              alt={art.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{art.title}</h2>
                <p className="text-gray-400 text-sm">{art.description}</p>
              </div>
              {IS_OWNER && (
                <button
                  onClick={() => handleDelete(art.id)}
                  className="text-red-400 hover:text-red-600 text-lg ml-4"
                  title="Delete"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
