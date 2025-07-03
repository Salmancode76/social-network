// Update in GroupChat component (chat.js)
'use client';
import { useState, useEffect, useRef } from 'react';
import './group.css';

export default function GroupChat({ group, onBack }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const imageInputRef = useRef();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getStorageKey = (groupId) => `group_messages_${groupId}`;

    const loadMessagesFromStorage = () => {
        try {
            const storageKey = getStorageKey(group.id);
            const savedMessages = localStorage.getItem(storageKey);
            if (savedMessages) return JSON.parse(savedMessages);
        } catch (error) {
            console.error("Error loading messages from storage:", error);
        }
        return [];
    };

    const saveMessagesToStorage = (messagesToSave) => {
        try {
            const storageKey = getStorageKey(group.id);
            localStorage.setItem(storageKey, JSON.stringify(messagesToSave));
        } catch (error) {
            console.error("Error saving messages to storage:", error);
        }
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const savedMessages = loadMessagesFromStorage();
            setMessages(savedMessages);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            const savedMessages = loadMessagesFromStorage();
            setMessages(savedMessages);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [group.id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedImage) return;

        let base64Image = "";
        if (selectedImage) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                base64Image = reader.result;

                const tempMessage = {
                    id: Date.now(),
                    user_name: "You",
                    content: newMessage,
                    image: base64Image,
                    created_at: new Date().toISOString(),
                    group_id: group.id
                };

                const updatedMessages = [...messages, tempMessage];
                setMessages(updatedMessages);
                saveMessagesToStorage(updatedMessages);
                setNewMessage('');
                setSelectedImage(null);
                imageInputRef.current.value = "";

                // TODO: Send to backend
            };
            reader.readAsDataURL(selectedImage);
        } else {
            const tempMessage = {
                id: Date.now(),
                user_name: "You",
                content: newMessage,
                image: null,
                created_at: new Date().toISOString(),
                group_id: group.id
            };

            const updatedMessages = [...messages, tempMessage];
            setMessages(updatedMessages);
            saveMessagesToStorage(updatedMessages);
            setNewMessage('');
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
                        <h2>{group.title}</h2>
                        <p>{group.description}</p>
                    </div>
                </div>
                <div className="chat-header-buttons">
                    <button className="create-btn">Chat</button>
                    <button className="create-btn">Post</button>
                    <button className="create-btn">Event</button>
                </div>
            </div>

            <div className="messages-container">
                {loading ? (
                    <div className="loading-message">Loading messages...</div>
                ) : messages.length > 0 ? (
                    <>
                        {messages.map((message) => (
                            <div key={message.id} className="message">
                                <div className="message-header">
                                    <span className="message-author">{message.user_name}</span>
                                    <span className="message-time">
                                        {new Date(message.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="message-content">{message.content}</div>
                                {message.image && (
                                    <img
                                        src={message.image}
                                        alt="attachment"
                                        style={{ maxWidth: '200px', borderRadius: '10px' }}
                                    />
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                ) : (
                    <div className="no-messages">
                        No messages yet. Start the conversation!
                    </div>
                )}
            </div>

            <form className="message-form" onSubmit={handleSendMessage}>
                {/* Hidden file input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                />

                {/*  Image Button */}
                <button
                    type="button"
                    className="image-button"
                    onClick={() => imageInputRef.current.click()}
                    title="Attach Image"
                >
                    +
                </button>

                {/*  Message Input (with optional image name) */}
                <input
                    type="text"
                    className="message-input"
                    value={
                        selectedImage
                            ? `📎 ${selectedImage.name} | ${newMessage}`
                            : newMessage
                    }
                    onChange={(e) =>
                        setNewMessage(
                            selectedImage
                                ? e.target.value.replace(`📎 ${selectedImage.name} | `, '')
                                : e.target.value
                        )
                    }
                    placeholder="Type your message..."
                />

                {/*  Send Button */}
                <button type="submit" className="send-button">
                    Send
                </button>
            </form>

        </div>
    );
}
