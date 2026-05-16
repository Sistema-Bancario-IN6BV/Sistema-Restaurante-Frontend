import { useEffect, useState } from "react";
import { getMyMessages, markMessageAsRead } from "../../../shared/api/messages";

export const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    load();
  }, [page]);

  const load = async () => {
    const data = await getMyMessages(page, 20);
    setMessages(data || []);
  };

  const handleMark = async (id) => {
    await markMessageAsRead(id);
    setMessages((m) => m.map(x => x.id === id ? { ...x, read: true } : x));
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Mensajes</h1>
      {messages.length === 0 && <div className="text-sm text-text-muted">No hay mensajes.</div>}
      {messages.map(msg => (
        <div key={msg.id} className="p-4 border rounded mb-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{msg.title || "Sin asunto"}</div>
              <div className="text-sm text-text-muted">{msg.body}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-muted">{new Date(msg.createdAt).toLocaleString()}</div>
              {!msg.read && <button onClick={() => handleMark(msg.id)} className="mt-2 text-sm text-accent">Marcar leído</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
