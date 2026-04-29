import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { chatAPI } from "../../services/api";

const sanitizeInput = (text) => text.replace(/[<>]/g, "").slice(0, 500);

const Chatbot = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);


  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`chat_${user._id}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([
          {
            role: "bot",
            text: "Hi, I'm Dr. DuffyAI. How can I help you today?",
          },
        ]);
      }
    } else {
     
        
      setMessages([
        {
          role: "bot",
          text: "Please login or register to use this feature.",
        },
      ]);
    }
  }, [user]);


  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`chat_${user._id}`, JSON.stringify(messages));
    }
  }, [messages, user]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!user) return;

    if (!input.trim()) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Please enter a message first." },
      ]);
      return;
    }

    if (loading) return;

    const clean = sanitizeInput(input);

    setMessages((prev) => [...prev, { role: "user", text: clean }]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatAPI.send({
        message: clean,
        route: location.pathname,
      });

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: res.data.reply },
        ]);
      }, 400);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "I'm having trouble responding right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>


      {!open && (
        <div className="fixed bottom-5 right-5 z-[9999]">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105"
          >
            <MessageCircle size={18} />
            <span className="text-sm font-medium">
              Talk to Dr. DuffyAI
            </span>
          </button>
        </div>
      )}

      
      {open && (
        <div className="fixed bottom-5 right-5 z-[9999] w-[95vw] max-w-[380px] h-[85vh] max-h-[600px] bg-white dark:bg-[#161b22] rounded-xl shadow-2xl flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="bg-blue-600 text-white px-4 py-3 font-semibold flex justify-between items-center">
            <span>Dr. DuffyAI</span>
            <button onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          
          <div className="text-[10px] px-3 py-2 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-b">
            ⚠️This AI provides general health information only. 
  It is NOT a medical diagnosis or treatment. 
  Always consult a qualified doctor for serious concerns.⚠️ 
          </div>

          
          {!user ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500 p-4 text-center">
              Please login or register to use this feature.
            </div>
          ) : (
            <>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`text-sm px-3 py-2 rounded-lg max-w-[80%] ${
                      m.role === "user"
                        ? "bg-blue-500 text-white ml-auto"
                        : "bg-gray-100 text-gray-900 dark:bg-[#1f2937] dark:text-gray-100"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}

                {loading && (
                  <div className="text-xs text-gray-500 animate-pulse">
                    Dr. DuffyAI is typing...
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              
              <div className="flex items-center border-t px-2 py-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#1f2937] text-sm outline-none"
                  placeholder="Ask something..."
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="ml-2 bg-blue-600 text-white p-2 rounded-lg"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;