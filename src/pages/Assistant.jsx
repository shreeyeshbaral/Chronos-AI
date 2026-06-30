/*
=========================================
Chronos AI Assistant
=========================================
*/

import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Bot, User } from "lucide-react";
import { askGemini } from "../ai/gemini";

function Assistant() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm Chronos AI. Ask me anything about productivity, coding, planning or your tasks.",
    },
  ]);

  const bottomRef = useRef(null);

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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong while contacting Gemini.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 text-white">

      <div className="mx-auto flex w-full max-w-5xl flex-col">

        <div className="border-b border-slate-800 p-6">

          <h1 className="text-3xl font-bold">
            Chronos AI
          </h1>

          <p className="mt-2 text-slate-400">
            Your intelligent productivity assistant
          </p>

        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`flex max-w-3xl gap-3 ${
                  msg.role === "user"
                    ? "flex-row-reverse"
                    : ""
                }`}
              >

                <div
                  className={`rounded-full p-2 ${
                    msg.role === "assistant"
                      ? "bg-cyan-500"
                      : "bg-slate-700"
                  }`}
                >

                  {msg.role === "assistant" ? (
                    <Bot size={18} />
                  ) : (
                    <User size={18} />
                  )}

                </div>

                <div
                  className={`rounded-2xl px-5 py-4 whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "bg-slate-900 border border-slate-800"
                      : "bg-cyan-500 text-black font-medium"
                  }`}
                >
                  {msg.text}
                </div>

              </div>

            </div>

          ))}

          {loading && (

            <div className="flex gap-3">

              <div className="rounded-full bg-cyan-500 p-2">
                <Bot size={18} />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
                Thinking...
              </div>

            </div>

          )}

          <div ref={bottomRef} />

        </div>

        <div className="border-t border-slate-800 p-6">

          <div className="flex gap-4">

            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Chronos AI..."
              className="
                flex-1
                resize-none
                rounded-2xl
                border
                border-slate-700
                bg-slate-900
                p-4
                outline-none
                focus:border-cyan-500
              "
            />

            <button
              disabled={loading}
              onClick={handleSend}
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-cyan-500
                transition
                hover:bg-cyan-600
                disabled:opacity-50
              "
            >
              <SendHorizontal />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Assistant;