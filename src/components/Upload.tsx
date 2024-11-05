import { useState, ChangeEvent } from "react";

interface ProcessingResult {
  [key: string]: any;
}

export default function PdfUpload(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF files are allowed");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/process-pdf/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: ProcessingResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>PDF Processing</h2>

      <label>Upload PDF</label>
      <input type="file" accept=".pdf" onChange={handleFileChange} />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Process PDF"}
      </button>

      {error && <div>{error}</div>}

      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
