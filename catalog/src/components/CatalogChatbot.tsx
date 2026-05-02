import { useEffect, useRef, useState, type FormEvent, type ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FilterListIcon from '@mui/icons-material/FilterList';
import WaterIcon from '@mui/icons-material/Water';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BuildIcon from '@mui/icons-material/Build';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import './CatalogChatbot.css';

const CHAT_NAME = 'dataNerd';

type MuiIcon = ComponentType<SvgIconProps>;

type ChatMsg = { id: string; role: 'user' | 'assistant'; text: string };

function newMessageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const welcome: ChatMsg = {
  id: '0',
  role: 'assistant',
  text: "Hi — I'm dataNerd. I can help you find your way around the portal, explain apps, or point you to the right place. What do you need?",
};

/** Matches portal home ecosystem cards (order, labels, icons, tags). */
const FOCUS_OPTIONS = [
  { id: 'catalog' as const, label: 'Catalog', hint: 'Governance', Icon: MenuBookIcon },
  { id: 'transport' as const, label: 'Transport', hint: 'Pipes', Icon: LocalShippingIcon },
  { id: 'conditioning' as const, label: 'Conditioning', hint: 'Rules', Icon: FilterListIcon },
  { id: 'dataLakes' as const, label: 'Data Lakes', hint: 'Storage', Icon: WaterIcon },
  { id: 'dashboards' as const, label: 'Dashboards', hint: 'Insight', Icon: DashboardIcon },
  { id: 'contentTriage' as const, label: 'Content triage', hint: 'Workflow', Icon: FactCheckIcon },
  { id: 'workbench' as const, label: 'Workbench', hint: 'Workspace', Icon: BuildIcon },
];

type FocusId = (typeof FOCUS_OPTIONS)[number]['id'];

export default function CatalogChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([welcome]);
  const [focus, setFocus] = useState<FocusId>('catalog');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput('');

    const userMsg: ChatMsg = { id: newMessageId(), role: 'user', text };
    setMessages((m) => [...m, userMsg]);

    const area = FOCUS_OPTIONS.find((o) => o.id === focus)!.label;
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: newMessageId(),
          role: 'assistant',
          text: `(${area} context) — dataNerd here. In a real integration this would call your AI backend scoped to that app. For now, open the same app from Home or the main sidebar to explore.`,
        },
      ]);
    }, 500);
  }

  const focusLabel = FOCUS_OPTIONS.find((o) => o.id === focus)!.label;

  return (
    <div className="catalogPortalChatbotRoot">
      {open && (
        <div
          id="catalog-portal-chat-panel"
          className="catalogPortalChatbotPanel"
          role="dialog"
          aria-label={`${CHAT_NAME} — chat`}
          aria-modal="true"
        >
          <div className="catalogPortalChatbotHeader">
            <div className="catalogPortalChatbotHeaderLead">
              <div className="catalogPortalChatbotHeaderGlyph" aria-hidden>
                <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              </div>
              <div className="catalogPortalChatbotHeaderTitles">
                <p className="catalogPortalChatbotTitle">{CHAT_NAME}</p>
                <p className="catalogPortalChatbotSubtitle">Ask a question or say what you&apos;re trying to do</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="catalogPortalChatbotIconBtn catalogPortalChatbotIconBtn--header"
              aria-label={`Close ${CHAT_NAME}`}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>
          </div>

          <div className="catalogPortalChatbotBody">
            <aside className="catalogPortalChatbotRail" aria-label="App context">
              <p className="catalogPortalChatbotRailLabel">Apps</p>
              <ul className="catalogPortalChatbotRailList" role="list">
                {FOCUS_OPTIONS.map((opt) => {
                  const selected = focus === opt.id;
                  const Icon: MuiIcon = opt.Icon;
                  return (
                    <li key={opt.id}>
                      <button
                        type="button"
                        onClick={() => setFocus(opt.id)}
                        className={
                          selected
                            ? 'catalogPortalChatbotRailBtn catalogPortalChatbotRailBtn--selected'
                            : 'catalogPortalChatbotRailBtn'
                        }
                        aria-pressed={selected}
                        aria-label={`${opt.label}. ${opt.hint}`}
                      >
                        <span className="catalogPortalChatbotRailBtnRow">
                          <Icon sx={{ fontSize: 15 }} className="catalogPortalChatbotRailIcon" />
                          <span className="catalogPortalChatbotRailBtnLabel">{opt.label}</span>
                        </span>
                        <span className="catalogPortalChatbotRailHint">{opt.hint}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <div className="catalogPortalChatbotMain">
              <div
                ref={listRef}
                className="catalogPortalChatbotMessages"
                role="log"
                aria-relevant="additions"
                aria-live="polite"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={
                      m.role === 'user'
                        ? 'catalogPortalChatbotRow catalogPortalChatbotRow--user'
                        : 'catalogPortalChatbotRow catalogPortalChatbotRow--assistant'
                    }
                  >
                    <div
                      className={
                        m.role === 'user'
                          ? 'catalogPortalChatbotBubble catalogPortalChatbotBubble--user'
                          : 'catalogPortalChatbotBubble catalogPortalChatbotBubble--assistant'
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="catalogPortalChatbotForm">
                <p className="catalogPortalChatbotFormHint">
                  Replying in context: <span className="catalogPortalChatbotFormHintStrong">{focusLabel}</span>
                </p>
                <div className="catalogPortalChatbotComposer">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message…"
                    className="catalogPortalChatbotInput"
                    aria-label="Message"
                  />
                  <button
                    type="submit"
                    className="catalogPortalChatbotSend"
                    aria-label="Send"
                  >
                    <SendIcon sx={{ fontSize: 18 }} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="catalogPortalChatbotFab"
        aria-label={open ? `Close ${CHAT_NAME}` : `Open ${CHAT_NAME}`}
        aria-expanded={open}
        aria-controls="catalog-portal-chat-panel"
      >
        {open ? <CloseIcon sx={{ fontSize: 28 }} /> : <ChatIcon sx={{ fontSize: 28 }} />}
      </button>
    </div>
  );
}
