import { useState } from "react";

import AudioForm from "./audioForm";
import ThemeIcons from "./themeIcons";

const MessageForm = ({ inputs, setInputs, handleInputsChange }) => {
    const [loading, setLoading] = useState(false);
    const [showAudioForm, setShowAudioForm] = useState(false);

    const formatTime = epoch => {
        const d = new Date(epoch);
        return d.getHours() + ":" + d.getMinutes();
    };

    const [prevMessages, setPrevMessages] = useState([
        {
            type: "me",
            created: formatTime(new Date().getTime()),
            msg: inputs.systemRole,
        },
    ]);

    async function handleSubmit(e) {
        const newMessage = inputs.message.trim();
        const messageTextareaEl = document.getElementsByClassName("message-textarea")[0];

        if (newMessage !== "") {
            e.preventDefault();
            setLoading(true);
            setInputs(prev => ({
                ...prev,
                message: "",
            }));

            setPrevMessages(prev => [
                ...prev,
                {
                    type: "me",
                    created: formatTime(new Date().getTime()),
                    msg: newMessage,
                },
            ]);

            let completion = null;
            try {
                completion = await inputs.openai.createChatCompletion({
                    model: inputs.model,
                    messages: [
                        { role: "system", content: inputs.systemRole },
                        { role: "user", content: newMessage },
                    ],
                });
            } catch (error) {
                setPrevMessages(prev => [
                    ...prev,
                    {
                        type: "ai",
                        created: formatTime(new Date().getTime()),
                        msg: error.message,
                    },
                ]);
                messageTextareaEl.innerText = "";
                return;
            } finally {
                messageTextareaEl.innerText = "";
                setLoading(false);
            }

            if (completion.error) {
                setPrevMessages(prev => [
                    ...prev,
                    {
                        type: "ai",
                        created: formatTime(new Date().getTime()),
                        msg: completion?.error?.message,
                    },
                ]);
            } else {
                setPrevMessages(prev => {
                    return [
                        ...prev,
                        {
                            type: "ai",
                            created: formatTime(completion.data.created * 1000),
                            msg: completion.data.choices[0].message?.content,
                        },
                    ];
                });
            }
        }
    }

    return (
        <div className="messages-page-container">
            <div className="prev-messages">
                {prevMessages.map((msg, index) => (
                    <div className="msg" key={`message_${index}`}>
                        <div className="name-ts-container">
                            <span className="timestamp">{msg.created}</span>
                            <span className="name">
                                {msg.type === "ai" ? "AI" : "Me"}
                            </span>
                        </div>
                        <p>{msg.msg}</p>
                    </div>
                ))}
                {loading && (
                    <div className="msg" key="message_loading">
                        <div className="name-ts-container">
                            <span className="timestamp">
                                {formatTime(new Date().getTime())}
                            </span>
                            <span className="name">AI</span>
                        </div>
                        <p> Loading... </p>
                    </div>
                )}
            </div>
            <div className="message-form">
                <span
                    className="message-textarea"
                    name="message"
                    role="textbox"
                    contentEditable
                    onKeyUp={handleInputsChange}
                ></span>
                <button className="submit" type="submit" onClick={handleSubmit}>
                    Send
                </button>
                <button className="mic" onClick={() => setShowAudioForm(true)}>
                    <svg
                        width="800px"
                        height="800px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 21H15M12 21H9M12 21V18M12 18C16 18 18.5 15.3137 18.5 12M12 18C8 18 5.5 15.3137 5.5 12M12 15C15.1718 15 15.5 11 15.5 9C15.5 7 15.1718 3 12 3C8.82825 3 8.5 7 8.5 9C8.5 11 8.82825 15 12 15Z"
                            stroke="#000000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <ThemeIcons />
            </div>
            {showAudioForm && (
                <AudioForm
                    inputs={inputs}
                    setInputs={setInputs}
                    setShowAudioForm={setShowAudioForm}
                />
            )}
        </div>
    );
};

export default MessageForm;
