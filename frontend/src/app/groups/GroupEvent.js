"use client";
import { useState, useEffect } from "react";
import { FetchEvents, CreateEvent, OptionsEvent } from "../utils/FetchEvents";
import "./group.css";
import { WS_URL } from "../utils/ws";
import { FetchUserIDbySession } from "../utils/FetchUserIDbySession";

export default function GroupEvent({ group, onBack }) {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", datetime: "" });
  const [selectedOption, setSelectedOption] = useState({});
  const maxChars = 150;
  const charCount = form.description.length;
  const nearLimit = charCount > 130 && charCount < maxChars;
  const overLimit = charCount >= maxChars;


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
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    return events.reduce((acc, event) => {
      const eventDate = new Date(event.created_at);
      let label;

      if (eventDate.toDateString() === today.toDateString()) {
        label = "Today";
      } else if (eventDate.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else if (eventDate > oneWeekAgo) {
        label = eventDate.toLocaleDateString("en-US", { weekday: "long" }); // Sunday, Monday, etc.
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

  const handleCreate = async () => {
  
    const ws = new WebSocket(WS_URL);

    ws.onopen = async () => {
        const data = await FetchUserIDbySession();
      const userID = data.UserID;
        console.log("WebSocket connected! User ID:", userID);

  const newEvent = {
    type: "createEvent",
    group_id: parseInt(group.id),
    title: form.title,
    creator_id: parseInt(userID),
    description: form.description,
    event_datetime: form.datetime,
  };
      ws.send(JSON.stringify(newEvent));
    };
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
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
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
          Object.entries(groupEventsByDate(events))
            .sort(([aLabel, aEvents], [bLabel, bEvents]) => {
              // Use the first event in each group to determine its "creation" time
              const aDate = new Date(aEvents[0].created_at);
              const bDate = new Date(bEvents[0].created_at);
              return aDate - bDate; // ascending order = oldest first
            })
            .map(([label, group]) => (
              <div key={label}>
                <div className="message-date-wrapper">
                  <div className="message-date-label">{label}</div>
                </div>
                {group.map((e) => {
                  const eventOptions = e.options || [];
                  const totalVotes =
                    Object.values(e.responses).reduce(
                      (acc, val) => acc + val,
                      0
                    ) || 1;
                  const optionCounts = eventOptions.map((opt) => ({
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
                        🕒{" "}
                        {new Date(e.event_datetime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      <div className="poll-option">
                        {eventOptions.map((opt, idx) => {
                          const count =
                            optionCounts.find((o) => o.name === opt)?.count ||
                            0;
                          return (
                            <label className="poll-label" key={idx}>
                              <input
                                type="radio"
                                name={`rsvp-${e.id}`}
                                hidden
                                checked={selectedOption[e.id] === opt}
                                onChange={() => handleRSVP(e.id, opt)}
                              />
                              <div
                                className={`poll-choice ${
                                  selectedOption[e.id] === opt ? "selected" : ""
                                }`}
                              >
                                <div
                                  className={`poll-bar-fill ${
                                    opt === "Going"
                                      ? "going"
                                      : opt === "Not Going"
                                      ? "not-going"
                                      : ""
                                  }`}
                                  style={{
                                    width: `${(count / totalVotes) * 100}%`,
                                  }}
                                ></div>
                                <span>{opt}</span>
                                <span className="poll-count">{count}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      <div className="message-time">
                        {new Date(e.created_at).toLocaleDateString("en-GB")},{" "}
                        {new Date(e.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
        )}
      </div>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === "modal-overlay") setShowModal(false);
          }}
        >
          <div className="modal-content scrollable">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <h2>Create New Event</h2>
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className={`description-textarea ${
                overLimit ? "limit-exceeded" : nearLimit ? "near-limit" : ""
              }`}
              placeholder="Description"
              value={form.description}
              onChange={(e) => {
                const input = e.target.value;
                if (input.length <= maxChars) {
                  setForm({ ...form, description: input });
                }
              }}
              required
            />
            <div
              className={`char-counter ${
                overLimit ? "limit-exceeded" : nearLimit ? "near-limit" : ""
              }`}
            >
              {charCount}/{maxChars} characters
            </div>

            <input
              type="datetime-local"
              value={form.datetime}
              onChange={(e) => setForm({ ...form, datetime: e.target.value })}
              required
            />
            <p>
              <strong>Options:</strong> 
              Going and Not Going will be automatically added.
            </p>
            <div className="modal-buttons">
              <button
                type="submit"
                className="send-button"
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
