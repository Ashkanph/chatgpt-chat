import { useState } from "react";

import { LANGUAGES, LEVELS } from "../../utils/consts";
import ThemeIcons from "./themeIcons";

const { Configuration, OpenAIApi } = require("openai");

const ConfigForm = ({ inputs, setInputs, handleInputsChange }) => {
    const [key, setKey] = useState("");

    const openMessageForm = () => {
        if (key !== "") {
            class CustomFormData extends FormData {
                getHeaders() {
                    return {};
                }
            }
            const configuration = new Configuration({
                apiKey: key,
                formDataCtor: CustomFormData,
            });
            const openai = new OpenAIApi(configuration);

            setInputs(prev => ({
                ...prev,
                openai,
                started: true,
                systemRole: prev.systemRole
                    .replace(/REP_LANG/gi, LANGUAGES[inputs.language].name)
                    .replace("LEVEL", inputs.level),
            }));
        }
    };

    const handleKeyChange = e => {
        const key = e.target.value.trim();

        if (key !== "") {
            setKey(key);
        }
    };

    return (
        <form className="config-wrapper" onSubmit={openMessageForm}>
            <label className="config-item">
                <span className="label">Model: </span>
                <select
                    className="select"
                    value={inputs.model}
                    name="model"
                    onChange={handleInputsChange}
                >
                    <option value="gpt-3.5-turbo" key="model-1">
                        gpt-3.5-turbo
                    </option>
                    <option value="gpt-4" key="model-2">
                        gpt-4
                    </option>
                </select>
            </label>
            <label className="config-item">
                <span className="label">Language: </span>
                <select
                    className="select"
                    value={inputs.language}
                    name="language"
                    onChange={handleInputsChange}
                >
                    {Object.keys(LANGUAGES).map(index => (
                        <option
                            value={LANGUAGES[index].code}
                            key={`language-option-${index}`}
                        >
                            {LANGUAGES[index].name}
                        </option>
                    ))}
                </select>
            </label>
            <label className="config-item">
                <span className="label">Level: </span>
                <select
                    className="select"
                    value={inputs.level}
                    name="level"
                    onChange={handleInputsChange}
                >
                    {LEVELS.map(level => (
                        <option value={level} key={`level-option-${level}`}>
                            {level}
                        </option>
                    ))}
                </select>
            </label>
            <div className="config-item key">
                <input
                    className="key-input"
                    placeholder="Your OpenAI API Key"
                    name="key"
                    onChange={handleKeyChange}
                />
                <span className="required">*</span>
            </div>
            <button className="start-btn" type="submit">
                start
            </button>

            <div style={{ visibility: "hidden" }}>
                <ThemeIcons />
            </div>
        </form>
    );
};

export default ConfigForm;
