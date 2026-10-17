import { useEffect, useMemo, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";

const iconShapes = {
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.2 4.2" /></>,
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
  files: <><rect x="4" y="4" width="13" height="16" rx="2" /><path d="M8 2h10a2 2 0 0 1 2 2v13M7.5 9h6M7.5 13h6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  chevron: <><path d="m8 10 4 4 4-4" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
  cloud: <><path d="M7 18a5 5 0 1 1 .7-9.95A6 6 0 0 1 19 10a4 4 0 0 1-1 8H7z" /></>,
  bold: <><path d="M6 4h7a4 4 0 0 1 0 8H6zM6 12h8a4 4 0 0 1 0 8H6z" /></>,
  italic: <><path d="M14 4h6M4 20h6M14 4 10 20" /></>,
  heading: <><path d="M4 5v14M14 5v14M4 12h10M20 8v8M18 10h4" /></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  quote: <><path d="M4 11h6v6H4zM14 11h6v6h-6z" /><path d="M10 11c0-4 1-5 4-6M20 11c0-4 1-5 2-6" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" /></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7" /></>,
  arrow: <><path d="M19 12H5M12 19l-7-7 7-7" /></>,
  sparkle: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></>,
};

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {iconShapes[name] || iconShapes.file}
    </svg>
  );
}

function Brand({ dark = false }) {
  return (
    <div className={"brand" + (dark ? " brand-dark" : "")}>
      <span className="brand-mark"><Icon name="file" size={20} strokeWidth={2.1} /></span>
      <span>docnow</span>
    </div>
  );
}

function initials(email) {
  return (email || "D").trim().slice(0, 1).toUpperCase();
}

function formatDate(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return "Today, " + date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function excerpt(content) {
  return (content || "").replace(/[#>*_~\-]/g, "").replace(/\s+/g, " ").trim();
}

function documentHref(documentId) {
  const url = new URL(window.location.href);
  url.searchParams.set("doc", documentId);
  return url.pathname + url.search + url.hash;
}

function updateDocumentUrl(documentId, replace = false) {
  const url = new URL(window.location.href);
  if (documentId) url.searchParams.set("doc", documentId);
  else url.searchParams.delete("doc");

  const nextUrl = url.pathname + url.search + url.hash;
  const currentUrl = window.location.pathname + window.location.search + window.location.hash;
  if (nextUrl === currentUrl) return;

  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ ...window.history.state, docNowDocumentId: documentId || null }, "", nextUrl);
}

function AuthScreen({ mode, setMode, email, setEmail, password, setPassword, busy, error, success, onSubmit, isRecovery }) {
  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isReset = mode === "reset";
  const isUpdate = mode === "update-password";
  const title = isUpdate ? "Choose a new password" : isReset ? "Reset your password" : isSignup ? "Create your account" : "Welcome back";
  const subtitle = isUpdate ? "Pick a strong password to secure your documents." : isReset ? "We’ll email you a link to get back into your account." : isSignup ? "Start turning your thoughts into something great." : "Your documents are right where you left them.";
  const submitLabel = isUpdate ? "Update password" : isReset ? "Send reset link" : isSignup ? "Create account" : "Sign in";

  return (
    <div className="auth-shell">
      <section className="auth-story">
        <div className="auth-story-top"><Brand dark /></div>
        <div className="story-copy">
          <div className="eyebrow light-eyebrow"><span className="eyebrow-dot" /> YOUR SPACE TO THINK</div>
          <h1>Good ideas<br />deserve <em>good pages.</em></h1>
          <p>A calmer place for your notes, plans, and big next things. Open a page and get it out of your head.</p>
          <div className="story-paper">
            <div className="paper-top"><span className="paper-mini-icon"><Icon name="file" size={16} /></span><span>Monday thoughts</span><span className="paper-dots">•••</span></div>
            <div className="paper-body">
              <div className="paper-line paper-line-title">Make room for the work</div>
              <div className="paper-line paper-line-wide" /><div className="paper-line paper-line-medium" /><div className="paper-line paper-line-short" />
              <div className="paper-highlight"><span className="highlight-star">✳</span><span>Start with one clear thing.</span></div>
              <div className="paper-line paper-line-wide" /><div className="paper-line paper-line-medium" />
            </div>
            <div className="paper-bottom"><span><span className="tiny-green-dot" /> Saved just now</span><span>docnow.page</span></div>
          </div>
        </div>
        <div className="story-footer"><span>Less clutter. More clarity.</span><span>01 / 03</span></div>
      </section>

      <section className="auth-panel">
        <div className="auth-mobile-brand"><Brand /></div>
        <div className="auth-card">
          <div className="auth-heading">
            <div className="auth-kicker">{isUpdate ? "ACCOUNT RECOVERY" : isReset ? "ACCOUNT HELP" : "YOUR WORKSPACE AWAITS"}</div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {!isReset && !isUpdate && (
            <div className="auth-tabs" role="tablist" aria-label="Account access">
              <button type="button" className={isLogin ? "auth-tab selected" : "auth-tab"} onClick={() => { setMode("login"); }} role="tab" aria-selected={isLogin}>Sign in</button>
              <button type="button" className={isSignup ? "auth-tab selected" : "auth-tab"} onClick={() => { setMode("signup"); }} role="tab" aria-selected={isSignup}>Create account</button>
            </div>
          )}
          <form className="auth-form" onSubmit={onSubmit}>
            {!isUpdate && (
              <label className="field-label">
                Email address
                <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
            )}
            {!isReset && (
              <label className="field-label">
                {isUpdate ? "New password" : "Password"}
                <input type="password" autoComplete={isSignup ? "new-password" : "current-password"} placeholder={isUpdate ? "At least 8 characters" : "Enter your password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
              </label>
            )}
            {isLogin && (
              <div className="auth-inline-row"><span className="secure-note"><Icon name="check" size={14} /> Private by default</span><button type="button" className="text-button" onClick={() => setMode("reset")}>Forgot password?</button></div>
            )}
            {error && <div className="form-message form-error" role="alert">{error}</div>}
            {success && <div className="form-message form-success" role="status">{success}</div>}
            <button className="button button-primary auth-submit" type="submit" disabled={busy}>
              {busy ? <span className="button-spinner" /> : null}{busy ? "Please wait…" : submitLabel}<span className="button-arrow">→</span>
            </button>
          </form>
          {isReset && <button type="button" className="back-link" onClick={() => setMode("login")}><Icon name="arrow" size={15} /> Back to sign in</button>}
          {isUpdate && <div className="auth-footnote">Your documents stay yours. We never share them with other accounts.</div>}
          {!isReset && !isUpdate && <div className="auth-footnote"><Icon name="cloud" size={15} /> Your work syncs securely across your devices.</div>}
        </div>
        <div className="auth-panel-footer"><span>© 2026 DocNow</span><span><span className="footer-status-dot" /> All systems calm</span></div>
      </section>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsLoadedUserId, setDocumentsLoadedUserId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState("home");
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [globalError, setGlobalError] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const editorRef = useRef(null);
  const initialUrlHandledUserRef = useRef(null);
  const lastSavedRef = useRef({ title: "", content: "" });
  const saveQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSessionLoading(false);
      return undefined;
    }
    let alive = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return;
      if (sessionError) setAuthError(sessionError.message);
      setSession(data.session || null);
      setSessionLoading(false);
    }).catch((error) => {
      if (alive) {
        setAuthError(error.message || "Could not check your session.");
        setSessionLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setSessionLoading(false);
      if (event === "PASSWORD_RECOVERY") setAuthMode("update-password");
      if (nextSession && event !== "PASSWORD_RECOVERY") setAuthError("");
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setDocuments([]);
      setSelectedDocId(null);
      setTitle("");
      setContent("");
      setView("home");
      setDocumentsLoadedUserId(null);
      initialUrlHandledUserRef.current = null;
      return undefined;
    }
    let cancelled = false;
    setDocumentsLoading(true);
    setDocumentsLoadedUserId(null);
    setGlobalError("");
    supabase.from("documents")
      .select("id,user_id,title,content,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setGlobalError(error.message || "Could not load your documents.");
          setDocuments([]);
        } else {
          setDocuments(data || []);
          setDocumentsLoadedUserId(session.user.id);
        }
        setDocumentsLoading(false);
      })
      .catch((error) => {
        if (!cancelled) {
          setGlobalError(error.message || "Could not load your documents.");
          setDocumentsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || documentsLoadedUserId !== userId || initialUrlHandledUserRef.current === userId) return;
    initialUrlHandledUserRef.current = userId;

    const requestedDocumentId = new URLSearchParams(window.location.search).get("doc");
    if (!requestedDocumentId) return;

    const document = documents.find((item) => item.id === requestedDocumentId);
    if (document) {
      setSelectedDocId(document.id);
      setTitle(document.title || "Untitled document");
      setContent(document.content || "");
      lastSavedRef.current = { title: document.title || "Untitled document", content: document.content || "" };
      setSaveStatus("saved");
      setView("editor");
    } else {
      setSelectedDocId(null);
      setView("home");
      setGlobalError("That document isn't available in this account.");
      updateDocumentUrl(null, true);
    }
  }, [documentsLoadedUserId, session?.user?.id]);

  useEffect(() => {
    function handlePopState() {
      const requestedDocumentId = new URLSearchParams(window.location.search).get("doc");
      if (!requestedDocumentId) {
        setSelectedDocId(null);
        setTitle("");
        setContent("");
        lastSavedRef.current = { title: "", content: "" };
        setView("home");
        return;
      }

      const document = documents.find((item) => item.id === requestedDocumentId);
      if (document) {
        setSelectedDocId(document.id);
        setTitle(document.title || "Untitled document");
        setContent(document.content || "");
        lastSavedRef.current = { title: document.title || "Untitled document", content: document.content || "" };
        setSaveStatus("saved");
        setGlobalError("");
        setView("editor");
      } else if (documentsLoadedUserId === session?.user?.id) {
        setSelectedDocId(null);
        setView("home");
        setGlobalError("That document isn't available in this account.");
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [documents, documentsLoadedUserId, session?.user?.id]);

  const filteredDocuments = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return documents;
    return documents.filter((doc) => (doc.title || "").toLowerCase().includes(needle) || (doc.content || "").toLowerCase().includes(needle));
  }, [documents, search]);

  const selectedDoc = documents.find((doc) => doc.id === selectedDocId) || null;
  const wordCount = useMemo(() => {
    const trimmed = content.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [content]);
  const characterCount = content.length;

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");
    setAuthSuccess("");
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL },
        });
        if (error) throw error;
        if (!data.session) {
          setAuthSuccess("Check your inbox for a confirmation link. Once your email is verified, come back and sign in.");
        } else {
          setAuthSuccess("Your account is ready.");
        }
      } else if (authMode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + import.meta.env.BASE_URL });
        if (error) throw error;
        setAuthSuccess("If an account exists for that email, a password reset link is on its way.");
      } else if (authMode === "update-password") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setPassword("");
        setAuthMode("login");
        setAuthSuccess("Password updated successfully.");
      }
    } catch (error) {
      setAuthError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  function changeAuthMode(nextMode) {
    setAuthMode(nextMode);
    setAuthError("");
    setAuthSuccess("");
    setPassword("");
  }

  async function createDocument() {
    if (!session?.user?.id || creating) return;
    setCreating(true);
    setGlobalError("");
    const newTitle = "Untitled document";
    try {
      const { data, error } = await supabase.from("documents")
        .insert({ user_id: session.user.id, title: newTitle, content: "" })
        .select("*")
        .single();
      if (error) throw error;
      setDocuments((current) => [data, ...current]);
      updateDocumentUrl(data.id);
      setSelectedDocId(data.id);
      setTitle(data.title);
      setContent(data.content || "");
      lastSavedRef.current = { title: data.title, content: data.content || "" };
      setSaveStatus("saved");
      setView("editor");
      setSidebarOpen(false);
      window.setTimeout(() => {
        const input = document.querySelector(".document-title-input");
        if (input) { input.focus(); input.select(); }
      }, 50);
    } catch (error) {
      setGlobalError(error?.message || "Could not create a document.");
    } finally {
      setCreating(false);
    }
  }

  function openDocument(doc) {
    updateDocumentUrl(doc.id);
    setSelectedDocId(doc.id);
    setTitle(doc.title || "Untitled document");
    setContent(doc.content || "");
    lastSavedRef.current = { title: doc.title || "Untitled document", content: doc.content || "" };
    setSaveStatus("saved");
    setGlobalError("");
    setView("editor");
    setSidebarOpen(false);
    setLinkCopied(false);
  }

  function showDashboard() {
    updateDocumentUrl(null);
    setView("home");
    setSidebarOpen(false);
  }

  async function copyDocumentLink() {
    if (!selectedDocId) return;
    try {
      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set("doc", selectedDocId);
      await navigator.clipboard.writeText(shareUrl.toString());
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2200);
    } catch {
      setGlobalError("Couldn't copy the link automatically. Copy the address from your browser instead.");
    }
  }

  function saveDocument(nextTitle = title, nextContent = content) {
    if (!session?.user?.id || !selectedDocId) return Promise.resolve();
    const documentId = selectedDocId;
    const safeTitle = nextTitle.trim() || "Untitled document";
    if (lastSavedRef.current.title === safeTitle && lastSavedRef.current.content === nextContent) {
      setSaveStatus("saved");
      return Promise.resolve();
    }
    setSaveStatus("saving");
    setGlobalError("");
    const queued = saveQueueRef.current.catch(() => undefined).then(async () => {
      const { data, error } = await supabase.from("documents")
        .update({ title: safeTitle, content: nextContent })
        .eq("id", documentId)
        .select("*")
        .single();
      if (error) throw error;
      lastSavedRef.current = { title: safeTitle, content: nextContent };
      setDocuments((current) => current.map((doc) => doc.id === documentId ? data : doc)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
      if (selectedDocId === documentId && title === safeTitle && content === nextContent) setSaveStatus("saved");
      else setSaveStatus("unsaved");
    }).catch((error) => {
      setSaveStatus("error");
      setGlobalError(error?.message || "Could not save your changes. Check your connection and retry.");
    });
    saveQueueRef.current = queued;
    return queued;
  }

  useEffect(() => {
    if (!selectedDocId || !session?.user?.id) return undefined;
    const safeTitle = title.trim() || "Untitled document";
    if (lastSavedRef.current.title === safeTitle && lastSavedRef.current.content === content) return undefined;
    setSaveStatus("unsaved");
    const timeout = window.setTimeout(() => { void saveDocument(title, content); }, 700);
    return () => window.clearTimeout(timeout);
  }, [title, content, selectedDocId, session?.user?.id]);

  async function deleteDocument() {
    if (!selectedDocId || deleteBusy) return;
    const confirmed = window.confirm("Delete this document? This cannot be undone.");
    if (!confirmed) return;
    setDeleteBusy(true);
    setGlobalError("");
    try {
      const { error } = await supabase.from("documents").delete().eq("id", selectedDocId);
      if (error) throw error;
      setDocuments((current) => current.filter((doc) => doc.id !== selectedDocId));
      updateDocumentUrl(null);
      setSelectedDocId(null);
      setTitle("");
      setContent("");
      lastSavedRef.current = { title: "", content: "" };
      setView("home");
    } catch (error) {
      setGlobalError(error?.message || "Could not delete this document.");
    } finally {
      setDeleteBusy(false);
    }
  }

  function applyFormat(prefix, suffix = "", linePrefix = false) {
    const editor = editorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = content.slice(start, end);
    let nextContent;
    let selectionStart;
    let selectionEnd;
    if (linePrefix) {
      const lineStart = content.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      nextContent = content.slice(0, lineStart) + prefix + content.slice(lineStart);
      selectionStart = start + prefix.length;
      selectionEnd = end + prefix.length;
    } else {
      const inner = selectedText || "text";
      nextContent = content.slice(0, start) + prefix + inner + suffix + content.slice(end);
      selectionStart = start + prefix.length;
      selectionEnd = selectionStart + inner.length;
    }
    setContent(nextContent);
    window.requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  function handleGlobalKeyDown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (view === "editor" && selectedDocId) void saveDocument(title, content);
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
      event.preventDefault();
      void createDocument();
    }
    if (event.key === "Escape") {
      setUserMenuOpen(false);
      setSidebarOpen(false);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) setGlobalError(error.message);
    setUserMenuOpen(false);
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="setup-screen">
        <div className="setup-card"><Brand /><div className="setup-icon"><Icon name="cloud" size={25} /></div>
          <h1>Connect your workspace</h1>
          <p>DocNow is ready, but it needs your Supabase connection to sign in and save documents.</p>
          <div className="setup-steps"><span>1</span><p>Copy <strong>.env.example</strong> to <strong>.env</strong> in the project root.</p><span>2</span><p>Add your DocNow project URL and publishable key to that file.</p><span>3</span><p>Restart the dev server so Vite can load the environment variables.</p></div>
          <a className="button button-primary setup-link" href="https://supabase.com/dashboard/project/terbpositrzvudxyhfuc/settings/api" target="_blank" rel="noreferrer">Open Supabase API settings <span>↗</span></a>
        </div>
      </div>
    );
  }

  if (sessionLoading) {
    return <div className="loading-screen"><Brand /><span className="large-spinner" /><p>Getting your workspace ready…</p></div>;
  }

  if (!session || authMode === "update-password") {
    return <AuthScreen mode={authMode} setMode={changeAuthMode} email={email} setEmail={setEmail} password={password} setPassword={setPassword} busy={authBusy} error={authError} success={authSuccess} onSubmit={handleAuthSubmit} isRecovery={Boolean(session)} />;
  }

  return (
    <div className="app-shell" onKeyDown={handleGlobalKeyDown}>
      <aside className={"sidebar" + (sidebarOpen ? " sidebar-open" : "")}>
        <div className="sidebar-brand-row"><Brand /><button type="button" className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}>×</button></div>
        <button type="button" className="button button-primary new-doc-button" onClick={() => void createDocument()} disabled={creating}>
          {creating ? <span className="button-spinner" /> : <Icon name="plus" size={18} />}{creating ? "Creating…" : "New document"}<kbd>⌘ N</kbd>
        </button>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button type="button" className={"side-nav-item" + (view === "home" ? " active" : "")} onClick={showDashboard}><Icon name="home" size={18} /><span>All documents</span><span className="nav-count">{documents.length}</span></button>
          <button type="button" className={"side-nav-item" + (view === "editor" ? " active" : "")} onClick={() => { if (selectedDocId) setView("editor"); else setView("home"); setSidebarOpen(false); }}><Icon name="clock" size={18} /><span>Currently editing</span></button>
        </nav>
        <div className="sidebar-section sidebar-docs-section">
          <div className="sidebar-section-heading"><span>RECENT DOCUMENTS</span><button type="button" className="plain-icon-button" aria-label="Create document" onClick={() => void createDocument()}><Icon name="plus" size={15} /></button></div>
          <div className="sidebar-doc-list">
            {documents.slice(0, 7).map((doc) => (
              <button type="button" key={doc.id} className={"sidebar-doc" + (view === "editor" && selectedDocId === doc.id ? " selected" : "")} onClick={() => openDocument(doc)}>
                <span className="sidebar-doc-icon"><Icon name="file" size={15} /></span><span className="sidebar-doc-title">{doc.title || "Untitled document"}</span>
              </button>
            ))}
            {!documents.length && !documentsLoading && <p className="sidebar-empty">Your pages will show up here.</p>}
          </div>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><span className="tip-spark"><Icon name="sparkle" size={16} /></span><div><strong>A little space goes a long way.</strong><p>One page at a time.</p></div></div>
          <button type="button" className="profile-row" onClick={() => setUserMenuOpen((value) => !value)} aria-expanded={userMenuOpen}>
            <span className="avatar">{initials(session.user.email)}</span><span className="profile-details"><strong>{session.user.email?.split("@")[0] || "My workspace"}</strong><span>{session.user.email}</span></span><Icon name="chevron" size={17} />
          </button>
          {userMenuOpen && <div className="profile-menu"><div className="profile-menu-email">{session.user.email}</div><button type="button" onClick={() => void signOut()}><Icon name="logout" size={16} /> Sign out</button></div>}
        </div>
      </aside>

      {sidebarOpen && <button type="button" className="mobile-overlay" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button type="button" className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Icon name="menu" size={20} /></button>
            <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{view === "editor" ? (title || "Untitled document") : "All documents"}</strong></div>
          </div>
          <div className="topbar-right">
            <label className="search-box"><Icon name="search" size={17} /><input type="search" placeholder="Search documents…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search documents" /><kbd>⌘ K</kbd></label>
            <span className="topbar-divider" />
            <button type="button" className="top-avatar" onClick={() => setUserMenuOpen((value) => !value)} aria-label="Account menu">{initials(session.user.email)}</button>
            {userMenuOpen && <div className="top-profile-menu"><p>{session.user.email}</p><button type="button" onClick={() => void signOut()}><Icon name="logout" size={16} /> Sign out</button></div>}
          </div>
        </header>

        {globalError && <div className="global-error" role="alert"><span>{globalError}</span><button type="button" aria-label="Dismiss error" onClick={() => setGlobalError("")}>×</button></div>}

        {view === "editor" && selectedDocId ? (
          <section className="editor-page">
            <div className="editor-topline">
              <button type="button" className="back-to-docs" onClick={showDashboard}><Icon name="arrow" size={16} /> All documents</button>
              <div className={"save-indicator status-" + saveStatus}>
                {saveStatus === "saving" ? <span className="tiny-spinner" /> : <Icon name={saveStatus === "error" ? "cloud" : "check"} size={14} />}
                {saveStatus === "saving" ? "Saving changes…" : saveStatus === "unsaved" ? "Unsaved changes" : saveStatus === "error" ? "Save failed" : "All changes saved"}
              </div>
              <div className="editor-actions"><button type="button" className="button button-outline save-button copy-link-button" onClick={() => void copyDocumentLink()} title="Copy this document's link"><Icon name="link" size={15} /> {linkCopied ? "Link copied!" : "Copy link"}</button><button type="button" className="icon-button delete-button" aria-label="Delete document" title="Delete document" onClick={() => void deleteDocument()} disabled={deleteBusy}><Icon name="trash" size={17} /></button><button type="button" className="button button-outline save-button" onClick={() => void saveDocument(title, content)}><Icon name="check" size={16} /> Save now</button></div>
            </div>
            <div className="editor-scroll">
              <div className="editor-paper">
                <div className="document-meta"><span className="document-type"><Icon name="file" size={15} /> DOCUMENT</span><span className="meta-divider">·</span><span>Edited {formatDate(selectedDoc?.updated_at)}</span></div>
                <input className="document-title-input" aria-label="Document title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Untitled document" maxLength={240} />
                <div className="editor-formatbar" role="toolbar" aria-label="Text formatting shortcuts">
                  <button type="button" title="Heading" aria-label="Insert heading" onClick={() => applyFormat("# ", "", true)}><Icon name="heading" size={17} /></button>
                  <span className="format-divider" />
                  <button type="button" title="Bold Markdown" aria-label="Bold" onClick={() => applyFormat("**", "**")}><Icon name="bold" size={17} /></button>
                  <button type="button" title="Italic Markdown" aria-label="Italic" onClick={() => applyFormat("*", "*")}><Icon name="italic" size={17} /></button>
                  <span className="format-divider" />
                  <button type="button" title="Bullet list" aria-label="Bullet list" onClick={() => applyFormat("- ", "", true)}><Icon name="list" size={17} /></button>
                  <button type="button" title="Quote" aria-label="Quote" onClick={() => applyFormat("> ", "", true)}><Icon name="quote" size={17} /></button>
                  <button type="button" title="Link Markdown" aria-label="Insert link" onClick={() => applyFormat("[", "](https://)")}><Icon name="link" size={17} /></button>
                  <div className="formatbar-spacer" />
                  <span className="format-help">Markdown shortcuts</span>
                </div>
                <textarea ref={editorRef} className="document-editor" aria-label="Document content" value={content} onChange={(event) => setContent(event.target.value)} placeholder={"Start writing something wonderful…\n\nA thought, a plan, a list — it all starts here."} spellCheck />
                <div className="editor-bottomline"><span>{wordCount} {wordCount === 1 ? "word" : "words"} <span>·</span> {characterCount} characters</span><span>Private to you <span className="private-dot" /></span></div>
              </div>
            </div>
          </section>
        ) : (
          <section className="dashboard-page">
            <div className="dashboard-intro">
              <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL WORKSPACE</div>
              <div className="dashboard-heading-row"><div><h1>Your ideas,<br className="mobile-title-break" /> in one place<span className="title-period">.</span></h1><p>A little clarity starts with a blank page.</p></div><button type="button" className="button button-primary dashboard-create" onClick={() => void createDocument()} disabled={creating}>{creating ? <span className="button-spinner" /> : <Icon name="plus" size={18} />}{creating ? "Creating…" : "Create document"}</button></div>
              <div className="dashboard-stat-row"><div className="stat-chip"><span className="stat-icon"><Icon name="files" size={16} /></span><span><strong>{documents.length}</strong> {documents.length === 1 ? "document" : "documents"}</span></div><span className="stat-dot" /><span className="stat-caption">Synced to your workspace</span><span className="stat-sync"><Icon name="cloud" size={15} /> Live sync</span></div>
            </div>

            <div className="documents-heading-row"><div><h2>{search.trim() ? "Search results" : "Your documents"}</h2><p>{search.trim() ? "Matching pages from your workspace" : "Pick up where you left off."}</p></div><div className="documents-view-label"><Icon name="files" size={16} /> {filteredDocuments.length} {filteredDocuments.length === 1 ? "PAGE" : "PAGES"}</div></div>

            {documentsLoading ? (
              <div className="documents-loading"><span className="large-spinner" /><p>Finding your documents…</p></div>
            ) : filteredDocuments.length ? (
              <div className="document-grid">
                {filteredDocuments.map((doc, index) => (
                  <a href={documentHref(doc.id)} key={doc.id} className={"document-card card-tone-" + (index % 4)} onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                    event.preventDefault();
                    openDocument(doc);
                  }}>
                    <div className="document-card-top"><span className="card-file-icon"><Icon name="file" size={18} /></span><span className="card-updated">{formatDate(doc.updated_at)}</span><span className="card-more" aria-hidden="true">↗</span></div>
                    <h3>{doc.title || "Untitled document"}</h3>
                    <p className={"document-excerpt" + (!excerpt(doc.content) ? " excerpt-empty" : "")}>{excerpt(doc.content) || "A blank page with endless possibilities."}</p>
                    <div className="document-card-footer"><span>{(doc.content || "").trim() ? (doc.content.trim().split(/\s+/).length + " words") : "New document"}</span><span className="card-open-label">Open page <span>→</span></span></div>
                  </a>
                ))}
                <button type="button" className="create-card" onClick={() => void createDocument()} disabled={creating}>
                  <span className="create-card-icon"><Icon name="plus" size={20} /></span><strong>Create a new page</strong><span>Give that next idea some space.</span>
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-illustration"><div className="empty-back-sheet" /><div className="empty-front-sheet"><span /><span /><span /><span /></div><span className="empty-plus">+</span></div>
                <h3>{search.trim() ? "No matching documents" : "Your first page starts here"}</h3>
                <p>{search.trim() ? "Try a different search, or create a new document." : "A note, a plan, a fresh idea. Create a document and let the words find their way out."}</p>
                <button type="button" className="button button-primary" onClick={() => search.trim() ? setSearch("") : void createDocument()}>{search.trim() ? "Clear search" : <><Icon name="plus" size={18} /> Create your first document</>}</button>
              </div>
            )}

            <footer className="dashboard-footer"><span><span className="footer-status-dot" /> Everything saved automatically</span><span>Made for the thoughts worth keeping.</span></footer>
          </section>
        )}
      </main>
    </div>
  );
}