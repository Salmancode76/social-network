"use client";
import { useState, useEffect } from "react";
import { FetchEvents, CreateEvent, OptionsEvent } from "../utils/FetchEvents";
import "./group.css";

export default function GroupEvent({ group, onBack }) {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", datetime: "" });
  const [selectedOption, setSelectedOption] = useState({});

  const enrichEvents = (data) => {
    const optionState = {};
    const enriched = data.map(event => {
      const responses = { ...(event.responses || {}) };
      if (event.your_response) {
        optionState[event.id] = event.your_response;
      }
      return {
        ...event,
        options: ["Going", "Not Going"],
        responses,
      };
    });
    return { enriched, optionState };
  };

  const groupEventsByDate = (events) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    return events.reduce((acc, event) => {
      const eventDate = new Date(event.event_datetime);
      let label;
      if (eventDate.toDateString() === today.toDateString()) {
        label = "Today";
      } else if (eventDate.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else {
        label = eventDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      if (!acc[label]) acc[label] = [];
      acc[label].push(event);
      return acc;
    }, {});
  };

  useEffect(() => {
    async function loadEvents() {
      const data = await FetchEvents(group.id);
      const { enriched, optionState } = enrichEvents(data);
      setEvents(enriched);
      setSelectedOption(optionState);
    }
    loadEvents();
  }, [group.id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const newEvent = {
      group_id: parseInt(group.id),
      title: form.title,
      description: form.description,
      event_datetime: form.datetime,
    };

    const created = await CreateEvent(newEvent);
    if (created) {
      setForm({ title: "", description: "", datetime: "" });
      setShowModal(false);

      const refreshed = await FetchEvents(group.id);
      const { enriched, optionState } = enrichEvents(refreshed);
      setEvents(enriched);
      setSelectedOption(optionState);
    } else {
      alert("Failed to create event. Please try again.");
    }
  };

  const handleRSVP = async (eventId, choice) => {
    const success = await OptionsEvent(eventId, choice);
    if (success) {
      const updated = events.map(e => {
        if (e.id === eventId) {
          const updatedResponses = { ...e.responses };
          if (selectedOption[eventId]) {
            updatedResponses[selectedOption[eventId]] = (updatedResponses[selectedOption[eventId]] || 1) - 1;
          }
          updatedResponses[choice] = (updatedResponses[choice] || 0) + 1;

          return {
            ...e,
            responses: updatedResponses,
          };
        }
        return e;
      });
      setEvents(updated);
      setSelectedOption({ ...selectedOption, [eventId]: choice });
    } else {
      alert("Failed to submit RSVP. Please try again.");
    }
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
        <button className="send-button" onClick={() => setShowModal(true)}>+ Create Event</button>
      </div>

      <div className="messages-container">
        {events.length === 0 ? (
          <div className="no-messages">No events yet.</div>
        ) : (
          Object.entries(groupEventsByDate(events)).map(([label, group]) => (
            <div key={label}>
              <div className="message-date-wrapper">
                <div className="message-date-label">{label}</div>
              </div>
              {group.map((e) => {
                const eventOptions = e.options || [];
                const totalVotes = Object.values(e.responses).reduce((acc, val) => acc + val, 0) || 1;
                const optionCounts = eventOptions.map(opt => ({
                  name: opt,
                  count: e.responses[opt] || 0,
                }));

                return (
                  <div className="message" key={e.id}>
                    <h3>{e.title}</h3>
                    <p>{e.description}</p>
                    <div className="event-time">
                      📅 {new Date(e.event_datetime).toLocaleDateString()}
                      <br />
                      🕒 {new Date(e.event_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                className={`poll-bar-fill ${opt === "Going" ? "going" : opt === "Not Going" ? "not-going" : ""}`}
                                style={{ width: `${(count / totalVotes) * 100}%` }}
                              ></div>
                              <span>{opt}</span>
                              <span className="poll-count">{count}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    <div className="message-time">
                      {new Date(e.event_datetime).toLocaleDateString("en-US")}, {" "}
                      {new Date(e.event_datetime).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }).toLowerCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === "modal-overlay") setShowModal(false);
        }}>
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
              <p><strong>Options:</strong> "Going" and "Not Going" will be automatically added.</p>
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
