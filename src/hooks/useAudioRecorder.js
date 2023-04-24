import { useReducer } from "react";

const initState = {
    isRecording: false,
    recorder: null,
    data: null,
    error: null,
};

const reducer = (state, action) => {
    switch (action.type) {
        case "start":
            return { ...state, isRecording: true };
        case "stop":
            return { ...state, isRecording: false };
        case "startRecording":
            return { ...state, isRecording: true, recorder: action.payload.recorder };
        case "hasError":
            return { ...state, isRecording: false, error: action.payload.error };
        default:
            return state;
    }
};

export const useVoiceRecorder = cb => {
    const [state, dispatch] = useReducer(reducer, initState);

    const finishRecording = ({ data }) => {
        cb(data);
    };

    const start = async () => {
        try {
            if (state.isRecording) return;
            dispatch({ type: "start" });
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const options = { mimeType: "audio/webm" };
            const recorder = new MediaRecorder(stream, options);
            dispatch({ type: "startRecording", payload: { recorder } });
            recorder.start();
            recorder.addEventListener("dataavailable", finishRecording);
            if (state.error) dispatch({ type: "hasError", payload: { error: null } });
        } catch (err) {
            dispatch({ type: "hasError", payload: { error: err } });
        }
    };

    const stop = () => {
        try {
            const recorder = state.recorder;
            dispatch({ type: "stop" });
            if (recorder) {
                if (recorder.state !== "inactive") recorder.stop();
                recorder.removeEventListener("dataavailable", finishRecording);
            }
        } catch (err) {
            dispatch({ type: "hasError", payload: { error: err } });
        }
    };

    return {
        start,
        stop,
        recorder: state.recorder,
        isRecording: state.isRecording,
        error: state.error,
    };
};
