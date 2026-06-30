/*
=========================================
Chronos AI Assistant
=========================================
*/

import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Bot, User, Copy, Trash2 } from "lucide-react";
import { askGemini } from "../ai/gemini";
import toast from "react-hot-toast";

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

  const suggestedPrompts = [
    "Help me plan a productive workday.",
    "Create a task list for a product launch.",
    "How can I improve focus this afternoon?",
  ];

  const bottomRef = useRef(null);

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
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        <div className="border-b border-slate-800 pb-6">

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Chronos AI
              </h1>
              <p className="mt-2 text-slate-400">
                Your intelligent productivity assistant
              </p>
            </div>

            <button
              onClick={handleClearChat}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-white sm:w-auto"
            >
              <Trash2 size={16} />
              Clear Chat
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {suggestedPrompts.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>

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

                <div className="relative rounded-3xl border border-slate-800 bg-slate-900 px-5 py-4">
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleCopyResponse(msg.text, index)}
                      className="absolute right-4 top-4 rounded-full border border-slate-800 bg-slate-950 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                      title="Copy response"
                    >
                      <Copy size={16} />
                    </button>
                  )}

                  <div
                    className={`whitespace-pre-wrap ${
                      msg.role === "assistant"
                        ? "text-slate-200"
                        : "text-black font-medium"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html:
                        msg.role === "assistant"
                          ? renderMarkdown(msg.text)
                          : escapeHtml(msg.text).replace(/\n/g, "<br />"),
                    }}
                  />

                  {msg.role === "assistant" && (
                    <div className="mt-4 text-xs text-slate-500">
                      {copiedIndex === index ? "Copied!" : "Response supports markdown."}
                    </div>
                  )}
                </div>
              </div>

            </div>

          ))}

          {loading && (

            <div className="flex gap-3">

              <div className="rounded-full bg-cyan-500 p-2">
                <Bot size={18} />
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900 px-5 py-4 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]">
                <div className="h-4 w-44 animate-pulse rounded-full bg-slate-800"></div>
                <div className="mt-3 h-4 w-56 animate-pulse rounded-full bg-slate-800"></div>
                <div className="mt-3 h-4 w-36 animate-pulse rounded-full bg-slate-800"></div>
              </div>

            </div>

          )}

          <div ref={bottomRef} />

        </div>

        <div className="border-t border-slate-800 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row">

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