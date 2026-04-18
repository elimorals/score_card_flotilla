"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRef, useEffect, useState } from "react";

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/planifica" }),
  });

  const isLoading = status !== "ready" && status !== "error";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-4">🧭</div>
            <h3 className="text-lg font-bold text-gray-300">Planifica tu ruta</h3>
            <p className="text-sm mt-2 max-w-xs mx-auto">
              Escribe de donde a donde quieres ir y te sugiero la mejor combinacion de transporte publico.
            </p>
            <div className="mt-4 space-y-2 text-xs">
              <p className="text-gray-600">Prueba:</p>
              <p className="text-[#e8734a]">&quot;De Coyoacan a Polanco&quot;</p>
              <p className="text-[#e8734a]">&quot;Como llego al aeropuerto desde CU?&quot;</p>
              <p className="text-[#e8734a]">&quot;Necesito ruta accesible de Tacubaya a Zocalo&quot;</p>
            </div>
          </div>
        )}

        {messages.map((msg: UIMessage) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-[#e8734a] text-white"
                  : "bg-white/10 text-gray-200"
              }`}
            >
              {/* @ts-expect-error - parts property might have different structure in this version */}
              <div className="whitespace-pre-wrap">{msg.content || (msg.parts && msg.parts[0]?.type === 'text' ? msg.parts[0].text : '')}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-lg px-4 py-2 text-sm text-gray-400 animate-pulse">
              Pensando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="De donde a donde quieres ir?"
            className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e8734a]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#e8734a] text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-[#d4623a] transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
