'use client';
import { useState } from 'react';
import CreateGroupButton from './CreateGroup';
import GroupLists from './GroupLists';
import GroupChat from './GroupChat';
import './group.css';

export default function GroupPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleGroupCreated = () => {
    // Force GroupLists to refresh by changing the key
    setRefreshKey(prev => prev + 1);
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
  };

  const handleBackToList = () => {
    setSelectedGroup(null);
  };

  // If a group is selected, show only the chat window (no create button)
  if (selectedGroup) {
    return (
      <div className="group-page-container">
        <div className="group-box">
          <GroupChat
            group={selectedGroup}
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }

  // Otherwise, show the group list with create button
  return (
    <div className="group-box">
      <div className="group-box-header">
        <h1>Groups</h1>
        <CreateGroupButton onGroupCreated={handleGroupCreated} />
      </div>

      <GroupLists
        key={refreshKey}
        onGroupClick={handleGroupClick}
      />
    </div>

  );
}
