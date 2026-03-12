import axios from "axios";

export const executeCode = async (req, res) => {
    try {
        const { script, language, stdin } = req.body;

        if (!script || !language) {
            return res.status(400).json({
                message: "Script and language are required.",
                success: false
            });
        }

        // Map language to JDoodle language codes
        const languageMap = {
            "java": "java",
            "python": "python3",
            "cpp": "cpp17",
            "javascript": "nodejs"
        };

        const jdoodleLanguage = languageMap[language.toLowerCase()] || language;

        const response = await axios.post("https://api.jdoodle.com/v1/execute", {
            clientId: process.env.JDOODLE_CLIENT_ID,
            clientSecret: process.env.JDOODLE_CLIENT_SECRET,
            script,
            language: jdoodleLanguage,
            stdin: stdin || "",
            versionIndex: "0"
        });

        return res.status(200).json({
            output: response.data.output,
            memory: response.data.memory,
            cpuTime: response.data.cpuTime,
            success: true
        });

    } catch (error) {
        console.error("JDoodle Execution Error:", error.response?.data || error.message);
        return res.status(500).json({
            message: "Execution failed",
            error: error.response?.data?.error || error.message,
            success: false
        });
    }
};
