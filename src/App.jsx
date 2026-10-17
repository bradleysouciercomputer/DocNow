import { useEffect, useMemo, useRef, useState } from "react";
import { isSupabaseConfigured, supabase } from "./lib/supabase.js";
import * as Y from "yjs";

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
  star: <path d="m12 3 2.8 5.7 6.3.9-4.55 4.43 1.08 6.27L12 17.35l-5.63 2.95 1.08-6.27L2.9 9.6l6.3-.9L12 3Z" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 17v3h14v-3" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  pencil: <><path d="m15 5 4 4M4 20l4.3-.9L19 8.4a2.1 2.1 0 0 0-3-3L5.3 16.1 4 20Z" /></>,
  sort: <><path d="M4 7h16M7 12h10M10 17h4" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" /></>,
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

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function renderInlineMarkdown(value) {
  let html = escapeHtml(value);
  html = html.replace(/\`([^\`]+)\`/g, "<code>$1</code>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
    (_match, label, href) => '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + label + '</a>');
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return html;
}

function renderMarkdown(source) {
  const lines = String(source || "").replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listItems = [];
  let listTag = "";
  let quoteLines = [];
  let codeLines = null;

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${paragraph.map(renderInlineMarkdown).join("<br>")}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (listItems.length) html.push(`<${listTag}>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</${listTag}>`);
    listItems = [];
    listTag = "";
  };
  const flushQuote = () => {
    if (quoteLines.length) html.push(`<blockquote>${quoteLines.map(renderInlineMarkdown).join("<br>")}</blockquote>`);
    quoteLines = [];
  };
  const flushTextBlocks = () => { flushParagraph(); flushList(); flushQuote(); };

  for (const line of lines) {
    if (codeLines) {
      if (/^\s*```/.test(line)) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = null;
      } else {
        codeLines.push(line);
      }
      continue;
    }
    if (/^\s*```/.test(line)) {
      flushTextBlocks();
      codeLines = [];
      continue;
    }
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      flushTextBlocks();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      flushQuote();
      const nextTag = unordered ? "ul" : "ol";
      if (listTag && listTag !== nextTag) flushList();
      listTag = nextTag;
      listItems.push((unordered || ordered)[1]);
      continue;
    }
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      quoteLines.push(quote[1]);
      continue;
    }
    if (!line.trim()) {
      flushTextBlocks();
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(line);
  }
  if (codeLines) html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  flushTextBlocks();
  return html.join("\n");
}



function encodeBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return window.btoa(binary);
}

function decodeBase64(encoded) {
  const binary = window.atob(encoded || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function applyTextDiff(yDoc, yText, nextValue, origin = "local-editor") {
  const previous = yText.toString();
  const next = String(nextValue ?? "");
  if (previous === next) return;
  let prefix = 0;
  const prefixLimit = Math.min(previous.length, next.length);
  while (prefix < prefixLimit && previous[prefix] === next[prefix]) prefix += 1;
  let suffix = 0;
  while (
    suffix < previous.length - prefix &&
    suffix < next.length - prefix &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  ) suffix += 1;
  yDoc.transact(() => {
    const deleteCount = previous.length - prefix - suffix;
    const inserted = next.slice(prefix, next.length - suffix);
    if (deleteCount > 0) yText.delete(prefix, deleteCount);
    if (inserted) yText.insert(prefix, inserted);
  }, origin);
}

function textareaCaretCoordinates(textarea, index) {
  if (!textarea) return null;
  const computed = window.getComputedStyle(textarea);
  const rect = textarea.getBoundingClientRect();
  const mirror = document.createElement("div");
  const copiedStyles = [
    "boxSizing", "width", "height", "paddingTop", "paddingRight", "paddingBottom",
    "paddingLeft", "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontVariant",
    "letterSpacing", "lineHeight", "textAlign", "textIndent", "textTransform",
    "wordSpacing", "tabSize", "borderTopWidth", "borderRightWidth", "borderBottomWidth",
    "borderLeftWidth",
  ];
  copiedStyles.forEach((property) => { mirror.style[property] = computed[property]; });
  mirror.style.position = "fixed";
  mirror.style.left = rect.left + "px";
  mirror.style.top = rect.top + "px";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.overflowWrap = "break-word";
  mirror.style.overflow = "hidden";
  mirror.style.margin = "0";
  const value = textarea.value;
  const safeIndex = Math.max(0, Math.min(index, value.length));
  mirror.textContent = value.slice(0, safeIndex);
  if (value.slice(0, safeIndex).endsWith("\n")) mirror.appendChild(document.createTextNode("\u200b"));
  const marker = document.createElement("span");
  marker.textContent = value.slice(safeIndex, safeIndex + 1) || "\u200b";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const markerRect = marker.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();
  const coords = {
    top: markerRect.top - mirrorRect.top - textarea.scrollTop,
    left: markerRect.left - mirrorRect.left - textarea.scrollLeft,
    height: Number.parseFloat(computed.lineHeight) || Number.parseFloat(computed.fontSize) * 1.5 || 18,
  };
  mirror.remove();
  return coords;
}

function collaboratorColor(seed) {
  const palette = ["#5669df", "#d16b4d", "#159a83", "#b35ca8", "#b27c27", "#397ab8"];
  let hash = 0;
  for (const char of String(seed || "")) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
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
          {isUpdate && <div className="auth-footnote">You stay in control of who can access your documents.</div>}
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
  const [duplicating, setDuplicating] = useState(false);
  const [sortBy, setSortBy] = useState("updated");
  const [showFavorites, setShowFavorites] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
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
  const [sharedRoleMap, setSharedRoleMap] = useState({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");
  const [documentShares, setDocumentShares] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");
  const [lastSharedRecipient, setLastSharedRecipient] = useState(null);
  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [remoteCarets, setRemoteCarets] = useState([]);
  const [collaborationStatus, setCollaborationStatus] = useState("offline");
  const [collaborationReady, setCollaborationReady] = useState(false);
  const [caretRenderTick, setCaretRenderTick] = useState(0);
  const editorRef = useRef(null);
  const collabDocRef = useRef(null);
  const collabTextRef = useRef(null);
  const collabChannelRef = useRef(null);
  const collabReadyRef = useRef(false);
  const collabTabIdRef = useRef(null);
  const collabCaretTimerRef = useRef(null);
  const collabTypingTimerRef = useRef(null);
  const titleSyncRef = useRef(title);
  titleSyncRef.current = title;
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
      setSharedRoleMap({});
      setShareModalOpen(false);
      initialUrlHandledUserRef.current = null;
      return undefined;
    }
    let cancelled = false;
    setDocumentsLoading(true);
    setDocumentsLoadedUserId(null);
    setSharedRoleMap({});
    setGlobalError("");
    Promise.all([
      supabase.from("documents")
        .select("id,user_id,title,content,created_at,updated_at,is_favorite")
        .order("updated_at", { ascending: false }),
      supabase.from("document_shares")
        .select("document_id,role")
        .eq("shared_with_email", (session.user.email || "").trim().toLowerCase()),
    ]).then(([documentsResult, sharesResult]) => {
      if (cancelled) return;
      if (documentsResult.error) {
        setGlobalError(documentsResult.error.message || "Could not load your documents.");
        setDocuments([]);
      } else {
        setDocuments(documentsResult.data || []);
      }
      if (sharesResult.error) {
        setSharedRoleMap({});
        setGlobalError((current) => current || sharesResult.error.message || "Could not load collaboration permissions.");
      } else {
        setSharedRoleMap(Object.fromEntries((sharesResult.data || []).map((share) => [share.document_id, share.role])));
      }
      if (!documentsResult.error) setDocumentsLoadedUserId(session.user.id);
      setDocumentsLoading(false);
    }).catch((error) => {
      if (!cancelled) {
        setGlobalError(error?.message || "Could not load your documents.");
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
    const matching = documents.filter((doc) => {
      if (showFavorites && (!doc.is_favorite || doc.user_id !== session?.user?.id)) return false;
      if (!needle) return true;
      return (doc.title || "").toLowerCase().includes(needle) || (doc.content || "").toLowerCase().includes(needle);
    });
    return matching.sort((a, b) => {
      if (sortBy === "title-asc") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "title-desc") return (b.title || "").localeCompare(a.title || "");
      if (sortBy === "created") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "oldest") return new Date(a.updated_at) - new Date(b.updated_at);
      return new Date(b.updated_at) - new Date(a.updated_at);
    });
  }, [documents, search, showFavorites, sortBy, session?.user?.id]);

  const selectedDoc = documents.find((doc) => doc.id === selectedDocId) || null;
  const selectedDocRole = !selectedDoc ? null : selectedDoc.user_id === session?.user?.id ? "owner" : (sharedRoleMap[selectedDoc.id] || "viewer");
  const canEditSelectedDoc = selectedDocRole === "owner" || selectedDocRole === "editor";
  const canManageSharing = selectedDocRole === "owner";
  const wordCount = useMemo(() => {
    const trimmed = content.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [content]);
  const characterCount = content.length;
  const markdownPreview = useMemo(() => renderMarkdown(content), [content]);

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
    setShareModalOpen(false);
  }

  function showDashboard() {
    updateDocumentUrl(null);
    setView("home");
    setShowFavorites(false);
    setSidebarOpen(false);
    setShareModalOpen(false);
  }

  function showFavoritesPage() {
    updateDocumentUrl(null);
    setView("home");
    setShowFavorites(true);
    setSidebarOpen(false);
  }

  async function toggleFavorite(documentId = selectedDocId) {
    const doc = documents.find((item) => item.id === documentId);
    if (!doc || doc.user_id !== session?.user?.id) return;
    setGlobalError("");
    const { data, error } = await supabase.from("documents")
      .update({ is_favorite: !doc.is_favorite })
      .eq("id", documentId)
      .select("*")
      .single();
    if (error) {
      setGlobalError(error.message || "Couldn't update this document's favorite status.");
      return;
    }
    setDocuments((current) => current.map((item) => item.id === documentId ? data : item));
  }

  async function openShareModal() {
    if (!selectedDocId || !canManageSharing) return;
    setShareModalOpen(true);
    setShareEmail("");
    setShareRole("viewer");
    setShareError("");
    setShareSuccess("");
    setLastSharedRecipient(null);
    setSharesLoading(true);
    const { data, error } = await supabase.from("document_shares")
      .select("id,document_id,owner_id,shared_with_email,role,created_at")
      .eq("document_id", selectedDocId)
      .order("created_at", { ascending: true });
    if (error) {
      setShareError(error.message || "Could not load sharing settings.");
      setDocumentShares([]);
    } else {
      setDocumentShares(data || []);
    }
    setSharesLoading(false);
  }

  function invitationMailto(recipientEmail, role) {
    const url = new URL(documentHref(selectedDocId), window.location.origin).toString();
    const subject = `You're invited to collaborate on ${title.trim() || "a DocNow document"}`;
    const body = [
      "Hi,",
      "",
      `I've shared "${title.trim() || "Untitled document"}" with you on DocNow.`,
      `Your access level is: ${role === "editor" ? "Editor (can make changes)" : "Viewer (read-only)"}.`,
      "",
      `Open the document: ${url}`,
      "",
      `Please sign in to DocNow using ${recipientEmail}. If you do not have an account yet, create one with this same email address.`,
      "",
      "See you there!",
    ].join("\n");
    return `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function shareDocument(event) {
    event.preventDefault();
    if (!selectedDocId || !session?.user?.id || !canManageSharing || shareBusy) return;
    const normalizedEmail = shareEmail.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setShareError("Enter a valid email address.");
      return;
    }
    if (normalizedEmail === (session.user.email || "").trim().toLowerCase()) {
      setShareError("You already own this document. Choose someone else's email address.");
      return;
    }

    setShareBusy(true);
    setShareError("");
    setShareSuccess("");
    try {
      const { data, error } = await supabase.from("document_shares")
        .upsert({
          document_id: selectedDocId,
          owner_id: session.user.id,
          shared_with_email: normalizedEmail,
          role: shareRole,
        }, { onConflict: "document_id,shared_with_email" })
        .select("id,document_id,owner_id,shared_with_email,role,created_at")
        .single();
      if (error) throw error;
      setDocumentShares((current) => {
        const withoutRecipient = current.filter((item) => item.shared_with_email !== normalizedEmail);
        return [...withoutRecipient, data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      });
      setLastSharedRecipient({ email: normalizedEmail, role: data.role });
      setShareSuccess(`Access saved for ${normalizedEmail}. Use the email draft below to notify them.`);
      setShareEmail("");
    } catch (error) {
      setShareError(error?.message || "Could not share this document.");
    } finally {
      setShareBusy(false);
    }
  }

  async function updateShareRole(shareId, nextRole) {
    if (!canManageSharing || shareBusy || !["viewer", "editor"].includes(nextRole)) return;
    setShareBusy(true);
    setShareError("");
    setShareSuccess("");
    try {
      const { data, error } = await supabase.from("document_shares")
        .update({ role: nextRole })
        .eq("id", shareId)
        .eq("document_id", selectedDocId)
        .select("id,document_id,owner_id,shared_with_email,role,created_at")
        .single();
      if (error) throw error;
      setDocumentShares((current) => current.map((item) => item.id === shareId ? data : item));
      setLastSharedRecipient({ email: data.shared_with_email, role: data.role });
      setShareSuccess(`Updated ${data.shared_with_email} to ${data.role === "editor" ? "Editor" : "Viewer"} access.`);
    } catch (error) {
      setShareError(error?.message || "Could not update this collaborator.");
    } finally {
      setShareBusy(false);
    }
  }

  async function removeDocumentShare(share) {
    if (!canManageSharing || shareBusy) return;
    if (!window.confirm(`Remove ${share.shared_with_email}'s access to this document?`)) return;
    setShareBusy(true);
    setShareError("");
    setShareSuccess("");
    try {
      const { error } = await supabase.from("document_shares")
        .delete()
        .eq("id", share.id)
        .eq("document_id", selectedDocId);
      if (error) throw error;
      const liveChannel = collabChannelRef.current;
      if (liveChannel) void liveChannel.send({ type: "broadcast", event: "access-revoked", payload: { email: share.shared_with_email } }).catch(() => undefined);
      setDocumentShares((current) => current.filter((item) => item.id !== share.id));
      if (lastSharedRecipient?.email === share.shared_with_email) setLastSharedRecipient(null);
      setShareSuccess(`Access removed for ${share.shared_with_email}.`);
    } catch (error) {
      setShareError(error?.message || "Could not remove this collaborator.");
    } finally {
      setShareBusy(false);
    }
  }

  async function duplicateDocument() {
    if (!selectedDocId || duplicating || !session?.user?.id) return;
    setDuplicating(true);
    setGlobalError("");
    try {
      const duplicateTitle = `${title.trim() || "Untitled document"} (copy)`.slice(0, 240);
      const { data, error } = await supabase.from("documents")
        .insert({ user_id: session.user.id, title: duplicateTitle, content, is_favorite: false })
        .select("*")
        .single();
      if (error) throw error;
      setDocuments((current) => [data, ...current]);
      openDocument(data);
    } catch (error) {
      setGlobalError(error?.message || "Couldn't duplicate this document.");
    } finally {
      setDuplicating(false);
    }
  }

  function exportDocument(format = "md") {
    if (!selectedDocId) return;
    const safeName = (title.trim() || "Untitled document")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .trim()
      .slice(0, 100) || "document";
    const plainText = content
      .replace(/^\s*```[^\n]*\n?/gm, "")
      .replace(/^\s*```\s*$/gm, "")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "• ")
      .replace(/^\s*\d+\.\s+/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 ($2)");
    const exported = format === "txt" ? plainText : `# ${title.trim() || "Untitled document"}\n\n${content}`;
    const blob = new Blob([exported], { type: format === "txt" ? "text/plain;charset=utf-8" : "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${safeName}.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
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

  function sendCollaborationMessage(event, payload) {
    const channel = collabChannelRef.current;
    if (!channel || !collabReadyRef.current) return;
    void channel.send({ type: "broadcast", event, payload }).catch(() => undefined);
  }

  function scheduleCaretBroadcast() {
    if (collabCaretTimerRef.current) window.clearTimeout(collabCaretTimerRef.current);
    collabCaretTimerRef.current = window.setTimeout(() => {
      const textarea = editorRef.current;
      const yDoc = collabDocRef.current;
      const yText = collabTextRef.current;
      const channel = collabChannelRef.current;
      if (!textarea || !yDoc || !yText || !channel || !collabReadyRef.current) return;
      const anchor = Math.min(textarea.selectionStart ?? 0, yText.length);
      const head = Math.min(textarea.selectionEnd ?? anchor, yText.length);
      try {
        sendCollaborationMessage("caret", {
          user_id: session?.user?.id,
          tab_id: collabTabIdRef.current,
          email: session?.user?.email || "",
          display_name: (session?.user?.email || "Collaborator").split("@")[0],
          role: selectedDocRole,
          color: collaboratorColor(collabTabIdRef.current || session?.user?.id),
          anchor: encodeBase64(Y.encodeRelativePosition(Y.createRelativePositionFromTypeIndex(yText, anchor))),
          head: encodeBase64(Y.encodeRelativePosition(Y.createRelativePositionFromTypeIndex(yText, head))),
          sent_at: Date.now(),
        });
      } catch {
        // A caret can briefly refer to a stale index while concurrent changes merge.
      }
    }, 45);
  }

  function handleCollaborativeTextChange(event) {
    const nextValue = event.target.value;
    const yDoc = collabDocRef.current;
    const yText = collabTextRef.current;
    if (yDoc && yText && collabReadyRef.current) {
      applyTextDiff(yDoc, yText, nextValue);
      scheduleCaretBroadcast();
    } else {
      setContent(nextValue);
    }
  }

  function handleCollaborativeTitleChange(event) {
    const nextTitle = event.target.value;
    titleSyncRef.current = nextTitle;
    setTitle(nextTitle);
    sendCollaborationMessage("title-update", {
      title: nextTitle,
      user_id: session?.user?.id,
      tab_id: collabTabIdRef.current,
      sent_at: Date.now(),
    });
  }

  function saveDocument(nextTitle = title, nextContent = content) {
    if (!session?.user?.id || !selectedDocId || !canEditSelectedDoc) return Promise.resolve();
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
    if (!selectedDocId || !session?.user?.id || !canEditSelectedDoc) return undefined;
    const safeTitle = title.trim() || "Untitled document";
    if (lastSavedRef.current.title === safeTitle && lastSavedRef.current.content === content) return undefined;
    setSaveStatus("unsaved");
    const timeout = window.setTimeout(() => { void saveDocument(title, content); }, 700);
    return () => window.clearTimeout(timeout);
  }, [title, content, selectedDocId, session?.user?.id, canEditSelectedDoc]);

  useEffect(() => {
    const activeDoc = documents.find((doc) => doc.id === selectedDocId) || null;
    if (!selectedDocId || view !== "editor" || !activeDoc || !session?.user?.id || documentsLoadedUserId !== session.user.id) {
      setActiveCollaborators([]);
      setRemoteCarets([]);
      setCollaborationStatus("offline");
      setCollaborationReady(false);
      collabReadyRef.current = false;
      return undefined;
    }

    let alive = true;
    let bootstrapTimer = null;
    let fallbackTimer = null;
    let wasSeeded = false;
    const documentId = selectedDocId;
    const initialContent = activeDoc.content || content || "";
    const initialTitle = activeDoc.title || title || "Untitled document";
    const tabId = window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(36).slice(2);
    collabTabIdRef.current = tabId;
    const currentRole = activeDoc.user_id === session.user.id ? "owner" : (sharedRoleMap[documentId] || "viewer");
    const presenceBase = {
      tab_id: tabId,
      user_id: session.user.id,
      email: session.user.email || "",
      display_name: (session.user.email || "Collaborator").split("@")[0],
      role: currentRole,
      color: collaboratorColor(tabId),
      collab_ready: false,
    };

    const yDoc = new Y.Doc();
    const yText = yDoc.getText("content");
    collabDocRef.current = yDoc;
    collabTextRef.current = yText;
    collabReadyRef.current = false;
    titleSyncRef.current = initialTitle;
    setCollaborationReady(false);
    setCollaborationStatus("connecting");
    setActiveCollaborators([]);
    setRemoteCarets([]);

    const channel = supabase.channel("docnow:" + documentId, {
      config: {
        private: true,
        presence: { key: tabId },
        broadcast: { ack: true },
      },
    });
    collabChannelRef.current = channel;

    const refreshPresence = () => {
      if (!alive) return;
      const people = Object.values(channel.presenceState()).flat().filter((person) => person && person.tab_id);
      setActiveCollaborators(people);
      const activeTabs = new Set(people.map((person) => person.tab_id));
      setRemoteCarets((current) => current.filter((caret) => activeTabs.has(caret.tab_id)));
    };

    const setReady = async (titleValue) => {
      if (!alive) return;
      collabReadyRef.current = true;
      setCollaborationReady(true);
      if (typeof titleValue === "string") {
        titleSyncRef.current = titleValue;
        setTitle(titleValue);
      }
      try {
        await channel.track({ ...presenceBase, collab_ready: true });
      } catch {
        // Document autosave remains available if realtime presence tracking is unavailable.
      }
      refreshPresence();
    };

    const sendSyncState = () => {
      if (!alive || !collabReadyRef.current) return;
      void channel.send({
        type: "broadcast",
        event: "sync-state",
        payload: {
          update: encodeBase64(Y.encodeStateAsUpdate(yDoc)),
          title: titleSyncRef.current || initialTitle,
          user_id: session.user.id,
          tab_id: tabId,
        },
      }).catch(() => undefined);
    };

    const seedFromDatabase = async () => {
      if (!alive || wasSeeded || collabReadyRef.current) return;
      wasSeeded = true;
      if (yText.length === 0 && initialContent) {
        yDoc.transact(() => yText.insert(0, initialContent), "initial-database-seed");
      }
      await setReady(titleSyncRef.current || initialTitle);
      sendSyncState();
    };

    const captureSelection = () => {
      const textarea = editorRef.current;
      if (!textarea || document.activeElement !== textarea) return null;
      try {
        const anchor = Math.min(textarea.selectionStart ?? 0, yText.length);
        const head = Math.min(textarea.selectionEnd ?? anchor, yText.length);
        return {
          anchor: Y.createRelativePositionFromTypeIndex(yText, anchor),
          head: Y.createRelativePositionFromTypeIndex(yText, head),
        };
      } catch {
        return null;
      }
    };

    const restoreSelection = (selection) => {
      if (!selection) return;
      window.requestAnimationFrame(() => {
        const textarea = editorRef.current;
        if (!textarea || document.activeElement !== textarea) return;
        const anchor = Y.createAbsolutePositionFromRelativePosition(selection.anchor, yDoc);
        const head = Y.createAbsolutePositionFromRelativePosition(selection.head, yDoc);
        if (anchor && head) textarea.setSelectionRange(anchor.index, head.index);
      });
    };

    yText.observe(() => {
      if (!alive) return;
      const nextContent = yText.toString();
      setContent((current) => current === nextContent ? current : nextContent);
      setDocuments((current) => current.map((doc) => (
        doc.id === documentId && doc.content !== nextContent ? { ...doc, content: nextContent } : doc
      )));
    });

    yDoc.on("update", (update, origin) => {
      if (!alive || origin === channel) return;
      void channel.send({
        type: "broadcast",
        event: "y-update",
        payload: { update: encodeBase64(update), tab_id: tabId, user_id: session.user.id },
      }).catch(() => undefined);
    });

    channel
      .on("presence", { event: "sync" }, refreshPresence)
      .on("presence", { event: "join" }, refreshPresence)
      .on("presence", { event: "leave" }, refreshPresence)
      .on("broadcast", { event: "y-update" }, ({ payload }) => {
        if (!alive || !payload?.update || payload.tab_id === tabId) return;
        const savedSelection = captureSelection();
        try {
          Y.applyUpdate(yDoc, decodeBase64(payload.update), channel);
          restoreSelection(savedSelection);
        } catch {
          setGlobalError("A live edit could not be applied. Reopen the document to resync.");
        }
      })
      .on("broadcast", { event: "sync-request" }, ({ payload }) => {
        if (payload?.tab_id !== tabId) sendSyncState();
      })
      .on("broadcast", { event: "sync-state" }, async ({ payload }) => {
        if (!alive || !payload?.update || payload.tab_id === tabId) return;
        const savedSelection = captureSelection();
        try {
          Y.applyUpdate(yDoc, decodeBase64(payload.update), channel);
          restoreSelection(savedSelection);
          if (!collabReadyRef.current) {
            await setReady(typeof payload.title === "string" ? payload.title : initialTitle);
          } else if (typeof payload.title === "string" && payload.title !== titleSyncRef.current) {
            titleSyncRef.current = payload.title;
            setTitle(payload.title);
          }
        } catch {
          setGlobalError("Could not sync the latest document state. Try reopening the page.");
        }
      })
      .on("broadcast", { event: "title-update" }, ({ payload }) => {
        if (!alive || payload?.tab_id === tabId || typeof payload?.title !== "string") return;
        titleSyncRef.current = payload.title;
        setTitle(payload.title);
        setDocuments((current) => current.map((doc) => (
          doc.id === documentId && doc.title !== payload.title ? { ...doc, title: payload.title } : doc
        )));
      })
      .on("broadcast", { event: "caret" }, ({ payload }) => {
        if (!alive || !payload?.tab_id || payload.tab_id === tabId || !payload.head) return;
        setRemoteCarets((current) => {
          const withoutSame = current.filter((caret) => caret.tab_id !== payload.tab_id);
          return [...withoutSame, payload];
        });
      })
      .on("broadcast", { event: "access-revoked" }, ({ payload }) => {
        if (!alive || payload?.email !== (session.user.email || "").toLowerCase()) return;
        setGlobalError("Your access to this document was revoked by its owner.");
        updateDocumentUrl(null);
        setSelectedDocId(null);
        setView("home");
        setTitle("");
        setContent("");
      });

    channel.subscribe(async (status) => {
      if (!alive) return;
      if (status === "SUBSCRIBED") {
        setCollaborationStatus("connected");
        try {
          await channel.track(presenceBase);
        } catch {
          // Continue document editing even if presence tracking is temporarily unavailable.
        }
        refreshPresence();
        bootstrapTimer = window.setTimeout(() => {
          if (!alive || collabReadyRef.current) return;
          const people = Object.values(channel.presenceState()).flat().filter((person) => person?.tab_id);
          const readyPeers = people.filter((person) => person.tab_id !== tabId && person.collab_ready);
          if (readyPeers.length) {
            void channel.send({ type: "broadcast", event: "sync-request", payload: { tab_id: tabId } }).catch(() => undefined);
            return;
          }
          const allTabs = [...new Set([...people.map((person) => person.tab_id), tabId])].sort();
          if (allTabs[0] === tabId) {
            void seedFromDatabase();
          } else {
            void channel.send({ type: "broadcast", event: "sync-request", payload: { tab_id: tabId } }).catch(() => undefined);
          }
        }, 700);
        fallbackTimer = window.setTimeout(() => {
          if (alive && !collabReadyRef.current) void seedFromDatabase();
        }, 4500);
      } else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
        setCollaborationStatus("offline");
        if (!collabReadyRef.current) void seedFromDatabase();
        else setCollaborationReady(true);
      }
    });

    return () => {
      alive = false;
      if (bootstrapTimer) window.clearTimeout(bootstrapTimer);
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      if (collabCaretTimerRef.current) window.clearTimeout(collabCaretTimerRef.current);
      if (collabTypingTimerRef.current) window.clearTimeout(collabTypingTimerRef.current);
      if (collabChannelRef.current === channel) collabChannelRef.current = null;
      if (collabDocRef.current === yDoc) collabDocRef.current = null;
      if (collabTextRef.current === yText) collabTextRef.current = null;
      collabReadyRef.current = false;
      setCollaborationReady(false);
      void supabase.removeChannel(channel);
      yDoc.destroy();
    };
  }, [selectedDocId, session?.user?.id, documentsLoadedUserId, view]);

  async function deleteDocument() {
    if (!selectedDocId || deleteBusy || !canManageSharing) return;
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
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "d") {
      event.preventDefault();
      void duplicateDocument();
    }
    if (event.key === "Escape") {
      setUserMenuOpen(false);
      setSidebarOpen(false);
      setShareModalOpen(false);
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
          <button type="button" className={"side-nav-item" + (view === "home" && !showFavorites ? " active" : "")} onClick={showDashboard}><Icon name="home" size={18} /><span>All documents</span><span className="nav-count">{documents.length}</span></button>
          <button type="button" className={"side-nav-item" + (view === "home" && showFavorites ? " active" : "")} onClick={showFavoritesPage}><Icon name="star" size={18} /><span>Starred</span><span className="nav-count">{documents.filter((doc) => doc.is_favorite && doc.user_id === session.user.id).length}</span></button>
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
              <div className="editor-actions">{canManageSharing && <><button type="button" className={"icon-button favorite-button" + (selectedDoc?.is_favorite ? " is-favorite" : "")} aria-label={selectedDoc?.is_favorite ? "Remove from starred" : "Add to starred"} title={selectedDoc?.is_favorite ? "Remove from starred" : "Add to starred"} onClick={() => void toggleFavorite()}><Icon name="star" size={17} /></button><button type="button" className="button button-outline save-button share-button" onClick={() => void openShareModal()} title="Share with people by email"><Icon name="share" size={15} /> Share</button></>}<button type="button" className="button button-outline save-button copy-link-button" onClick={() => void copyDocumentLink()} title="Copy this document's link"><Icon name="link" size={15} /> {linkCopied ? "Link copied!" : "Copy link"}</button><button type="button" className="button button-outline save-button duplicate-button" onClick={() => void duplicateDocument()} disabled={duplicating} title="Duplicate document"><Icon name="copy" size={15} /> {duplicating ? "Copying…" : "Duplicate"}</button>{canManageSharing && <button type="button" className="icon-button delete-button" aria-label="Delete document" title="Delete document" onClick={() => void deleteDocument()} disabled={deleteBusy}><Icon name="trash" size={17} /></button>}{canEditSelectedDoc && <button type="button" className="button button-outline save-button" onClick={() => void saveDocument(title, content)}><Icon name="check" size={16} /> Save now</button>}</div>
            </div>
            <div className="editor-scroll">
              <div className="editor-paper">
                <div className="document-meta"><span className="document-type"><Icon name="file" size={15} /> DOCUMENT</span><span className="meta-divider">·</span><span>Edited {formatDate(selectedDoc?.updated_at)}</span><span className="meta-divider">·</span><span>{selectedDocRole === "owner" ? "Owner" : selectedDocRole === "editor" ? "Shared · Editor" : "Shared · Viewer"}</span></div>
                <div className="collab-presence-bar" aria-live="polite"><div className="collab-presence-status"><span className={"collab-status-dot status-" + collaborationStatus} />{collaborationStatus === "connected" ? "Live collaboration" : collaborationStatus === "connecting" ? "Connecting…" : "Live sync unavailable"}</div><div className="collab-avatar-stack">{activeCollaborators.slice(0, 5).map((person) => <span key={person.tab_id} className="collab-avatar" style={{ "--collab-color": person.color || collaboratorColor(person.tab_id) }} title={(person.display_name || person.email || "Collaborator") + " · " + (person.role || "viewer")}>{initials(person.display_name || person.email)}</span>)}{activeCollaborators.length > 5 && <span className="collab-avatar collab-avatar-more">+{activeCollaborators.length - 5}</span>}</div><span className="collab-presence-count">{activeCollaborators.length ? activeCollaborators.length + " " + (activeCollaborators.length === 1 ? "person" : "people") + " here" : collaborationStatus === "connected" ? "You’re the only one here" : "Edits still save normally"}</span></div>
                <input className="document-title-input" aria-label="Document title" value={title} onChange={handleCollaborativeTitleChange} placeholder="Untitled document" maxLength={240} readOnly={!canEditSelectedDoc || !collaborationReady} />
                <div className="editor-mode-switch" role="tablist" aria-label="Document mode">
                  <button type="button" role="tab" aria-selected={!previewMode} className={!previewMode ? "mode-tab active" : "mode-tab"} onClick={() => setPreviewMode(false)}><Icon name="pencil" size={15} /> Write</button>
                  <button type="button" role="tab" aria-selected={previewMode} className={previewMode ? "mode-tab active" : "mode-tab"} onClick={() => setPreviewMode(true)}><Icon name="eye" size={15} /> Preview</button>
                  <div className="formatbar-spacer" />
                  <button type="button" className="export-button" onClick={() => exportDocument("md")} title="Download Markdown"><Icon name="download" size={14} /> .md</button>
                  <button type="button" className="export-button" onClick={() => exportDocument("txt")} title="Download plain text"><Icon name="download" size={14} /> .txt</button>
                </div>
                {canEditSelectedDoc && !previewMode && <div className="editor-formatbar" role="toolbar" aria-label="Text formatting shortcuts">
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
                </div>}
                {previewMode ? (
                  <div className="markdown-preview" aria-label="Rendered document preview" dangerouslySetInnerHTML={{ __html: markdownPreview || "<p class='preview-empty'>Nothing to preview yet. Switch to Write to start typing.</p>" }} />
                ) : (
                  <div className="collab-editor-frame"><textarea ref={editorRef} className="document-editor" aria-label="Document content" value={content} onChange={handleCollaborativeTextChange} onSelect={scheduleCaretBroadcast} onKeyUp={scheduleCaretBroadcast} onMouseUp={scheduleCaretBroadcast} onScroll={() => { scheduleCaretBroadcast(); setCaretRenderTick((value) => value + 1); }} placeholder={"Start writing something wonderful…\n\nA thought, a plan, a list — it all starts here."} readOnly={!canEditSelectedDoc || !collaborationReady} spellCheck /><div className="remote-caret-layer" aria-hidden="true" key={caretRenderTick}>{remoteCarets.map((caret) => { let position = null; try { const yDoc = collabDocRef.current; if (yDoc && caret.head) { const relative = Y.decodeRelativePosition(decodeBase64(caret.head)); position = Y.createAbsolutePositionFromRelativePosition(relative, yDoc)?.index ?? null; } } catch { position = null; } const coords = position === null ? null : textareaCaretCoordinates(editorRef.current, position); if (!coords) return null; return <div key={caret.tab_id} className="remote-caret-marker" style={{ top: coords.top, left: coords.left, height: coords.height, "--caret-color": caret.color || collaboratorColor(caret.tab_id) }}><span className="remote-caret-label">{caret.display_name || caret.email?.split("@")[0] || "Collaborator"}</span></div>; })}</div></div>
                )}
                <div className="editor-bottomline"><span>{wordCount} {wordCount === 1 ? "word" : "words"} <span>·</span> {characterCount} characters</span><span>{selectedDocRole === "owner" ? "You own this document" : selectedDocRole === "editor" ? "Shared with you · Editor access" : "Shared with you · Viewer access"} <span className="private-dot" /></span></div>
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

            <div className="documents-heading-row"><div><h2>{showFavorites ? "Starred documents" : search.trim() ? "Search results" : "Your documents"}</h2><p>{showFavorites ? "The pages you marked as favorites." : search.trim() ? "Matching pages from your workspace" : "Pick up where you left off."}</p></div><div className="documents-heading-actions"><label className="sort-control"><Icon name="sort" size={15} /><select aria-label="Sort documents" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="updated">Recently edited</option><option value="created">Recently created</option><option value="oldest">Least recently edited</option><option value="title-asc">Title A–Z</option><option value="title-desc">Title Z–A</option></select></label><div className="documents-view-label"><Icon name="files" size={16} /> {filteredDocuments.length} {filteredDocuments.length === 1 ? "PAGE" : "PAGES"}</div></div></div>

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
                    <div className="document-card-top"><span className="card-file-icon"><Icon name="file" size={18} /></span>{doc.user_id === session.user.id && doc.is_favorite && <span className="card-star" title="Starred document"><Icon name="star" size={14} /></span>}{doc.user_id !== session.user.id && <span className="card-shared-label">SHARED</span>}<span className="card-updated">{formatDate(doc.updated_at)}</span><span className="card-more" aria-hidden="true">↗</span></div>
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
      {shareModalOpen && selectedDoc && (
        <div className="share-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShareModalOpen(false); }}>
          <section className="share-modal" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
            <div className="share-modal-heading">
              <div><span className="share-modal-kicker">COLLABORATION</span><h2 id="share-modal-title">Share document</h2><p>Invite people by email and choose what they can do.</p></div>
              <button type="button" className="icon-button share-modal-close" aria-label="Close sharing dialog" onClick={() => setShareModalOpen(false)}>×</button>
            </div>
            <div className="share-document-summary"><span className="share-summary-icon"><Icon name="file" size={17} /></span><div><strong>{title.trim() || "Untitled document"}</strong><span>People must sign in to DocNow with the invited email address.</span></div></div>
            <form className="share-form" onSubmit={(event) => void shareDocument(event)}>
              <label className="share-field">Email address
                <input type="email" autoComplete="off" placeholder="colleague@example.com" value={shareEmail} onChange={(event) => setShareEmail(event.target.value)} required disabled={shareBusy} />
              </label>
              <label className="share-field">Permission
                <select value={shareRole} onChange={(event) => setShareRole(event.target.value)} disabled={shareBusy}>
                  <option value="viewer">Viewer — can read only</option>
                  <option value="editor">Editor — can make changes</option>
                </select>
              </label>
              <button type="submit" className="button button-primary share-submit" disabled={shareBusy}>
                {shareBusy ? <span className="button-spinner" /> : <Icon name="share" size={16} />}{shareBusy ? "Saving access…" : "Share document"}
              </button>
            </form>
            {shareError && <div className="form-message form-error share-message" role="alert">{shareError}</div>}
            {shareSuccess && <div className="form-message form-success share-message" role="status">{shareSuccess}</div>}
            {lastSharedRecipient && (
              <a className="button button-outline share-email-draft" href={invitationMailto(lastSharedRecipient.email, lastSharedRecipient.role)}>
                <Icon name="link" size={15} /> Email invitation to {lastSharedRecipient.email}
              </a>
            )}
            <p className="share-email-note">Access is saved in DocNow immediately. The email button opens a draft in your email app; you still need to send it.</p>
            <div className="share-list-heading"><h3>People with access</h3><span>{documentShares.length}</span></div>
            <div className="share-list">
              {sharesLoading ? <div className="share-empty">Loading people…</div> : documentShares.length ? documentShares.map((share) => (
                <div className="share-person" key={share.id}>
                  <span className="share-person-avatar">{initials(share.shared_with_email)}</span>
                  <div className="share-person-main"><strong>{share.shared_with_email}</strong><span>Invited {formatDate(share.created_at)}</span></div>
                  <select className="share-role-select" aria-label={`Permission for ${share.shared_with_email}`} value={share.role} onChange={(event) => void updateShareRole(share.id, event.target.value)} disabled={shareBusy}>
                    <option value="viewer">Viewer</option><option value="editor">Editor</option>
                  </select>
                  <button type="button" className="share-remove-button" aria-label={`Remove ${share.shared_with_email}`} title="Remove access" onClick={() => void removeDocumentShare(share)} disabled={shareBusy}>×</button>
                </div>
              )) : <div className="share-empty">Only you have access so far. Add an email above to collaborate.</div>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}