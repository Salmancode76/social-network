'use client';
import { useState, useEffect } from 'react';
import { FetchAllGroups } from '../utils/FetchAllGroups';
import './group.css';

export default function GroupLists({ onGroupClick }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedGroups = await FetchAllGroups();
      console.log("Groups received:", fetchedGroups);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      setError("Failed to load groups");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupClick = (group) => {
    if (onGroupClick) {
      onGroupClick(group);
    }
  };

  if (loading) {
    return (
      <div className="group-list-container">
        <div className="loading-message">Loading groups...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-list-container">
        <div className="loading-message">{error}</div>
        <button onClick={fetchGroups} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="group-list-container">
      <div className="group-list">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div
              key={group.id}
              className="group-item clickable"
              onClick={() => handleGroupClick(group)}
            >
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <small>
                Created: {new Date(group.created_at).toLocaleDateString()}<br />
                Created by: {group.creator_name}
              </small>

            </div>
          ))
        ) : (
          <div className="group-item">No groups found. Create your first group!</div>
        )}
      </div>
    </div>
  );
}