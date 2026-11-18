"use client";

import { useEffect, useState } from "react";

type DesiredState = { open: boolean; updatedAt: string };

export default function Home() {
  const [token, setToken] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [state, setState] = useState<DesiredState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Ingresá la clave de control para operar la válvula.");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.sessionStorage.getItem("valve-control-token");
    if (saved) { setToken(saved); setHasToken(true); setMessage("Clave cargada en esta sesión."); }
  }, []);

  async function changeState(open: boolean) {
    setBusy(true); setError(""); setMessage(open ? "Enviando orden de apertura…" : "Enviando orden de cierre…");
    try {
      const response = await fetch("/api/state", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ open }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "No se pudo enviar la orden.");
      setState(body); setMessage("Orden guardada. El ESP32 la aplicará en su próxima consulta.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error de conexión.");
      setMessage("No se pudo confirmar la orden.");
    } finally { setBusy(false); }
  }

  function saveToken(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token.trim()) { setError("Ingresá la clave de control."); return; }
    window.sessionStorage.setItem("valve-control-token", token.trim());
    setToken(token.trim()); setHasToken(true); setError(""); setMessage("Clave cargada. Ya podés enviar órdenes.");
  }

  function clearToken() {
    window.sessionStorage.removeItem("valve-control-token");
    setToken(""); setHasToken(false); setState(null); setMessage("Clave eliminada de esta sesión.");
  }

  return <main className="shell">
    <header className="topbar"><span className="brand-mark" aria-hidden="true">V</span><span>CONTROL REMOTO <b> / 01</b></span><span className="connection"><i /> API VERCEL</span></header>
    <section className="panel" aria-labelledby="title">
      <div className="eyebrow">SISTEMA DE RIEGO · ESP32</div>
      <h1 id="title">Electroválvula</h1>
      <p className="intro">Controlá la apertura y el cierre desde cualquier lugar.</p>
      <div className={`status-card ${state?.open ? "is-open" : ""}`} aria-live="polite">
        <div className="valve-icon" aria-hidden="true"><span /><span /><span /></div>
        <div><div className="label">ÚLTIMA ORDEN CONFIRMADA</div><strong>{state ? (state.open ? "Abierta" : "Cerrada") : "Sin consultar"}</strong></div>
        <span className={`state-dot ${state?.open ? "active" : ""}`} />
      </div>
      {!hasToken ? <form className="token-form" onSubmit={saveToken}>
        <label htmlFor="control-token">Clave de control</label>
        <div className="token-row"><input id="control-token" type="password" autoComplete="current-password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Ingresá tu token" /><button type="submit" className="save-button">Conectar</button></div>
        <small>Se conserva solo durante esta sesión del navegador.</small>
      </form> : <>
        <div className="actions"><button className="open-button" disabled={busy} onClick={() => changeState(true)}><span>↗</span> Abrir válvula</button><button className="close-button" disabled={busy} onClick={() => changeState(false)}><span>↓</span> Cerrar válvula</button></div>
        <button className="clear-token" onClick={clearToken}>Desconectar clave</button>
      </>}
      <div className={`message ${error ? "error" : ""}`} role="status">{error || message}</div>
      <div className="note"><span>i</span><p>La orden se entrega al ESP32 en su próxima consulta. La página muestra la orden enviada, no una confirmación física de la válvula.</p></div>
    </section>
    <footer><span>CONTROLADOR EN LÍNEA · ESP32 DEVKIT V1</span><span>CONEXIÓN CIFRADA HTTPS</span></footer>
  </main>;
}
