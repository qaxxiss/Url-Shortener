import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const shorten = async () => {
    try {
      if (!url.trim()) {
        toast.error("Please enter a URL");
        return;
      }

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/shorten",
        {
          originalUrl: url,
          customCode,
        }
      );

      setShortUrl(res.data.shortUrl);

      toast.success("URL shortened successfully");
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.error ||
          "Error shortening URL"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);

      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="dark"
      />

      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px",
          fontFamily: "Arial",
          overflow: "hidden",
          margin: "0",
          position: "fixed",
          top: "0",
          left: "0",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#111827",
            padding: "32px",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "500px",
            boxSizing: "border-box",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.4)",
            border: "1px solid #374151",
          }}
        >
          <h1
            style={{
              color: "white",
              textAlign: "center",
              marginBottom: "10px",
              fontSize: "32px",
            }}
          >
            URL Shortener
          </h1>

          <p
            style={{
              color: "#9ca3af",
              textAlign: "center",
              marginBottom: "30px",
              lineHeight: "1.5",
            }}
          >
            Custom short links that expire in 7 days
          </p>

          <input
            type="text"
            placeholder="Enter URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "15px",
              borderRadius: "10px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <input
            type="text"
            placeholder="Custom short URL (optional)"
            value={customCode}
            onChange={(e) =>
              setCustomCode(e.target.value)
            }
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              borderRadius: "10px",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "white",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          <button
            onClick={shorten}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: loading
                ? "#475569"
                : "#2563eb",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            {loading
              ? "Shortening..."
              : "Shorten URL"}
          </button>

          {shortUrl && (
            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                borderRadius: "12px",
                background: "#1f2937",
                border: "1px solid #374151",
              }}
            >
              <p
                style={{
                  color: "#d1d5db",
                  marginBottom: "10px",
                }}
              >
                Your shortened URL:
              </p>

              <a
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#60a5fa",
                  wordBreak: "break-all",
                  textDecoration: "none",
                  display: "block",
                  marginBottom: "15px",
                }}
              >
                {shortUrl}
              </a>

              <button
                onClick={copyToClipboard}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#10b981",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Copy URL
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;