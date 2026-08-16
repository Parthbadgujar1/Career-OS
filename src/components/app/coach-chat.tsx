"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Bot, Sparkles, Send, Loader2, Brain, Target, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { coachChatAction } from "@/server/actions/coach";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "What should I work on today?",
  "Which skills should I prioritize?",
  "Review my resume for interviews",
  "Help me prepare for my interview",
  "Suggest a project for my portfolio",
];

export function CoachChat({ welcome }: { welcome: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: welcome },
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  const sendMessage = async (raw?: string) => {
    const userMsg = (raw ?? input).trim();
    if (!userMsg || isPending) return;
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);
    startTransition(async () => {
      const { response } = await coachChatAction(userMsg);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: response }]);
    });
  };

  return (
    <>
      <Card className="flex flex-col h-[600px] animate-slide-in-up">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">Career Coach</CardTitle>
            <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">Online</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-2">
            <div ref={scrollRef} className="space-y-4 pb-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-3 animate-fade-in-up", msg.role === "user" && "flex-row-reverse")}>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                      msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600"
                    )}
                  >
                    {msg.role === "user" ? <span className="text-xs font-bold">U</span> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-sm"
                        : "bg-slate-50 text-slate-900 rounded-tl-sm border border-slate-100"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isPending && (
                <div className="flex gap-3 animate-pulse">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                    <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                    <span className="text-sm text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t border-slate-100 pt-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto px-3 py-1.5"
                  disabled={isPending}
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask about your roadmap, resume, skills, interviews, projects..."
                className="flex-1"
                disabled={isPending}
              />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || isPending} size="lg">
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Context Awareness", desc: "Pulls your roadmap, skills, and readiness straight from your real data", icon: Brain },
          { title: "Action-Oriented", desc: "Gives specific, time-boxed daily plans — not generic advice", icon: Target },
          { title: "Multi-Modal", desc: "Reviews resume, suggests projects, preps interviews, tracks XP", icon: FileText },
        ].map((feature, i) => (
          <Card key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="pt-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-3">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
