import axios from "axios";

const UploadSection = ({ onUploadStart, onAnalysisComplete, onError, loading }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = e.target.pdf.files[0];

    if (!file) return onError("Please upload a PDF");

    const formData = new FormData();
    formData.append("pdf_doc", file); // ✅ MUST MATCH BACKEND

    try {
      onUploadStart();

      const res = await axios.post(
        "http://localhost:3000/api/v1/resume/process",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      onAnalysisComplete(res.data.data);
    } catch (err) {
      console.error(err);
      onError(err.response?.data?.message || "Resume processing failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="pdf" accept="application/pdf" />
      <button disabled={loading}>
        {loading ? "Analyzing..." : "Upload Resume"}
      </button>
    </form>
  );
};

export default UploadSection;
