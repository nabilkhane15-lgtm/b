import React, { useState, useEffect } from 'react';
import {
  X,
  Flame,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  DownloadCloud,
  RefreshCw,
  ExternalLink,
  Clipboard,
  ShieldCheck,
  Check,
  Database,
  Copy,
  Sparkles,
  HelpCircle,
  FileCode,
  KeyRound,
} from 'lucide-react';
import {
  FirebaseConfig,
  getFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  testFirebaseConnection,
  uploadClubDataToFirestore,
  downloadClubDataFromFirestore,
  isFirebaseConfigured,
} from '../utils/firebase';
import { Language } from '../utils/language';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  getAllClubData: () => any;
  onRestoreClubData: (data: any) => void;
  isAdmin?: boolean;
}

const FIRESTORE_SAMPLE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Healthcheck ping
    match /_connection_test/{docId} {
      allow read, write: if request.time < timestamp.date(2027, 12, 31);
    }

    // Club documents & subcollections (members, payments, expenses, etc.)
    match /clubs/{clubId} {
      allow read: if true;
      allow write: if request.time < timestamp.date(2027, 12, 31);
    }

    match /clubs/{clubId}/{document=**} {
      allow read: if true;
      allow write: if request.time < timestamp.date(2027, 12, 31);
    }
  }
}`;

export const FirebaseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  lang,
  getAllClubData,
  onRestoreClubData,
  isAdmin = false,
}) => {
  const isBangla = lang === 'bn';

  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');

  const [rawJson, setRawJson] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [rulesCopied, setRulesCopied] = useState(false);
  const [clipboardPasted, setClipboardPasted] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const cfg = getFirebaseConfig();
      if (cfg) {
        setApiKey(cfg.apiKey || '');
        setProjectId(cfg.projectId || '');
        setAuthDomain(cfg.authDomain || '');
        setStorageBucket(cfg.storageBucket || '');
        setMessagingSenderId(cfg.messagingSenderId || '');
        setAppId(cfg.appId || '');
      }
      setTestResult(null);
      setSyncStatus(null);
      setRulesCopied(false);
      setClipboardPasted(false);
    }
  }, [isOpen]);

  if (!isOpen || !isAdmin) return null;

  // Auto-parse snippet when pasted into raw json box or clipboard
  const handleParseSnippet = (text: string) => {
    setRawJson(text);
    if (!text.trim()) return;

    // 1. Try standard JSON cleanup
    try {
      const jsonCandidate = text
        .replace(/const\s+firebaseConfig\s*=\s*/i, '')
        .replace(/var\s+firebaseConfig\s*=\s*/i, '')
        .replace(/let\s+firebaseConfig\s*=\s*/i, '')
        .replace(/;\s*$/, '')
        .replace(/([a-zA-Z0-9_]+):/g, '"$1":')
        .replace(/'/g, '"');

      const parsed = JSON.parse(jsonCandidate);
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.authDomain) setAuthDomain(parsed.authDomain);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      if (parsed.appId) setAppId(parsed.appId);
      setShowJsonInput(false);
      return;
    } catch {
      // Fallback to regex
    }

    // Check if raw text is directly an API key or VAPID key
    const trimmed = text.trim();
    if (trimmed.startsWith('AIzaSy')) {
      setApiKey(trimmed);
      setShowJsonInput(false);
      return;
    }

    // 2. Robust Regex matching for both quoted and unquoted values
    const apiKeyMatch = text.match(/apiKey["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-]+)["']?/i);
    const projectIdMatch = text.match(/projectId["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-]+)["']?/i);
    const authDomainMatch = text.match(/authDomain["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-\.]+)["']?/i);
    const appIdMatch = text.match(/appId["']?\s*[:=]\s*["']?([a-zA-Z0-9_:\-]+)["']?/i);
    const senderIdMatch = text.match(/messagingSenderId["']?\s*[:=]\s*["']?([0-9]+)["']?/i);
    const bucketMatch = text.match(/storageBucket["']?\s*[:=]\s*["']?([a-zA-Z0-9_\-\.]+)["']?/i);

    if (apiKeyMatch) setApiKey(apiKeyMatch[1]);
    if (projectIdMatch) setProjectId(projectIdMatch[1]);
    if (authDomainMatch) setAuthDomain(authDomainMatch[1]);
    if (appIdMatch) setAppId(appIdMatch[1]);
    if (senderIdMatch) setMessagingSenderId(senderIdMatch[1]);
    if (bucketMatch) setStorageBucket(bucketMatch[1]);

    if (apiKeyMatch || projectIdMatch) {
      setShowJsonInput(false);
    }
  };

  const handleClipboardAutoPaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          handleParseSnippet(text);
          setClipboardPasted(true);
          setTimeout(() => setClipboardPasted(false), 2500);
          return;
        }
      }
      setShowJsonInput(true);
    } catch {
      // If browser clipboard permission is blocked, open textarea
      setShowJsonInput(true);
    }
  };

  const handleCopyRules = () => {
    try {
      navigator.clipboard.writeText(FIRESTORE_SAMPLE_RULES);
      setRulesCopied(true);
      setTimeout(() => setRulesCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy rules', e);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim() || !projectId.trim()) {
      alert(isBangla ? 'API Key এবং Project ID আবশ্যক।' : 'API Key and Project ID are required.');
      return;
    }

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim() || `web:${projectId.trim()}`,
    };

    saveFirebaseConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim() || !projectId.trim()) {
      setTestResult({
        success: false,
        message: isBangla ? 'অনুগ্রহ করে API Key ও Project ID দিন।' : 'Please enter API Key and Project ID.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim() || `web:${projectId.trim()}`,
    };

    const res = await testFirebaseConnection(config);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleUploadAll = async () => {
    handleSave();
    setIsSyncing(true);
    setSyncStatus(null);

    const clubData = getAllClubData();
    const res = await uploadClubDataToFirestore(clubData);
    setIsSyncing(false);

    if (res.success) {
      setSyncStatus(
        isBangla
          ? `সফলভাবে ${res.count} টি আইটেম ক্লাউড ফায়ারবেসে আপলোড করা হয়েছে!`
          : `Successfully synced ${res.count} items to Firestore!`
      );
    } else {
      setSyncStatus(`ত্রুটি: ${res.error}`);
    }
  };

  const handleDownloadAll = async () => {
    handleSave();
    if (!confirm(isBangla ? 'ফায়ারবেস থেকে ডাটা নামালে লোকাল ডাটা আপডেট হবে। এগিয়ে যাবেন?' : 'Overwrite local data with Firebase cloud data?')) {
      return;
    }

    setIsDownloading(true);
    const res = await downloadClubDataFromFirestore();
    setIsDownloading(false);

    if (res.success && res.data) {
      onRestoreClubData(res.data);
      alert(isBangla ? 'ফায়ারবেস থেকে ডাটা সফলভাবে ডাউনলোড করা হয়েছে!' : 'Data restored from Firebase successfully!');
      onClose();
    } else {
      alert(res.error || (isBangla ? 'ডাটা পাওয়া যায়নি।' : 'No data found in Firebase.'));
    }
  };

  const handleDisconnect = () => {
    if (confirm(isBangla ? 'আপনি কি Firebase সংযোগ বিচ্ছিন্ন করতে চান?' : 'Disconnect Firebase?')) {
      clearFirebaseConfig();
      setApiKey('');
      setProjectId('');
      setAuthDomain('');
      setStorageBucket('');
      setMessagingSenderId('');
      setAppId('');
      setTestResult(null);
      setSyncStatus(null);
    }
  };

  const isConnected = isFirebaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner">
              <Flame className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-wide">
                {isBangla ? 'Firebase কনসোল ও লাইভ ক্লাউড ডাটাবেস' : 'Connect Firebase Console'}
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                {isBangla
                  ? 'গুগল ফায়ারবেস ক্লাউড স্টোরেজ ও অটোমেটিক সিঙ্ক'
                  : 'Google Cloud Firestore Real-time Database'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isBangla ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'}
                </span>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {isConnected
                    ? isBangla
                      ? `কানেক্টেড (Project: ${projectId || 'Configured'})`
                      : `Connected (${projectId})`
                    : isBangla
                    ? 'কানেক্ট করা হয়নি'
                    : 'Not Connected'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isConnected && (
                <button
                  onClick={handleDisconnect}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  {isBangla ? 'সংযোগ বিচ্ছিন্ন করুন' : 'Disconnect'}
                </button>
              )}
            </div>
          </div>

          {/* Assistant Pro-Tip Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold">
                {isBangla
                  ? '💡 সহজ পদ্ধতি: চ্যাটে পাঠিয়ে দিন!'
                  : '💡 Quick Option: Share in Chat!'}
              </p>
              <p className="leading-relaxed">
                {isBangla
                  ? 'Firebase Console-এ প্রজেক্ট তৈরি করার পর পাওয়া firebaseConfig কোড বা API Key ও Project ID সরাসরি চ্যাটে লিখে পাঠিয়ে দিলেও আমি নিজে সবকিছু কোডে সেট করে দেব।'
                  : 'You can also paste your firebaseConfig snippet or Project ID in the AI chat, and I will configure it for you automatically.'}
              </p>
            </div>
          </div>

          {/* Quick Step Guide */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/40">
            <button
              onClick={() => setShowHelpGuide(!showHelpGuide)}
              className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                {isBangla
                  ? 'Firebase Console-এ বাকি কাজগুলো করার ৩টি সহজ ধাপ'
                  : '3 Simple Steps to complete in Firebase Console'}
              </span>
              <span className="text-amber-600 dark:text-amber-400 text-xs">
                {showHelpGuide ? (isBangla ? 'লুকান' : 'Hide') : (isBangla ? 'দেখুন' : 'Show')}
              </span>
            </button>

            {showHelpGuide && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                {/* Step 1 */}
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    ১
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isBangla ? 'Web API Key বা Config কপি করা:' : 'Get Web API Key / Config:'}
                    </span>{' '}
                    {isBangla ? (
                      <>
                        আপনার প্রজেক্টের সরাসরি পেজ:{' '}
                        <a
                          href={`https://console.firebase.google.com/project/${projectId || 'badminton-7ae79'}/settings/general`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-600 dark:text-amber-400 font-bold underline inline-flex items-center gap-0.5"
                        >
                          Project Settings &gt; General <ExternalLink className="w-3 h-3" />
                        </a>
                        । সেখানে থাকা <strong>Web API Key</strong> (যেমন <code>AIzaSy...</code>) কপি করে নিচে বসান, অথবা Your apps থেকে <code>firebaseConfig</code> কোডটি কপি করে পেস্ট করুন।
                      </>
                    ) : (
                      <>
                        Visit{' '}
                        <a
                          href={`https://console.firebase.google.com/project/${projectId || 'badminton-7ae79'}/settings/general`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-600 dark:text-amber-400 font-bold underline inline-flex items-center gap-0.5"
                        >
                          Project Settings &gt; General <ExternalLink className="w-3 h-3" />
                        </a>{' '}
                        to copy the Web API Key or firebaseConfig.
                      </>
                    )}
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    ২
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isBangla ? 'Firestore Database তৈরি করা:' : 'Create Firestore Database:'}
                    </span>{' '}
                    {isBangla ? (
                      <>
                        সরাসরি লিঙ্ক:{' '}
                        <a
                          href={`https://console.firebase.google.com/project/${projectId || 'badminton-7ae79'}/firestore`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-600 dark:text-amber-400 font-bold underline inline-flex items-center gap-0.5"
                        >
                          Firestore Database খুলুন <ExternalLink className="w-3 h-3" />
                        </a>{' '}
                        &gt; <strong>"Create database"</strong> বাটনে চাপুন &gt; <strong>"Start in test mode"</strong> সিলেক্ট করে Create চাপুন।
                      </>
                    ) : (
                      'Open Firestore Database > Click Create database > Select Start in test mode > Done.'
                    )}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    ৩
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isBangla ? 'ডাটাবেস রুলস (Rules) কনফিগার:' : 'Firestore Security Rules:'}
                    </span>{' '}
                    {isBangla
                      ? 'Firestore Database এর "Rules" ট্যাবে গিয়ে নিচের রুলসটি কপি করে পেস্ট করে "Publish" করুন।'
                      : 'Go to Firestore Rules tab, paste the rules below, and click Publish.'}
                  </div>
                </div>

                {/* Firestore Rules Card with 1-click copy */}
                <div className="mt-2 p-3 bg-slate-900 rounded-xl text-slate-100 font-mono text-[11px] relative">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <span className="text-slate-400 text-[10px] flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5 text-amber-400" /> firestore.rules
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRules}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-colors"
                    >
                      {rulesCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{rulesCopied ? (isBangla ? 'কপি হয়েছে!' : 'Copied!') : (isBangla ? 'রুলস কপি করুন' : 'Copy Rules')}</span>
                    </button>
                  </div>
                  <pre className="text-amber-200 overflow-x-auto whitespace-pre leading-relaxed">{FIRESTORE_SAMPLE_RULES}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Quick Paste or Fields */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isBangla ? 'প্রজেক্ট কনফিগারেশন' : 'Configuration Credentials'}
              </span>

              <div className="flex items-center gap-2">
                {/* 1-Click Clipboard Auto-Paste Button */}
                <button
                  type="button"
                  onClick={handleClipboardAutoPaste}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 border border-amber-300/50 dark:border-amber-700/50 transition-all shadow-sm"
                  title="Firebase Console থেকে কপি করা কোড স্বয়ংক্রিয়ভাবে ইনপুট হবে"
                >
                  {clipboardPasted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Clipboard className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>
                    {clipboardPasted
                      ? isBangla
                        ? 'পেস্ট হয়েছে!'
                        : 'Pasted!'
                      : isBangla
                      ? '📋 ক্লিপবোর্ড থেকে অটো-পেস্ট'
                      : '📋 Auto-Paste from Clipboard'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowJsonInput(!showJsonInput)}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1"
                >
                  {showJsonInput
                    ? isBangla
                      ? 'আলাদা ফিল্ডে দেখুন'
                      : 'Show input fields'
                    : isBangla
                    ? 'কোড বক্স'
                    : 'Code Box'}
                </button>
              </div>
            </div>

            {showJsonInput ? (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {isBangla
                    ? 'Firebase Console থেকে পাওয়া firebaseConfig কোডটি নিচে পেস্ট করুন:'
                    : 'Paste the firebaseConfig object here:'}
                </label>
                <textarea
                  value={rawJson}
                  onChange={(e) => handleParseSnippet(e.target.value)}
                  placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "my-club.firebaseapp.com",\n  projectId: "my-club-123",\n  appId: "1:..."\n};`}
                  rows={6}
                  className="w-full p-3 font-mono text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    API Key <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      apiKey.startsWith('BG') || (apiKey.length > 50 && !apiKey.startsWith('AIzaSy'))
                        ? 'border-amber-500 focus:ring-amber-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-amber-500'
                    }`}
                  />
                  {apiKey.startsWith('BG') || (apiKey.length > 50 && !apiKey.startsWith('AIzaSy')) ? (
                    <div className="mt-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-200 leading-normal">
                      ⚠️ {isBangla
                        ? 'এটি Cloud Messaging এর Key Pair (VAPID)। Firebase Database এর জন্য Project Settings > General থেকে Web API Key (যা AIzaSy দিয়ে শুরু) প্রয়োজন।'
                        : 'This looks like a Cloud Messaging key pair. Please use the Web API Key (starts with AIzaSy) from Project Settings > General.'}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Project ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="badminton-club-abc"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Auth Domain
                  </label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="project-id.firebaseapp.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    App ID
                  </label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1:123456789:web:abcdef"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Test Connection Results */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 border ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed font-semibold">
                {testResult.message}
              </div>
            </div>
          )}

          {/* Status Message */}
          {syncStatus && (
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold">
              {syncStatus}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
              >
                {isTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span>{isBangla ? 'সংযোগ পরীক্ষা করুন' : 'Test Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                <span>
                  {savedSuccess
                    ? isBangla
                      ? 'সংরক্ষিত!'
                      : 'Saved!'
                    : isBangla
                    ? 'কনফিগ সেভ করুন'
                    : 'Save Config'}
                </span>
              </button>
            </div>

            {/* Cloud Sync Buttons */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleUploadAll}
                disabled={isSyncing}
                className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {isSyncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                <span>
                  {isBangla
                    ? 'সব ডাটা ফায়ারবেসে আপলোড/সিঙ্ক করুন'
                    : 'Sync All Club Data to Firebase'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isDownloading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <DownloadCloud className="w-4 h-4" />
                )}
                <span>{isBangla ? 'ক্লাউড থেকে রিস্টোর' : 'Restore from Cloud'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
