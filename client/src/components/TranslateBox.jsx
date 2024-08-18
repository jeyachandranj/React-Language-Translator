import axios from "axios";
import { useEffect, useState } from "react";
import { SelectBox } from "./SelectBox";
import { error, success } from "../utils/notification";
import copy from "copy-to-clipboard";
import { AiFillCopy } from "react-icons/ai";
import { MdClear } from "react-icons/md";

export const TranslateBox = () => {
    const [q, setQ] = useState("");
    const [source, setSource] = useState("");
    const [target, setTarget] = useState("");
    const [output, setOutput] = useState("");
    const [history, setHistory] = useState([]);

    const handleSelectChange = ({ target: { value, id } }) => {
        if (id === "source") setSource(value);
        if (id === "target") setTarget(value);
    };

    const handleGetRequest = async () => {
        if (q.length < 1) {
            setOutput("");
            return;
        }
        if (!source || !target) {
            return error("Please select both source and target languages.");
        }
        try {
            const res = await axios.post("http://localhost:5000/api/translate", { q, source, target });
            const translatedText = res.data.translatedText;
            setOutput(translatedText);

            // Save translation history
            await axios.post("http://localhost:5000/api/save-translation", { q, source, target, translatedText });
            fetchHistory(); // Update history after saving new translation
        } catch (err) {
            console.error("Error during translation:", err);
            error("Translation failed. Please try again.");
        }
    };

    const copyToClipboard = (text) => {
        copy(text);
        success("Copied to clipboard!");
    };

    const resetText = () => {
        if (!q && !output) {
            return error("Textbox is already empty!");
        }
        success("Text removed!");
        setQ("");
        setOutput("");
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/history");
            setHistory(res.data);
        } catch (err) {
            console.error("Error fetching history:", err);
        }
    };

    useEffect(() => {
        const timerID = setTimeout(() => {
            handleGetRequest();
        }, 1000);

        return () => {
            clearTimeout(timerID);
        };
    }, [q, source, target]);

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <>
            <div className="mainBox">
                <div>
                    <SelectBox id="source" select={handleSelectChange} />
                    <div className="box">
                        <textarea
                            onChange={(e) => setQ(e.target.value)}
                            value={q}
                            className="outputResult"
                            placeholder="Enter text to translate..."
                        />
                    </div>
                    <div className="iconBox">
                        <p>{q.length}/250</p>
                        <AiFillCopy onClick={() => copyToClipboard(q)} className="icon" />
                        <MdClear onClick={resetText} className="icon" />
                    </div>
                </div>

                <div>
                    <SelectBox id="target" select={handleSelectChange} />
                    <div className="outputResult box">
                        <p id="output">{output}</p>
                    </div>
                    <div className="iconBox">
                        <p>{output.length}/250</p>
                        <AiFillCopy onClick={() => copyToClipboard(output)} className="icon" />
                    </div>
                </div>
            </div>

            <div className="historyBox">
                <h3>Translation History</h3>
                <ul>
                    {history.map((item, index) => (
                        <li key={index}>
                            <p><strong>Input:</strong> {item.q}</p>
                            <p><strong>Output:</strong> {item.translatedText}</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="tagLine">
                <p id="madeByjeyan">Made with ❤️ by <b>JEYACHANDRAN J</b> AIML</p>
            </div>
        </>
    );
};
