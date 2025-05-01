import { useState, useEffect, useRef } from "react";
import type { FormEvent, ChangeEvent } from "react";
import axios from "axios";
import Markdown from 'react-markdown'
import "../app.css";
import remarkGfm from "remark-gfm";
import { Delete, Trash2Icon } from "lucide-react";

/**
 * Base URL for the backend API.
 */
const API_URL = "http://localhost:8000";

/**
 * Represents a document uploaded by the user.
 */
type UploadedDoc = {
  document_id: string;
  filename: string;
};

/**
 * Represents a single chat message (question and answer pair).
 */
type ChatMessage = {
  question: string;
  answer: string;
};

/**
 * Main application component for NoteBookOne.
 * Handles PDF uploads, document selection, and chat interactions with the backend.
 */
function App() {
  // State for all uploaded documents fetched from the backend.
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  // State for currently active document IDs in the chat.
  const [documentIds, setDocumentIds] = useState<string[]>([]);
  // State for filenames of the active documents.
  const [filenames, setFilenames] = useState<string[]>([]);
  // State for the chat history (list of question/answer pairs).
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  // State indicating if a loading operation is in progress.
  const [loading, setLoading] = useState<boolean>(false);
  // State for selected document IDs (for multi-select).
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  // State to indicate if the user is chatting with all documents.
  const [chatWithAll, setChatWithAll] = useState<boolean>(true);

  // Refs for file input, chat input, chat container, and previous selection.
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const prevSelectedDocIds = useRef<string[]>([]);

  /**
   * Fetches the list of uploaded documents from the backend on mount.
   */
  useEffect(() => {
    fetchDocuments();
  }, []);

  /**
   * Scrolls the chat container to the bottom whenever chat history changes.
   */
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  /**
   * Updates selected document IDs and filenames when toggling "chat with all".
   */
  useEffect(() => {
    if (chatWithAll && uploadedDocs.length > 0) {
      const allIds = uploadedDocs.map((doc) => doc.document_id);
      setSelectedDocIds(allIds);
      setDocumentIds(allIds);
      setFilenames(uploadedDocs.map((doc) => doc.filename));
      setChatHistory([]);
    }
  }, [uploadedDocs, chatWithAll]);

  /**
   * Handles selection or deselection of a document for chat.
   * @param docId The document ID to select/deselect.
   */
  const handleDocumentSelection = (docId: string) => {
    if (chatWithAll) return;
    setSelectedDocIds((prev) => {
      let newSelected;
      if (prev.includes(docId)) {
        newSelected = prev.filter((id) => id !== docId);
      } else {
        newSelected = [...prev, docId];
      }
      return newSelected;
    });
  };

  /**
   * Starts a chat session with the currently selected documents.
   */
  const startChatWithSelected = () => {
    if (chatWithAll) {
      return;
    }
    if (selectedDocIds.length === 0) {
      alert("Please select at least one document to chat with.");
      return;
    }

    const selectedFilenames = uploadedDocs
      .filter((doc) => selectedDocIds.includes(doc.document_id))
      .map((doc) => doc.filename);

    setDocumentIds(selectedDocIds);
    setFilenames(selectedFilenames);
    setChatHistory([]);
  };

  /**
   * Fetches the list of uploaded documents from the backend API.
   */
  const fetchDocuments = async () => {
    try {
      const response = await axios.get<UploadedDoc[]>(`${API_URL}/documents/`);
      setUploadedDocs(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  /**
   * Handles file uploads from the user.
   * @param e ChangeEvent from the file input.
   */
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const response = await axios.post<UploadedDoc[]>(
        `${API_URL}/upload/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newDocIds = response.data.map((doc) => doc.document_id);
      const newFilenames = Array.from(files).map((file) => file.name);

      setDocumentIds(newDocIds);
      setFilenames(newFilenames);
      setSelectedDocIds(newDocIds);

      fetchDocuments();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles toggling the "Chat with all" checkbox.
   * @param checked Whether the checkbox is checked.
   */
  const handleChatWithAllToggle = (checked: boolean) => {
    setChatWithAll(checked);
    if (checked) {
      prevSelectedDocIds.current = selectedDocIds;
      const allIds = uploadedDocs.map((doc) => doc.document_id);
      setSelectedDocIds(allIds);
      setDocumentIds(allIds);
      setFilenames(uploadedDocs.map((doc) => doc.filename));
      setChatHistory([]);
    } else {
      setSelectedDocIds(prevSelectedDocIds.current);
      const selectedFilenames = uploadedDocs
        .filter((doc) => prevSelectedDocIds.current.includes(doc.document_id))
        .map((doc) => doc.filename);
      setDocumentIds(prevSelectedDocIds.current);
      setFilenames(selectedFilenames);
      setChatHistory([]);
    }
  };

  /**
   * Sends a chat message (question) to the backend and updates chat history.
   * @param e FormEvent from the chat input form.
   */
  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (documentIds.length === 0) {
      alert("Please upload or select at least one PDF.");
      return;
    }

    const query = chatInputRef.current?.value.trim();
    if (!query) return;

    setLoading(true);

    try {
      const response = await axios.post<{ answer: string }>(
        `${API_URL}/query/`,
        {
          document_ids: documentIds,
          query: query,
        }
      );

      setChatHistory((prev) => [
        ...prev,
        { question: query, answer: response.data.answer },
      ]);

      if (chatInputRef.current) chatInputRef.current.value = "";
    } catch (error) {
      console.error("Error querying documents:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          question: query,
          answer: "Error: Could not get an answer. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles deletion of a document.
   * @param docId The document ID to delete.
   */
  const handleDelete = async (docId: string) => {
    try {
      axios.delete(`${API_URL}/documents/${docId}/`);
      setUploadedDocs((prev) => prev.filter((doc) => doc.document_id !== docId));
      setDocumentIds((prev) => prev.filter((id) => id !== docId));
      setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
      setFilenames((prev) =>
        prev.filter((filename) => filename !== uploadedDocs.find((doc) => doc.document_id === docId)?.filename)
    )

    }
    catch (error) {
      console.error("Error deleting document:", error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen h-screen w-screen bg-gradient-to-br from-amber-50 to-blue-50">
      <nav className="flex justify-between items-center bg-black text-white dark:bg-white dark:text-black py-3 shadow-md">
        <h1 className="pl-6 text-2xl font-semibold tracking-tight">
          NoteBookOne
          <sup className="text-xs text-amber-300">
            BETA
          </sup>
        </h1>

        <div className="pr-6 text-base font-medium text-gray-300 dark:text-gray-700">
          {documentIds.length > 0 && `Active Documents: ${documentIds.length}`}
        </div>
      </nav>

      <main className="flex flex-1 min-h-0 w-full max-w-8xl mx-auto py-8 px-4 gap-8">
        <aside className="w-full max-w-xs flex flex-col gap-6 bg-white/80 rounded-2xl shadow-lg border border-gray-200 p-6 min-h-0">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="file-upload"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-2 font-medium transition-colors cursor-pointer shadow flex items-center gap-2"
            >
              <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
              </svg>
              Add
            </label>
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              name="file"
              multiple
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            {documentIds.length === 0 ? (
              <span className="text-gray-400 text-sm text-center">
                No PDFs selected yet.
              </span>
            ) : (
              <span className="text-gray-700 text-sm text-center">
                <span className="font-medium">Chatting with:</span>{" "}
                {filenames.join(", ")}
              </span>
            )}
          </div>
          {uploadedDocs.length > 0 && (
            <div className="flex flex-col flex-1 bg-white rounded-xl shadow-inner border border-gray-100 overflow-hidden">
              <div className="p-3 bg-gray-100 border-b flex  items-center justify-between">
                <h2 className="font-medium text-black text-md">
                  Available Documents
                </h2>
              </div>
              <div className="overflow-y-auto flex-1">
                 <label className="pl-4 pt-2 flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chatWithAll}
                    onChange={(e) => handleChatWithAllToggle(e.target.checked)}
                    className="accent-blue-500 text-black"
                  />
                  <h3 className="text-black">
                  Select all
                  </h3>
                </label>
                <ul className="divide-y divide-gray-200">
                  {uploadedDocs.map((doc) => (
                    <li
                      key={doc.document_id}
                      className="p-3 flex items-center hover:bg-amber-50 transition "
                    >
                      
                      <input
                        type="checkbox"
                        id={`doc-${doc.document_id}`}
                        checked={selectedDocIds.includes(doc.document_id)}
                        onChange={() => {
                          handleDocumentSelection(doc.document_id);
                          setChatWithAll(false);
                        }}
                        className="mr-3 accent-amber-500"
                      />
                      <label
                        htmlFor={`doc-${doc.document_id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <span className="text-sm font-medium text-black ">
                          {doc.filename.length > 20
                            ? doc.filename.slice(0, 20) + "..."
                            : doc.filename}
                        </span>
                      </label>
                      <button onClick={() => handleDelete(doc.document_id)} className=" cursor-pointer text-red-500 hover:text-red-700">
                       <Trash2Icon size={18} />
                      </button>
                      
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-gray-50 border-t">
                <button
                  onClick={startChatWithSelected}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-2 text-sm font-semibold shadow transition"
                  disabled={chatWithAll}
                >
                  Chat with Selected
                </button>
              </div>
            </div>
          )}
        </aside>

        <section className="flex flex-col flex-1 min-h-0 bg-white/90 rounded-2xl shadow-xl border border-gray-200">
          <div
            ref={chatContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-8 space-y-8 relative"
          >
            {chatHistory.length === 0 && (
              <div className="flex flex-col items-center text-gray-400 text-center mt-20 text-lg font-medium gap-4">
                {documentIds.length > 0 ? (
                  "Ask a question about your PDFs!"
                ) : (
                  <>
                    <span>Upload or select PDFs to start chatting</span>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.add("ring-2", "ring-amber-400");
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove("ring-2", "ring-amber-400");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove("ring-2", "ring-amber-400");
                        const files = e.dataTransfer.files;
                        if (fileInputRef.current) {
                          fileInputRef.current.files = files;
                        }
                        handleFileUpload({
                          target: { files },
                        } as ChangeEvent<HTMLInputElement>);
                        }}
                        className="border-2 border-dashed border-amber-300 rounded-lg p-8 mt-4 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer flex flex-col items-center min-h-[200px] w-3/4"
                      >
                      <svg
                        className="w-10 h-10 mb-2 text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                      <span className="font-medium">Drag &amp; drop PDFs here</span>
                      <span className="text-xs text-gray-500 mt-1">or</span>
                      <label
                        htmlFor="chat-file-upload"
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-2 font-medium transition-colors cursor-pointer shadow mt-2"
                      >
                        Upload PDFs
                      </label>
                      <input
                        id="chat-file-upload"
                        type="file"
                        name="file"
                        multiple
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {chatHistory.map((msg, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="self-end bg-amber-100 text-amber-900 px-5 py-3 rounded-xl max-w-[70%] shadow">
                  <span className="font-semibold">You:</span> {msg.question}
                </div>
                <div className="self-start bg-blue-50 text-blue-900 px-5 py-3 rounded-xl max-w-[70%] shadow">
                  <span className="font-semibold">AI:</span>
                  <div className="prose prose-blue prose-sm break-words break-all max-w-screen mt-1">
                    <Markdown  remarkPlugins={[remarkGfm]}>{msg.answer}</Markdown>
                  </div>  
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex flex-col gap-2">
                <div className="self-start bg-blue-50 text-blue-900 px-5 py-3 rounded-xl max-w-[70%] shadow flex items-center gap-3">
                  <span className="font-semibold">AI:</span>
                  <svg className="animate-spin h-6 w-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span className="text-amber-700 font-medium">Loading answer...</span>
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={sendMessage}
            className="flex items-center border-t p-6 gap-4 bg-white rounded-b-2xl"
          >
            <input
              ref={chatInputRef}
              autoFocus
              className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-black bg-gray-50 shadow-inner"
              placeholder={
                documentIds.length > 0
                  ? "Write your question here"
                  : "Select PDFs to start chatting"
              }
              type="text"
              disabled={loading || documentIds.length === 0}
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-6 py-3 font-semibold transition-colors disabled:opacity-50 shadow"
              disabled={loading || documentIds.length === 0}
            >
              {loading ? "Loading..." : "Send"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
