import { useState } from 'react';
import { Plus, Trash2, MessageSquare, ChevronLeft, ChevronRight, Bot } from 'lucide-react';

function ConversationItem({ conv, isActive, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
        isActive
          ? 'bg-white/10 text-slate-100'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(conv.id)}
    >
      <MessageSquare size={15} className="flex-shrink-0 opacity-60" />
      <span className="flex-1 text-sm truncate">{conv.title}</span>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
          className="flex-shrink-0 p-1 rounded-md hover:bg-red-900/40 hover:text-red-400 text-slate-600 transition-colors"
          title="Delete conversation"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-4 w-14 bg-[#0e0e18] border-r border-white/5 py-4 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-[#1e1b4b] flex items-center justify-center">
          <Bot size={16} className="text-violet-400" />
        </div>
        <button
          onClick={onNew}
          className="w-8 h-8 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
          title="New chat"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 rounded-xl hover:bg-white/5 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors mt-auto"
          title="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-64 bg-[#0e0e18] border-r border-white/5 flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1e1b4b] flex items-center justify-center">
            <Bot size={14} className="text-violet-400" />
          </div>
          <span className="text-sm font-semibold text-slate-200">AI Chat</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-slate-400 transition-colors"
          title="Collapse sidebar"
        >
          <ChevronLeft size={15} />
        </button>
      </div>

      <div className="px-3 py-3">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-slate-100 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-colors"
        >
          <Plus size={15} />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {conversations.length > 0 && (
          <>
            <p className="text-xs text-slate-600 px-3 mb-2 font-medium uppercase tracking-wider">
              Conversations
            </p>
            <div className="flex flex-col gap-0.5">
              {conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
