"use client";
import { useState, useEffect } from "react";
import "./group.css";

export default function GroupEvent({ group, onBack }) {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", datetime: "" });
  const [options, setOptions] = useState(["", ""]);
  const [selectedOption, setSelectedOption] = useState({});
  const storageKey = `group_events_${group.id}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      const updated = parsed.map(event => ({
        ...event,
        options: event.options || ["Option 1", "Option 2"],
      }));
      setEvents(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  }, [group.id]);

  const saveEvents = (newEvents) => {
    localStorage.setItem(storageKey, JSON.stringify(newEvents));
    setEvents(newEvents);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const cleanedOptions = options.filter(opt => opt.trim() !== "");
    if (cleanedOptions.length < 2) {
      alert("Please enter at least two RSVP options.");
      return;
    }

    const newEvent = {
      id: Date.now(),
      ...form,
      options: cleanedOptions,
      responses: {},
      createdAt: new Date().toISOString(),
    };

    saveEvents([...events, newEvent]);
    setForm({ title: "", description: "", datetime: "" });
    setOptions(["", ""]);
    setShowModal(false);
  };

  const handleRSVP = (eventId, choice) => {
    const updated = events.map((e) => {
      if (e.id === eventId) {
        e.responses["You"] = choice;
      }
      return e;
    });
    saveEvents(updated);
    setSelectedOption({ ...selectedOption, [eventId]: choice });
  };

  return (
    <div className="group-chat-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <button className="back-button" onClick={onBack}>← Back</button>
          <div className="group-info">
            <h2>Events for {group.title}</h2>
          </div>
        </div>
        <button className="send-button" onClick={() => setShowModal(true)}>
          + Create Event
        </button>
      </div>

      <div className="messages-container">
        {events.length === 0 ? (
          <div className="no-messages">No events yet.</div>
        ) : (
          events.map((e) => {
            const eventOptions = e.options || [];
            const totalVotes = Object.values(e.responses).length || 1;
            const optionCounts = eventOptions.map(opt => ({
              name: opt,
              count: Object.values(e.responses).filter(v => v === opt).length
            }));

            return (
              <div className="message" key={e.id}>
                <h3>{e.title}</h3>
                <p>{e.description}</p>
                <div className="event-time">
                  📅 {new Date(e.datetime).toLocaleDateString()} - 🕒 {new Date(e.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                <div className="poll-option">
                  {eventOptions.map((opt, idx) => {
                    const count = optionCounts.find(o => o.name === opt)?.count || 0;
                    return (
                      <label className="poll-label" key={idx}>
                        <input
                          type="radio"
                          name={`rsvp-${e.id}`}
                          hidden
                          checked={selectedOption[e.id] === opt}
                          onChange={() => handleRSVP(e.id, opt)}
                        />
                        <div className={`poll-choice ${selectedOption[e.id] === opt ? "selected" : ""}`}>
                          <div
                            className="poll-bar-fill"
                            style={{ width: `${(count / totalVotes) * 100}%` }}
                          ></div>
                          <span>{opt}</span>
                          <span className="poll-count">{count}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === "modal-overlay") setShowModal(false);
          }}
        >
          <div className="modal-content scrollable">
            <button className="modal-close" onClick={() => setShowModal(false)}>✖</button>
            <h2>Create New Event</h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <input
                type="datetime-local"
                value={form.datetime}
                onChange={(e) => setForm({ ...form, datetime: e.target.value })}
                required
              />

              <h4>RSVP Options</h4>
              {options.map((opt, i) => (
                <div key={i} className="option-item">
                  <input
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...options];
                      updated[i] = e.target.value;
                      setOptions(updated);
                    }}
                    required
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => setOptions(options.filter((_, idx) => idx !== i))}>
                      X
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setOptions([...options, ""])}>+ Add Option</button>

              <div className="modal-buttons">
                <button type="submit" className="send-button">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
