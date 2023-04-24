import { useState } from "react";
import AudioRecorder from "audio-recorder-polyfill";

import ConfigForm from "./components/home/configForm";
import MessageForm from "./components/home/messageForm";
import { LANGUAGES } from "./utils/consts";

import "./styles/App.scss";

// A polyfill for Safari
window.MediaRecorder = AudioRecorder;

function App() {
    const [inputs, setInputs] = useState({
        model: "gpt-3.5-turbo",
        message: "",
        systemRole: `Act as my native REP_LANG language tutor, start a conversation with me, correct any grammatical errors in my messages, and suggest better words and phrases to convey my meaning. My REP_LANG level is LEVEL.`,
        openai: null,
        started: false,
        language: LANGUAGES.de.code,
        level: "A2",
    });

    function handleInputsChange(e) {
        if (!e.target) return;
        const name = e.target.getAttribute("name"),
            newVal = name === "message" ? e.target.innerText : e.target.value;

        setInputs(prev => ({
            ...prev,
            [name]: name !== "message" && name !== "languages" ? newVal.trim() : newVal,
        }));
    }

    return (
        <div className="App">
            {!inputs.started && (
                <ConfigForm
                    inputs={inputs}
                    setInputs={setInputs}
                    handleInputsChange={handleInputsChange}
                />
            )}
            {inputs.started && (
                <MessageForm
                    inputs={inputs}
                    setInputs={setInputs}
                    handleInputsChange={handleInputsChange}
                />
            )}
        </div>
    );
}

export default App;
