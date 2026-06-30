/*
=========================================
Chronos AI Assistant
=========================================
*/

import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Bot, User, Copy, Trash2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { askGemini } from "../ai/gemini";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { createTask } from "../services/taskService";

const initialMessages = [
  {
    role: "assistant",
    text: "Hi! I'm Chronos AI. Ask me anything about productivity, coding, planning or your tasks.",
  },
];

function Assistant() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(false);
  const recognitionRef = useRef(null);

  const suggestedPrompts = [
    "Help me plan a productive workday.",
    "Create a task list for a product launch.",
    "How can I improve focus this afternoon?",
  ];

  const bottomRef = useRef(null);

  // Speech Recognition effect
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = async (e) => {
        const text = e.results[0][0].transcript;
        setPrompt(text);
        setIsListening(false);
        
        // Parse voice commands
        const lowerText = text.toLowerCase().trim();
        
        if (lowerText.startsWith("add task ") || lowerText.startsWith("create task ")) {
          const taskTitle = text.slice(9).trim();
          if (taskTitle) {
            try {
              await createTask({ title: taskTitle, priority: "Medium", deadline: "" });
              toast.success(`Task created: "${taskTitle}"`);
              const replyText = `I have successfully created the task: "${taskTitle}".`;
              setMessages((prev) => [
                ...prev,
                { role: "user", text },
                { role: "assistant", text: replyText },
              ]);
              if (voiceReplyEnabled) speakText(replyText);
            } catch {
              toast.error("Failed to create task via voice.");
            }
            setPrompt("");
            return;
          }
        }
        
        if (lowerText === "clear chat") {
          handleClearChat();
          toast.success("Chat cleared!");
          setPrompt("");
          return;
        }

        if (lowerText === "go to calendar" || lowerText === "show calendar") {
          navigate("/calendar");
          setPrompt("");
          return;
        }

        if (lowerText === "go to habits" || lowerText === "show habits" || lowerText === "go to goals" || lowerText === "show goals") {
          navigate("/habits");
          setPrompt("");
          return;
        }

        if (lowerText === "go to dashboard" || lowerText === "show dashboard" || lowerText === "go to main page") {
          navigate("/dashboard");
          setPrompt("");
          return;
        }

        if (lowerText === "go to planner" || lowerText === "show planner" || lowerText === "go to roadmap") {
          navigate("/planner");
          setPrompt("");
          return;
        }
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
        toast.error("Voice recognition error.");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [navigate, voiceReplyEnabled]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Web Speech API is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setPrompt("");
      recognitionRef.current.start();
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    
    // Strip markdown code/bold blocks from speech text to make it sound natural
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/[*-]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  function escapeHtml(raw) {
    return raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderMarkdown(rawText) {
    const escaped = escapeHtml(rawText);

    const withCodeBlocks = escaped.replace(/```([\s\S]*?)```/g, (_, code) => {
      return `<pre class="rounded-2xl bg-slate-950 p-4 text-sm text-slate-100 overflow-x-auto"><code>${code.replace(/&lt;/g, "&lt;").replace(/&gt;/g, "&gt;")}</code></pre>`;
    });

    const withInlineCode = withCodeBlocks.replace(/`([^`\n]+)`/g, '<code class="rounded-md bg-slate-900 px-1 py-0.5 text-sm text-cyan-300">$1</code>');
    const withLinks = withInlineCode.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-cyan-400 underline">$1</a>');
    const withStrong = withLinks.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    const withEm = withStrong.replace(/\*(.+?)\*/g, '<em class="italic text-slate-300">$1</em>');
    const withHeadings = withEm
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-white">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-white">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white">$1</h1>');
    const withLists = withHeadings.replace(/(?:^|\n)[*-] (.+?)(?=\n|$)/g, '<div class="flex items-start gap-3"><span class="mt-1 inline-block h-2 w-2 rounded-full bg-cyan-500"></span><span>$1</span></div>');

    return withLists
      .split(/\n{2,}/g)
      .map((block) => {
        if (block.startsWith("<h") || block.startsWith("<pre>")) {
          return block;
        }
        return `<p class="mt-4 leading-7 text-slate-300">${block.replace(/\n/g, "<br/>")}</p>`;
      })
      .join("");
  }

  async function handleCopyResponse(text, index) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Response copied");
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      toast.error("Unable to copy response.");
    }
  }

  function handleClearChat() {
    setMessages(initialMessages);
    setPrompt("");
    setCopiedIndex(null);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSend() {
    if (!prompt.trim() || loading) return;

    const userMessage = {
      role: "user",
      text: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentPrompt = prompt;
    setPrompt("");

    try {
      setLoading(true);

      const reply = await askGemini(currentPrompt);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: reply,
        },
      ]);

      if (voiceReplyEnabled) {
        speakText(reply);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong while contacting Gemini.",
        },
      ]);
      toast.error("Assistant request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-130px)] md:h-[calc(100vh-100px)] max-w-5xl mx-auto w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="border-b border-slate-800 p-4 sm:p-6 bg-slate-950 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white animate-fadeIn">
                Chronos AI
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Your intelligent productivity assistant
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setVoiceReplyEnabled(!voiceReplyEnabled)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs sm:text-sm font-medium transition cursor-pointer ${
                  voiceReplyEnabled
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
                title={voiceReplyEnabled ? "Disable AI voice reply" : "Enable AI voice reply"}
              >
                {voiceReplyEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span className="hidden sm:inline">Voice Mode</span>
              </button>

              <button
                onClick={handleClearChat}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs sm:text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-white cursor-pointer"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto">
            {suggestedPrompts.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-500 hover:text-white whitespace-nowrap cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900/30">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[85%] sm:max-w-2xl gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`rounded-full p-2 flex items-center justify-center h-9 w-9 flex-shrink-0 ${
                    msg.role === "assistant" ? "bg-cyan-500 text-slate-955" : "bg-slate-700 text-white"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>

                <div className="relative rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm sm:text-base min-w-0 break-words">
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopyResponse(msg.text, index)}
                      className="absolute right-2 top-2 rounded-full border border-slate-800 bg-slate-950 p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
                      title="Copy response"
                    >
                      <Copy size={12} />
                    </button>
                  )}

                  <div
                    className={`whitespace-pre-wrap ${
                      msg.role === "assistant" ? "text-slate-200" : "text-white font-medium"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html:
                        msg.role === "assistant"
                          ? renderMarkdown(msg.text)
                          : escapeHtml(msg.text).replace(/\n/g, "<br />"),
                    }}
                  />

                  {msg.role === "assistant" && (
                    <div className="mt-2 text-[10px] text-slate-500">
                      {copiedIndex === index ? "Copied!" : "Response supports markdown."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="rounded-full bg-cyan-500 p-2 flex items-center justify-center h-9 w-9 flex-shrink-0 text-slate-955">
                <Bot size={16} />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-800"></div>
                <div className="h-3 w-40 animate-pulse rounded bg-slate-800"></div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Bar - Sticky at bottom */}
        <div className="border-t border-slate-800 p-3 sm:p-4 bg-slate-950 flex-shrink-0">
          <div className="flex gap-2 items-center">
            <textarea
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Chronos AI..."
              className="
                flex-1
                resize-none
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                p-3
                text-sm
                text-white
                placeholder-slate-500
                outline-none
                focus:border-cyan-500
                max-h-24
              "
            />

            <button
              onClick={toggleListening}
              type="button"
              className={`
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                transition
                flex-shrink-0
                cursor-pointer
                border
                ${
                  isListening
                    ? "bg-red-500/10 border-red-500/40 text-red-450 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-cyan-500 hover:text-white"
                }
              `}
              title={isListening ? "Listening... click to stop" : "Start speech input"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              disabled={loading || !prompt.trim()}
              onClick={handleSend}
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-cyan-500
                text-slate-950
                transition
                hover:bg-cyan-600
                disabled:opacity-50
                flex-shrink-0
                cursor-pointer
              "
            >
              <SendHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Assistant;