'use client';
import { useState } from 'react';
import './group.css';

export default function CreateGroupButton() {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Group "${title}" created!`);
    setShowModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <>
      <button className="create-btn" onClick={() => setShowModal(true)}>
        Create Group
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="close-button" onClick={() => setShowModal(false)}>✕</button>
            <h2>Create Group</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Title:
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>
              <label>
                Description:
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Create</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
