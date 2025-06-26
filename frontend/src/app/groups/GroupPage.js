'use client';
import CreateGroupButton from './CreateGroup';
import './group.css';

export default function GroupPage() {
  return (
    <div className="group-page-container">
      <div className="group-box">
        <div className="group-box-header">
          <h1>Groups</h1>
          <CreateGroupButton />
        </div>

        <div className="group-list">
          {/* Later you'll map real groups here */}
          <div className="group-item">Group 1 (Example)</div>
          <div className="group-item">Group 2 (Example)</div>
        </div>
      </div>
    </div>
  );
}
