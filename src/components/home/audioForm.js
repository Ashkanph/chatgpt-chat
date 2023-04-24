import { useEffect, useState } from "react";
import { useVoiceRecorder } from "../../hooks/useAudioRecorder";

const AudioForm = ({ inputs, setInputs, setShowAudioForm }) => {
    const [record, setRecord] = useState(null);
    const [recordURL, setRecordURL] = useState(null);
    const [timerInterval, setTimerInterval] = useState(null);
    const [timer, setTimer] = useState(0);
    const { isRecording, stop, start } = useVoiceRecorder(data => {
        setRecord(data);
        setRecordURL(window.URL.createObjectURL(data));
    });

    const startRecording = e => {
        setTimer(0);
        start(e);
        setTimerInterval(setInterval(() => setTimer(pre => pre + 1), 1000));
    };

    useEffect(() => {
        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, []);

    async function sendRequest() {
        if (!record) {
            return;
        }
        let resp = {
            text: "Transcription wasn't successful.",
        };
        const messageTextareaEl = document.getElementsByClassName("message-textarea")[0];

        try {
            const blob = new Blob([record]);
            const file = new File([blob], "input.wav", { type: "audio/wav" });

            resp = await inputs.openai.createTranscription(
                file,
                "whisper-1",
                undefined,
                "json",
                0.1,
                inputs.language
            );
        } catch (error) {
            setInputs(prev => ({
                ...prev,
                message: error.message,
            }));
            messageTextareaEl.innerText = error.message;
            setShowAudioForm(false);
            return;
        } finally {
            setRecord(null);
        }

        setInputs(prev => ({
            ...prev,
            message: resp?.data?.text || resp?.error,
        }));
        messageTextareaEl.innerText = resp?.data?.text || resp?.error;
        setShowAudioForm(false);
    }

    const stopRecording = e => {
        if (timerInterval) {
            setTimerInterval(pre => {
                clearInterval(pre);
                return null;
            });
        }
        stop(e);
    };

    return (
        <div className="audio-form">
            <div className="player">
                {/* This is modulo 24h so if you input the equivalent of 25 hours it'll appear as 1 hour. Be careful!  */}
                <h3 className={isRecording ? "warning" : ""}>
                    {new Date(timer * 1000).toISOString().substr(11, 8)}
                </h3>
                <div>
                    <audio src={recordURL} controls preload={"metadata"} />
                </div>
            </div>
            <div className="recording-btns">
                {!isRecording && <button onClick={startRecording}>Start</button>}
                {isRecording && <button onClick={stopRecording}>Stop</button>}
                {record && <button onClick={sendRequest}>send</button>}
            </div>
        </div>
    );
};

export default AudioForm;
