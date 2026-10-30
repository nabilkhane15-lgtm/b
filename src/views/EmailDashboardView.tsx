import React, { useState, useMemo } from 'react';
import {
  ClubSettings,
  CustomFund,
  EmailLogEntry,
  EmailSettings,
  EmailTemplateType,
  FundContribution,
  Member,
  MonthlyPayment,
  MonthRecord,
  Payment,
  Week,
} from '../types';
import { Language, formatCurrency, formatNumber } from '../utils/language';
import {
  CLOUDFLARE_WORKER_BROTHERSKING_CODE,
  DEFAULT_EMAIL_TEMPLATES,
  EmailTemplateVariables,
  GOOGLE_APPS_SCRIPT_AUTO_MAILER_CODE,
  getEffectiveTemplate,
  loadEmailLogs,
  loadEmailSettings,
  openGmailCompose,
  openMailtoClient,
  renderEmailTemplate,
  saveEmailLogs,
  saveEmailSettings,
  sendEmailViaConfiguredApi,
} from '../utils/emailService';
import { isMonthUpcoming, isWeekUpcoming } from '../utils/accounting';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  FileText,
  Settings,
  History,
  Sparkles,
  Check,
  Edit2,
  Copy,
  RefreshCw,
  ExternalLink,
  Zap,
  Trash2,
} from 'lucide-react';

interface Props {
  members: Member[];
  weeks: Week[];
  months: MonthRecord[];
  payments: Payment[];
  monthlyPayments: MonthlyPayment[];
  funds: CustomFund[];
  fundContributions: FundContribution[];
  activeWeek: Week;
  activeMonth: MonthRecord;
  clubSettings: ClubSettings;
  lang: Language;
  isAdmin: boolean;
  onUpdateMember?: (updated: Member) => void;
}

type DashboardSubTab = 'COMPOSE' | 'TEMPLATES' | 'SETTINGS' | 'HISTORY';
type PeriodScope = 'WEEKLY' | 'MONTHLY' | 'FUND';
type RecipientFilter = 'UNPAID' | 'PAID' | 'PARTIAL' | 'ALL';

export const EmailDashboardView: React.FC<Props> = ({
  members,
  weeks,
  months,
  payments,
  monthlyPayments,
  funds,
  fundContributions,
  activeWeek,
  activeMonth,
  clubSettings,
  lang,
  isAdmin,
  onUpdateMember,
}) => {
  const isBangla = lang === 'bn';

  const [subTab, setSubTab] = useState<DashboardSubTab>('COMPOSE');
  const [periodScope, setPeriodScope] = useState<PeriodScope>('WEEKLY');
  const [selectedWeekId, setSelectedWeekId] = useState<string>(activeWeek?.id || weeks[0]?.id || '');
  const [selectedMonthId, setSelectedMonthId] = useState<string>(
    activeMonth?.id || months[0]?.id || ''
  );
  const [selectedFundId, setSelectedFundId] = useState<string>(funds[0]?.id || '');
  const [recipientFilter, setRecipientFilter] = useState<RecipientFilter>('UNPAID');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>('DUE_REMINDER');

  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() =>
    loadEmailSettings(clubSettings)
  );
  const [emailLogs, setEmailLogs] = useState<EmailLogEntry[]>(() => loadEmailLogs());

  // Custom subject & body override in Compose view
  const currentTplConfig = getEffectiveTemplate(selectedTemplate, emailSettings);
  const [customSubjectOverride, setCustomSubjectOverride] = useState<string>('');
  const [customBodyOverride, setCustomBodyOverride] = useState<string>('');
  const [isUsingOverride, setIsUsingOverride] = useState<boolean>(false);

  // Selected member IDs for bulk sending
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [previewMemberId, setPreviewMemberId] = useState<string>(members[0]?.id || '');

  // Inline email editing per member row
  const [editingEmailMemberId, setEditingEmailMemberId] = useState<string | null>(null);
  const [editingEmailValue, setEditingEmailValue] = useState<string>('');

  // Status feedback
  const [sendingBulk, setSendingBulk] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState<string>('nabilkhane15@gmail.com');
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  // Template studio editor state
  const [editingTplType, setEditingTplType] = useState<EmailTemplateType>('DUE_REMINDER');
  const [tplSubBn, setTplSubBn] = useState(
    getEffectiveTemplate('DUE_REMINDER', emailSettings).subjectBn
  );
  const [tplBodyBn, setTplBodyBn] = useState(
    getEffectiveTemplate('DUE_REMINDER', emailSettings).bodyBn
  );
  const [tplSubEn, setTplSubEn] = useState(
    getEffectiveTemplate('DUE_REMINDER', emailSettings).subjectEn
  );
  const [tplBodyEn, setTplBodyEn] = useState(
    getEffectiveTemplate('DUE_REMINDER', emailSettings).bodyEn
  );

  const showBanner = (type: 'success' | 'info' | 'error', message: string) => {
    setStatusBanner({ type, message });
    setTimeout(() => setStatusBanner(null), 4500);
  };

  // Switch template automatically when filter changes between UNPAID and PAID
  const handleSelectFilter = (nextFilter: RecipientFilter) => {
    setRecipientFilter(nextFilter);
    if (nextFilter === 'PAID') {
      setSelectedTemplate('PAID_RECEIPT');
    } else if (nextFilter === 'PARTIAL') {
      setSelectedTemplate('PARTIAL_REMINDER');
    } else if (nextFilter === 'UNPAID') {
      setSelectedTemplate(periodScope === 'FUND' ? 'FUND_NOTICE' : 'DUE_REMINDER');
    }
    setIsUsingOverride(false);
  };

  // Compute each member's payment record for the chosen scope
  const currentPeriodTitle = useMemo(() => {
    if (periodScope === 'WEEKLY') {
      const w = weeks.find((x) => x.id === selectedWeekId) || activeWeek;
      return isBangla && w?.titleBangla ? w.titleBangla : w?.title || 'সাপ্তাহিক চাঁদা';
    }
    if (periodScope === 'MONTHLY') {
      const m = months.find((x) => x.id === selectedMonthId) || activeMonth;
      return isBangla && m?.titleBangla ? m.titleBangla : m?.title || 'মাসিক চাঁদা';
    }
    const f = funds.find((x) => x.id === selectedFundId) || funds[0];
    return isBangla && f?.titleBangla ? f.titleBangla : f?.title || 'বিশেষ ফান্ড';
  }, [
    periodScope,
    selectedWeekId,
    selectedMonthId,
    selectedFundId,
    weeks,
    months,
    funds,
    activeWeek,
    activeMonth,
    isBangla,
  ]);

  const memberRecipientRows = useMemo(() => {
    return members.map((m) => {
      let expected = 0;
      let paid = 0;
      let status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT' = 'UNPAID';
      let paymentMethod = 'Cash / bKash';
      let paymentDate = new Date().toLocaleDateString('en-GB');

      if (periodScope === 'WEEKLY') {
        const w = weeks.find((x) => x.id === selectedWeekId) || activeWeek;
        const p = payments.find((x) => x.weekId === w?.id && x.memberId === m.id);
        paid = p?.paidAmount || 0;
        if (
          (m.participatesInSports === false || m.contributionType === 'monthly') &&
          paid === 0
        ) {
          expected = 0;
          status = 'EXEMPT';
        } else {
          expected = p ? p.expectedAmount : m.weeklyAmount;
          if (isWeekUpcoming(w) && paid === 0) {
            status = 'EXEMPT';
          } else if (paid >= expected && expected > 0) {
            status = 'PAID';
          } else if (paid > 0) {
            status = 'PARTIAL';
          } else {
            status = 'UNPAID';
          }
        }
        if (p?.paymentMethod) paymentMethod = p.paymentMethod;
        if (p?.paymentDate) paymentDate = p.paymentDate;
      } else if (periodScope === 'MONTHLY') {
        const mo = months.find((x) => x.id === selectedMonthId) || activeMonth;
        const mp = monthlyPayments.find((x) => x.monthId === mo?.id && x.memberId === m.id);
        paid = mp?.paidAmount || 0;
        if (
          (m.participatesInSports === false || m.contributionType === 'weekly') &&
          paid === 0
        ) {
          expected = 0;
          status = 'EXEMPT';
        } else {
          expected = mp ? mp.expectedAmount : m.monthlyAmount || clubSettings.defaultMonthlyFee || 1400;
          if (isMonthUpcoming(mo) && paid === 0) {
            status = 'EXEMPT';
          } else if (paid >= expected && expected > 0) {
            status = 'PAID';
          } else if (paid > 0) {
            status = 'PARTIAL';
          } else {
            status = 'UNPAID';
          }
        }
        if (mp?.paymentMethod) paymentMethod = mp.paymentMethod;
        if (mp?.paymentDate) paymentDate = mp.paymentDate;
      } else {
        const f = funds.find((x) => x.id === selectedFundId) || funds[0];
        const fc = fundContributions.find((x) => x.fundId === f?.id && x.memberId === m.id);
        expected = fc ? fc.expectedAmount : f?.defaultTargetPerMember || 500;
        paid = fc?.paidAmount || 0;
        if (paid >= expected && expected > 0) status = 'PAID';
        else if (paid > 0) status = 'PARTIAL';
        else status = 'UNPAID';
        if (fc?.paymentMethod) paymentMethod = fc.paymentMethod;
        if (fc?.date) paymentDate = fc.date;
      }

      const due = status === 'EXEMPT' ? 0 : Math.max(0, expected - paid);
      return {
        member: m,
        expected,
        paid,
        due,
        status,
        paymentMethod,
        paymentDate,
      };
    });
  }, [
    members,
    periodScope,
    selectedWeekId,
    selectedMonthId,
    selectedFundId,
    weeks,
    months,
    funds,
    payments,
    monthlyPayments,
    fundContributions,
    activeWeek,
    activeMonth,
    clubSettings.defaultMonthlyFee,
  ]);

  const filteredRows = useMemo(() => {
    return memberRecipientRows.filter((r) => {
      if (recipientFilter === 'ALL') return r.status !== 'EXEMPT';
      return r.status === recipientFilter;
    });
  }, [memberRecipientRows, recipientFilter]);

  const counts = useMemo(() => {
    return {
      unpaid: memberRecipientRows.filter((r) => r.status === 'UNPAID').length,
      paid: memberRecipientRows.filter((r) => r.status === 'PAID').length,
      partial: memberRecipientRows.filter((r) => r.status === 'PARTIAL').length,
      all: memberRecipientRows.filter((r) => r.status !== 'EXEMPT').length,
    };
  }, [memberRecipientRows]);

  const buildEmailForRow = (row: (typeof memberRecipientRows)[number]) => {
    const clubName =
      emailSettings.senderBrandName ||
      (isBangla && clubSettings.clubNameBangla
        ? clubSettings.clubNameBangla
        : clubSettings.clubName);

    const vars: EmailTemplateVariables = {
      name: isBangla && row.member.banglaName ? row.member.banglaName : row.member.name,
      memberCode: row.member.memberCode || '1000',
      periodTitle: currentPeriodTitle,
      expectedAmount: row.expected,
      paidAmount: row.paid,
      dueAmount: row.due,
      paymentMethod: row.paymentMethod,
      paymentDate: row.paymentDate,
      clubName,
      senderName: emailSettings.senderName || 'Brothers Badminton (Brothers King)',
      paymentNumbersInfo: emailSettings.paymentNumbersInfo,
    };

    const rawSubject = isUsingOverride
      ? customSubjectOverride
      : isBangla
      ? currentTplConfig.subjectBn
      : currentTplConfig.subjectEn;
    const rawBody = isUsingOverride
      ? customBodyOverride
      : isBangla
      ? currentTplConfig.bodyBn
      : currentTplConfig.bodyEn;

    return {
      subject: renderEmailTemplate(rawSubject, vars),
      body: renderEmailTemplate(rawBody, vars),
      vars,
    };
  };

  const previewRow =
    filteredRows.find((r) => r.member.id === previewMemberId) ||
    filteredRows[0] ||
    memberRecipientRows[0];

  const previewEmail = previewRow ? buildEmailForRow(previewRow) : null;

  const appendLog = (entry: EmailLogEntry) => {
    const next = [entry, ...emailLogs].slice(0, 250);
    setEmailLogs(next);
    saveEmailLogs(next);
  };

  const handleSendSingleEmail = async (
    row: (typeof memberRecipientRows)[number],
    mode: 'GMAIL' | 'MAILTO' | 'API'
  ) => {
    const emailAddr = (row.member.email || '').trim();
    if (!emailAddr) {
      setEditingEmailMemberId(row.member.id);
      setEditingEmailValue('');
      showBanner(
        'error',
        isBangla
          ? `${row.member.banglaName || row.member.name}-এর ইমেইল ঠিকানা যুক্ত করা নেই! নিচে ইমেইল বসিয়ে সেভ করুন।`
          : `Please add an email address for ${row.member.name} first.`
      );
      return;
    }

    const { subject, body, vars } = buildEmailForRow(row);

    if (mode === 'API') {
      const res = await sendEmailViaConfiguredApi(emailSettings, {
        toEmail: emailAddr,
        toName: vars.name,
        subject,
        body,
        memberCode: vars.memberCode,
        periodTitle: currentPeriodTitle,
        amount: row.paid > 0 ? row.paid : row.due,
      });

      if (res.ok) {
        appendLog({
          id: `em-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-GB'),
          memberId: row.member.id,
          memberName: vars.name,
          memberCode: vars.memberCode,
          recipientEmail: emailAddr,
          templateType: selectedTemplate,
          subject,
          body,
          deliveryMethod: 'API_AUTO',
          status: 'SENT',
          periodTitle: currentPeriodTitle,
          amount: row.paid > 0 ? row.paid : row.due,
        });
        showBanner(
          'success',
          isBangla
            ? `✅ ${vars.name} (${emailAddr})-এর কাছে স্বয়ংক্রিয়ভাবে ইমেইল পাঠানো হয়েছে!`
            : `✅ Auto email sent to ${vars.name} (${emailAddr})!`
        );
        return;
      }
      // Fallback to Gmail Web if API isn't configured yet
      openGmailCompose(emailAddr, subject, body);
      appendLog({
        id: `em-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-GB'),
        memberId: row.member.id,
        memberName: vars.name,
        memberCode: vars.memberCode,
        recipientEmail: emailAddr,
        templateType: selectedTemplate,
        subject,
        body,
        deliveryMethod: 'GMAIL_WEB',
        status: 'OPENED',
        periodTitle: currentPeriodTitle,
        amount: row.paid > 0 ? row.paid : row.due,
      });
      showBanner(
        'info',
        isBangla
          ? `📧 ${vars.name}-এর জন্য Gmail কম্পোজ ওপেন হয়েছে (বাকগ্রাউন্ড API সেটআপ না থাকায় Gmail ওপেন হয়েছে)।`
          : `📧 Opened Gmail compose for ${vars.name}.`
      );
      return;
    }

    if (mode === 'GMAIL') {
      openGmailCompose(emailAddr, subject, body);
      appendLog({
        id: `em-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-GB'),
        memberId: row.member.id,
        memberName: vars.name,
        memberCode: vars.memberCode,
        recipientEmail: emailAddr,
        templateType: selectedTemplate,
        subject,
        body,
        deliveryMethod: 'GMAIL_WEB',
        status: 'OPENED',
        periodTitle: currentPeriodTitle,
        amount: row.paid > 0 ? row.paid : row.due,
      });
      showBanner(
        'success',
        isBangla
          ? `📧 ${vars.name}-এর জন্য Gmail রেডি করা হয়েছে!`
          : `📧 Gmail compose opened for ${vars.name}!`
      );
    } else {
      openMailtoClient(emailAddr, subject, body);
      appendLog({
        id: `em-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-GB'),
        memberId: row.member.id,
        memberName: vars.name,
        memberCode: vars.memberCode,
        recipientEmail: emailAddr,
        templateType: selectedTemplate,
        subject,
        body,
        deliveryMethod: 'MAILTO_CLIENT',
        status: 'OPENED',
        periodTitle: currentPeriodTitle,
        amount: row.paid > 0 ? row.paid : row.due,
      });
    }
  };

  const handleBulkSend = async (mode: 'GMAIL' | 'API') => {
    const targetRows =
      selectedMemberIds.length > 0
        ? filteredRows.filter((r) => selectedMemberIds.includes(r.member.id))
        : filteredRows;

    const validRows = targetRows.filter((r) => (r.member.email || '').trim().length > 0);
    if (validRows.length === 0) {
      showBanner(
        'error',
        isBangla
          ? 'নির্বাচিত সদস্যদের কারো ইমেইল ঠিকানা যুক্ত করা নেই! অনুগ্রহ করে নিচে ইমেইল ঠিকানা যোগ করুন।'
          : 'None of the selected members have an email address saved.'
      );
      return;
    }

    setSendingBulk(true);
    try {
      if (
        mode === 'API' &&
        (emailSettings.provider === 'CUSTOM_DOMAIN' ||
          emailSettings.provider === 'EMAILJS' ||
          emailSettings.provider === 'WEBHOOK')
      ) {
        let sentCount = 0;
        const newLogs: EmailLogEntry[] = [];

        for (const row of validRows) {
          const emailAddr = (row.member.email || '').trim();
          const { subject, body, vars } = buildEmailForRow(row);
          const res = await sendEmailViaConfiguredApi(emailSettings, {
            toEmail: emailAddr,
            toName: vars.name,
            subject,
            body,
            memberCode: vars.memberCode,
            periodTitle: currentPeriodTitle,
            amount: row.paid > 0 ? row.paid : row.due,
            isPaidReceipt: row.status === 'PAID',
          });
          if (res.ok) {
            sentCount++;
            newLogs.push({
              id: `em-${Date.now()}-${row.member.id}`,
              timestamp: new Date().toLocaleString('en-GB'),
              memberId: row.member.id,
              memberName: vars.name,
              memberCode: vars.memberCode,
              recipientEmail: emailAddr,
              templateType: selectedTemplate,
              subject,
              body,
              deliveryMethod: 'API_AUTO',
              status: 'SENT',
              periodTitle: currentPeriodTitle,
              amount: row.paid > 0 ? row.paid : row.due,
            });
          }
        }

        if (sentCount > 0) {
          const merged = [...newLogs, ...emailLogs].slice(0, 250);
          setEmailLogs(merged);
          saveEmailLogs(merged);
          showBanner(
            'success',
            isBangla
              ? `🚀 মোট ${formatNumber(sentCount, true)} জন সদস্যের কাছে স্বয়ংক্রিয় ইমেইল পাঠানো সম্পন্ন হয়েছে!`
              : `🚀 Successfully sent ${sentCount} automated emails!`
          );
          return;
        }
      }

      // Multi-recipient Gmail BCC compose with personalized summary list
      const allEmails = validRows.map((r) => (r.member.email || '').trim());
      const firstRow = validRows[0];
      const { subject, body } = buildEmailForRow(firstRow);

      // If multiple members, build a clean club-wide reminder/receipt table in body
      const summaryLines = validRows
        .map(
          (r, idx) =>
            `${idx + 1}. ${isBangla && r.member.banglaName ? r.member.banglaName : r.member.name} (#${r.member.memberCode}) — নির্ধারিত: ৳${r.expected} | জমা: ৳${r.paid} | বকেয়া: ৳${r.due}`
        )
        .join('\n');

      const bulkBody =
        validRows.length === 1
          ? body
          : `${body}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 তালিকাভুক্ত সদস্যদের সারসংক্ষেপ (${currentPeriodTitle}):\n${summaryLines}`;

      openGmailCompose(allEmails[0], subject, bulkBody, allEmails.slice(1));

      const bulkLogs: EmailLogEntry[] = validRows.map((r) => ({
        id: `em-${Date.now()}-${r.member.id}`,
        timestamp: new Date().toLocaleString('en-GB'),
        memberId: r.member.id,
        memberName: isBangla && r.member.banglaName ? r.member.banglaName : r.member.name,
        memberCode: r.member.memberCode || '1000',
        recipientEmail: (r.member.email || '').trim(),
        templateType: selectedTemplate,
        subject,
        body: bulkBody,
        deliveryMethod: 'GMAIL_WEB',
        status: 'OPENED',
        periodTitle: currentPeriodTitle,
        amount: r.paid > 0 ? r.paid : r.due,
      }));

      const nextLogs = [...bulkLogs, ...emailLogs].slice(0, 250);
      setEmailLogs(nextLogs);
      saveEmailLogs(nextLogs);

      showBanner(
        'success',
        isBangla
          ? `📧 ${formatNumber(validRows.length, true)} জন সদস্যের ইমেইলসহ Gmail বাল্ক কম্পোজ ওপেন হয়েছে!`
          : `📧 Opened bulk Gmail compose for ${validRows.length} members!`
      );
    } finally {
      setSendingBulk(false);
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                {isBangla
                  ? '📧 অ্যাডমিন ইমেইল ড্যাশবোর্ড ও অটো রিমাইন্ডার'
                  : '📧 Admin Email Dashboard & Auto Reminder'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                {emailSettings.autoSendOnPaid
                  ? isBangla
                    ? '⚡ অটো পেমেন্ট ইমেইল চালু'
                    : '⚡ Auto-Receipt Active'
                  : isBangla
                  ? 'ম্যানুয়াল মোড'
                  : 'Manual Mode'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-500/25 text-amber-200 border border-amber-400/40">
                🌐 {emailSettings.fromDomainEmail || 'noreply@brothersking.cyou'}
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              {isBangla
                ? 'পরিশোধিত সদস্যদের ডিজিটাল রসিদ এবং বকেয়া সদস্যদের এক ক্লিকে বা স্বয়ংক্রিয়ভাবে রিমাইন্ডার ইমেইল পাঠান'
                : 'Send automated payment receipts to paid members and instant reminder emails to unpaid members'}
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
          {[
            {
              id: 'COMPOSE' as const,
              label: isBangla ? '📤 ইমেইল পাঠান' : '📤 Send Email',
              icon: <Send className="w-3.5 h-3.5" />,
            },
            {
              id: 'TEMPLATES' as const,
              label: isBangla ? '📝 টেমপ্লেট' : '📝 Templates',
              icon: <FileText className="w-3.5 h-3.5" />,
            },
            {
              id: 'SETTINGS' as const,
              label: isBangla ? '⚙️ অটো সিস্টেম' : '⚙️ Auto Setup',
              icon: <Settings className="w-3.5 h-3.5" />,
            },
            {
              id: 'HISTORY' as const,
              label: isBangla
                ? `📜 লগ (${formatNumber(emailLogs.length, true)})`
                : `📜 Logs (${emailLogs.length})`,
              icon: <History className="w-3.5 h-3.5" />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                subTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {statusBanner && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : statusBanner.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-200'
          }`}
        >
          <span>{statusBanner.message}</span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-[11px] underline opacity-75"
          >
            {isBangla ? 'বন্ধ' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 1: COMPOSE & SEND REMINDERS / RECEIPTS */}
      {/* ===================================================================== */}
      {subTab === 'COMPOSE' && (
        <div className="space-y-4">
          {/* 1. Scope & Period Selector */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                  {isBangla ? '১. কোন খাতের ইমেইল পাঠাতে চান?' : '1. Select Collection Scope:'}
                </span>
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                  {[
                    { id: 'WEEKLY' as const, label: isBangla ? '📅 সাপ্তাহিক' : '📅 Weekly' },
                    { id: 'MONTHLY' as const, label: isBangla ? '🗓️ মাসিক' : '🗓️ Monthly' },
                    { id: 'FUND' as const, label: isBangla ? '🤝 বিশেষ ফান্ড' : '🤝 Special Fund' },
                  ].map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setPeriodScope(sc.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        periodScope === sc.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Week / Month / Fund Dropdown */}
              <div>
                {periodScope === 'WEEKLY' && (
                  <select
                    value={selectedWeekId}
                    onChange={(e) => setSelectedWeekId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700"
                  >
                    {weeks.map((w) => (
                      <option key={w.id} value={w.id}>
                        {isBangla && w.titleBangla ? w.titleBangla : w.title}
                      </option>
                    ))}
                  </select>
                )}
                {periodScope === 'MONTHLY' && (
                  <select
                    value={selectedMonthId}
                    onChange={(e) => setSelectedMonthId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700"
                  >
                    {months.map((m) => (
                      <option key={m.id} value={m.id}>
                        {isBangla && m.titleBangla ? m.titleBangla : m.title}
                      </option>
                    ))}
                  </select>
                )}
                {periodScope === 'FUND' && (
                  <select
                    value={selectedFundId}
                    onChange={(e) => setSelectedFundId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-700"
                  >
                    {funds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {isBangla && f.titleBangla ? f.titleBangla : f.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* 2. Audience Filter Cards (Unpaid vs Paid vs Partial vs All) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleSelectFilter('UNPAID')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  recipientFilter === 'UNPAID'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-rose-700 dark:text-rose-300">
                    ❌ {isBangla ? 'বকেয়া সদস্য' : 'Unpaid (Due)'}
                  </span>
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                  {formatNumber(counts.unpaid, isBangla)} {isBangla ? 'জন' : ''}
                </div>
                <span className="text-[10px] text-slate-500">
                  {isBangla ? 'রিমাইন্ডার ইমেইল পাঠান' : 'Send payment reminder'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectFilter('PAID')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  recipientFilter === 'PAID'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                    ✅ {isBangla ? 'পরিশোধিত সদস্য' : 'Paid Members'}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatNumber(counts.paid, isBangla)} {isBangla ? 'জন' : ''}
                </div>
                <span className="text-[10px] text-slate-500">
                  {isBangla ? 'পেমেন্ট রসিদ ও ধন্যবাদ ইমেইল' : 'Send digital receipt'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectFilter('PARTIAL')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  recipientFilter === 'PARTIAL'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                    ⏳ {isBangla ? 'আংশিক পরিশোধিত' : 'Partial Paid'}
                  </span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {formatNumber(counts.partial, isBangla)} {isBangla ? 'জন' : ''}
                </div>
                <span className="text-[10px] text-slate-500">
                  {isBangla ? 'অবশিষ্ট বকেয়া রিমাইন্ডার' : 'Balance reminder'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectFilter('ALL')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  recipientFilter === 'ALL'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                    👥 {isBangla ? 'সকল সক্রিয় সদস্য' : 'All Active'}
                  </span>
                  <Users className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                  {formatNumber(counts.all, isBangla)} {isBangla ? 'জন' : ''}
                </div>
                <span className="text-[10px] text-slate-500">
                  {isBangla ? 'সাধারণ নোটিশ বা বার্তা' : 'General club notice'}
                </span>
              </button>
            </div>
          </div>

          {/* 3. Template Picker & Live Email Preview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Template & Live Preview (5 cols) */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>{isBangla ? '২. ইমেইল টেমপ্লেট ও প্রিভিউ' : '2. Email Template & Preview'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (!isUsingOverride && previewEmail) {
                      setCustomSubjectOverride(
                        isBangla ? currentTplConfig.subjectBn : currentTplConfig.subjectEn
                      );
                      setCustomBodyOverride(
                        isBangla ? currentTplConfig.bodyBn : currentTplConfig.bodyEn
                      );
                    }
                    setIsUsingOverride(!isUsingOverride);
                  }}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>
                    {isUsingOverride
                      ? isBangla
                        ? 'ডিফল্ট টেমপ্লেটে ফিরুন'
                        : 'Reset to Template'
                      : isBangla
                      ? 'বার্তা এডিট করুন'
                      : 'Customize Message'}
                  </span>
                </button>
              </div>

              {/* Template Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    id: 'DUE_REMINDER' as const,
                    label: isBangla ? '🔔 বকেয়া রিমাইন্ডার' : '🔔 Due Reminder',
                  },
                  {
                    id: 'PAID_RECEIPT' as const,
                    label: isBangla ? '✅ পেমেন্ট সম্পন্ন রসিদ' : '✅ Paid Receipt',
                  },
                  {
                    id: 'PARTIAL_REMINDER' as const,
                    label: isBangla ? '⏳ আংশিক পেমেন্ট' : '⏳ Partial Reminder',
                  },
                  {
                    id: 'FUND_NOTICE' as const,
                    label: isBangla ? '🤝 বিশেষ ফান্ড নোটিশ' : '🤝 Fund Notice',
                  },
                  {
                    id: 'CUSTOM' as const,
                    label: isBangla ? '✍️ কাস্টম বার্তা' : '✍️ Custom Notice',
                  },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(tpl.id);
                      setIsUsingOverride(false);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
                      selectedTemplate === tpl.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

              {isUsingOverride ? (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      {isBangla ? 'ইমেইল সাবজেক্ট (Subject)' : 'Subject'}
                    </label>
                    <input
                      type="text"
                      value={customSubjectOverride}
                      onChange={(e) => setCustomSubjectOverride(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-emerald-400 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      {isBangla ? 'ইমেইল বডি (Body)' : 'Body'}
                    </label>
                    <textarea
                      rows={9}
                      value={customBodyOverride}
                      onChange={(e) => setCustomBodyOverride(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-emerald-400 text-xs text-slate-900 dark:text-white font-sans leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                previewEmail && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                      <span className="text-[10px] font-bold text-slate-400">
                        {isBangla ? 'প্রাপক প্রিভিউ:' : 'Previewing for:'}{' '}
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {previewEmail.vars.name} (#{previewEmail.vars.memberCode})
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${previewEmail.subject}\n\n${previewEmail.body}`
                          );
                          showBanner(
                            'success',
                            isBangla ? '📋 ইমেইলের টেক্সট কপি করা হয়েছে!' : '📋 Email text copied!'
                          );
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{isBangla ? 'কপি' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {previewEmail.subject}
                    </div>
                    <pre className="text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto">
                      {previewEmail.body}
                    </pre>
                  </div>
                )
              )}
            </div>

            {/* Right: Recipient List & Send Actions (7 cols) */}
            <div className="lg:col-span-7 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {isBangla
                        ? `৩. প্রাপক সদস্য তালিকা (${formatNumber(filteredRows.length, true)} জন)`
                        : `3. Recipients (${filteredRows.length})`}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isBangla
                        ? 'যেকোনো সদস্যকে আলাদাভাবে অথবা সবাইকে এক ক্লিকে রিমাইন্ডার/রসিদ ইমেইল পাঠান'
                        : 'Send individual or bulk reminder/receipt emails'}
                    </p>
                  </div>

                  {/* Bulk Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={sendingBulk || filteredRows.length === 0}
                      onClick={() => handleBulkSend('GMAIL')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>
                        {isBangla
                          ? `সবাইকে Gmail-এ পাঠান (${formatNumber(filteredRows.length, true)})`
                          : `Bulk Gmail (${filteredRows.length})`}
                      </span>
                    </button>

                    {(emailSettings.provider === 'EMAILJS' ||
                      emailSettings.provider === 'WEBHOOK') && (
                      <button
                        type="button"
                        disabled={sendingBulk || filteredRows.length === 0}
                        onClick={() => handleBulkSend('API')}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>
                          {sendingBulk
                            ? isBangla
                              ? 'পাঠানো হচ্ছে...'
                              : 'Sending...'
                            : isBangla
                            ? '⚡ এক ক্লিকে অটো পাঠান'
                            : '⚡ Auto Send All'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Member Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] overflow-y-auto pr-1">
                  {filteredRows.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400">
                      {isBangla
                        ? 'এই ফিল্টারে কোনো সদস্য নেই'
                        : 'No members match this filter'}
                    </div>
                  ) : (
                    filteredRows.map((row) => {
                      const m = row.member;
                      const mName = isBangla && m.banglaName ? m.banglaName : m.name;
                      const hasEmail = Boolean(m.email && m.email.trim());

                      return (
                        <div
                          key={m.id}
                          onClick={() => setPreviewMemberId(m.id)}
                          className={`py-2.5 px-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer transition-colors ${
                            previewMemberId === m.id
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                                {mName}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-mono font-bold text-[10px]">
                                #{m.memberCode}
                              </span>
                              <span
                                className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                  row.status === 'PAID'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                    : row.status === 'PARTIAL'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                }`}
                              >
                                {row.status === 'PAID'
                                  ? isBangla
                                    ? `পরিশোধিত ৳${formatNumber(row.paid, true)}`
                                    : `Paid ৳${row.paid}`
                                  : isBangla
                                  ? `বকেয়া ৳${formatNumber(row.due, true)}`
                                  : `Due ৳${row.due}`}
                              </span>
                            </div>

                            {/* Email display or inline editor */}
                            <div
                              className="mt-1 flex items-center gap-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {editingEmailMemberId === m.id ? (
                                <div className="flex items-center gap-1 w-full max-w-xs">
                                  <input
                                    type="email"
                                    value={editingEmailValue}
                                    onChange={(e) => setEditingEmailValue(e.target.value)}
                                    placeholder="example@gmail.com"
                                    className="flex-1 px-2 py-1 rounded-lg border border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[11px]"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onUpdateMember) {
                                        onUpdateMember({
                                          ...m,
                                          email: editingEmailValue.trim() || undefined,
                                        });
                                      }
                                      setEditingEmailMemberId(null);
                                      showBanner(
                                        'success',
                                        isBangla
                                          ? `${mName}-এর ইমেইল ঠিকানা সেভ হয়েছে!`
                                          : `Saved email for ${mName}!`
                                      );
                                    }}
                                    className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span
                                    className={`text-[11px] font-mono ${
                                      hasEmail
                                        ? 'text-slate-600 dark:text-slate-300'
                                        : 'text-rose-500 font-semibold'
                                    }`}
                                  >
                                    {hasEmail
                                      ? `✉️ ${m.email}`
                                      : isBangla
                                      ? '⚠️ ইমেইল যুক্ত নেই'
                                      : '⚠️ No email set'}
                                  </span>
                                  {isAdmin && onUpdateMember && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingEmailMemberId(m.id);
                                        setEditingEmailValue(m.email || '');
                                      }}
                                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                      <span>
                                        {hasEmail
                                          ? isBangla
                                            ? 'পরিবর্তন'
                                            : 'Edit'
                                          : isBangla
                                          ? '+ ইমেইল যোগ করুন'
                                          : '+ Add Email'}
                                      </span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Individual Send Buttons */}
                          <div
                            className="flex items-center gap-1.5 shrink-0 flex-wrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleSendSingleEmail(row, 'API')}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold flex items-center gap-1 shadow-xs"
                              title="Brothers King অটো সার্ভার দিয়ে সাথে সাথে পাঠান"
                            >
                              <Zap className="w-3 h-3" />
                              <span>{isBangla ? '⚡ অটো পাঠান' : '⚡ Auto Send'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendSingleEmail(row, 'GMAIL')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                              title="Gmail দিয়ে ইমেইল পাঠান"
                            >
                              <Send className="w-3 h-3" />
                              <span>{isBangla ? 'Gmail পাঠান' : 'Gmail'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendSingleEmail(row, 'MAILTO')}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold"
                              title="ফোনের বা কম্পিউটারের Mail অ্যাপ দিয়ে পাঠান"
                            >
                              <span>{isBangla ? '📨 Mail অ্যাপ' : '📨 Mail App'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: EMAIL TEMPLATES STUDIO */}
      {/* ===================================================================== */}
      {subTab === 'TEMPLATES' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isBangla
                  ? '📝 ইমেইল টেমপ্লেট কাস্টমাইজেশন স্টুডিও'
                  : '📝 Customize Auto & Reminder Email Templates'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBangla
                  ? 'এখানে যেভাবে সাজিয়ে রাখবেন, পেমেন্ট পরিশোধিত বা বকেয়া রিমাইন্ডারে ঠিক সেই ভাষাতেই ইমেইল তৈরি হবে।'
                  : 'Edit the default templates used for automatic receipts and due reminders.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'DUE_REMINDER', label: isBangla ? '🔔 বকেয়া রিমাইন্ডার' : 'Due Reminder' },
                  { id: 'PAID_RECEIPT', label: isBangla ? '✅ পরিশোধিত রসিদ' : 'Paid Receipt' },
                  { id: 'PARTIAL_REMINDER', label: isBangla ? '⏳ আংশিক বকেয়া' : 'Partial' },
                  { id: 'FUND_NOTICE', label: isBangla ? '🤝 বিশেষ ফান্ড' : 'Fund Notice' },
                ] as { id: EmailTemplateType; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setEditingTplType(item.id);
                    const cfg = getEffectiveTemplate(item.id, emailSettings);
                    setTplSubBn(cfg.subjectBn);
                    setTplBodyBn(cfg.bodyBn);
                    setTplSubEn(cfg.subjectEn);
                    setTplBodyEn(cfg.bodyEn);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    editingTplType === item.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-1.5">
            <span className="font-bold">
              {isBangla ? 'ডাইনামিক ট্যাগ (স্বয়ংক্রিয়ভাবে মান বসবে):' : 'Dynamic Placeholders:'}
            </span>
            {[
              '{{name}}',
              '{{memberCode}}',
              '{{periodTitle}}',
              '{{expectedAmount}}',
              '{{paidAmount}}',
              '{{dueAmount}}',
              '{{paymentDate}}',
              '{{paymentMethod}}',
              '{{clubName}}',
            ].map((tag) => (
              <span
                key={tag}
                onClick={() => setTplBodyBn((prev) => `${prev} ${tag}`)}
                className="cursor-pointer px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold hover:bg-emerald-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                {isBangla ? 'বাংলা সাবজেক্ট (Subject)' : 'Bangla Subject'}
              </label>
              <input
                type="text"
                value={tplSubBn}
                onChange={(e) => setTplSubBn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block pt-1">
                {isBangla ? 'বাংলা ইমেইল বডি (Body)' : 'Bangla Body'}
              </label>
              <textarea
                rows={10}
                value={tplBodyBn}
                onChange={(e) => setTplBodyBn(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">
                {isBangla ? 'ইংরেজি সাবজেক্ট (English Subject)' : 'English Subject'}
              </label>
              <input
                type="text"
                value={tplSubEn}
                onChange={(e) => setTplSubEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block pt-1">
                {isBangla ? 'ইংরেজি ইমেইল বডি (English Body)' : 'English Body'}
              </label>
              <textarea
                rows={10}
                value={tplBodyEn}
                onChange={(e) => setTplBodyEn(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                const base = DEFAULT_EMAIL_TEMPLATES[editingTplType];
                setTplSubBn(base.subjectBn);
                setTplBodyBn(base.bodyBn);
                setTplSubEn(base.subjectEn);
                setTplBodyEn(base.bodyEn);
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              {isBangla ? 'ডিফল্টে রিসেট করুন' : 'Reset Default'}
            </button>
            <button
              type="button"
              onClick={() => {
                const updatedSettings: EmailSettings = {
                  ...emailSettings,
                  customTemplates: {
                    ...(emailSettings.customTemplates || {}),
                    [editingTplType]: {
                      subjectBn: tplSubBn,
                      bodyBn: tplBodyBn,
                      subjectEn: tplSubEn,
                      bodyEn: tplBodyEn,
                    },
                  },
                };
                setEmailSettings(updatedSettings);
                saveEmailSettings(updatedSettings);
                showBanner(
                  'success',
                  isBangla
                    ? '✓ ইমেইল টেমপ্লেট সফলভাবে সেভ করা হয়েছে!'
                    : '✓ Email template saved!'
                );
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm"
            >
              {isBangla ? '✓ টেমপ্লেট সেভ করুন' : '✓ Save Template'}
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 3: AUTO-EMAIL SYSTEM & API SETTINGS */}
      {/* ===================================================================== */}
      {subTab === 'SETTINGS' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isBangla
                  ? '⚙️ Brothers Badminton (Brothers King) — অটো ইমেইল ও ডোমেইন সেটিংস'
                  : '⚙️ Brothers Badminton (Brothers King) — Auto-Email & Domain Configuration'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBangla
                  ? 'ম্যানুয়াল পাঠানোর পাশাপাশি ১০০% স্বয়ংক্রিয়ভাবে ব্যাকগ্রাউন্ডে ইমেইল প্রেরণ এবং প্রেরকের ডোমেইন/নাম এখানে নিয়ন্ত্রণ করুন।'
                  : 'Configure 100% automatic background email delivery and Brothers King sender identity.'}
              </p>
            </div>
          </div>

          {/* Automatic Trigger Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailSettings.autoSendOnPaid}
                onChange={(e) =>
                  setEmailSettings({ ...emailSettings, autoSendOnPaid: e.target.checked })
                }
                className="mt-1 w-4 h-4 text-emerald-600 rounded"
              />
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  {isBangla
                    ? '✅ পেমেন্ট পরিশোধিত (PAID) করার সাথে সাথে অটো রসিদ ইমেইল পাঠান'
                    : '✅ Auto-Send Receipt Email immediately when marked PAID'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBangla
                    ? 'সদস্যের পেমেন্ট পরিশোধিত মার্ক করলেই স্বয়ংক্রিয়ভাবে তার ইমেইলে ডিজিটাল রসিদ চলে যাবে।'
                    : 'Automatically dispatches digital receipt email whenever a payment is marked PAID.'}
                </span>
              </div>
            </label>

            <label className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailSettings.autoSendOnPartial ?? true}
                onChange={(e) =>
                  setEmailSettings({ ...emailSettings, autoSendOnPartial: e.target.checked })
                }
                className="mt-1 w-4 h-4 text-amber-600 rounded"
              />
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  {isBangla
                    ? '⏳ আংশিক পেমেন্ট (PARTIAL) সেভ করলে স্বয়ংক্রিয়ভাবে অবশিষ্ট বকেয়ার রিমাইন্ডার পাঠান'
                    : '⏳ Auto-Send Balance Reminder on Partial Payment'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBangla
                    ? 'আংশিক টাকা জমা নিলে কত টাকা জমা হলো এবং কত টাকা বাকি আছে তা অটো ইমেইলে চলে যাবে।'
                    : 'Automatically sends partial receipt + remaining due reminder.'}
                </span>
              </div>
            </label>

            <label className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailSettings.autoRemindUnpaid ?? false}
                onChange={(e) =>
                  setEmailSettings({ ...emailSettings, autoRemindUnpaid: e.target.checked })
                }
                className="mt-1 w-4 h-4 text-rose-600 rounded"
              />
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  {isBangla
                    ? '🔔 বকেয়া (UNPAID) মার্ক করলে স্বয়ংক্রিয়ভাবে বকেয়া রিমাইন্ডার ইমেইল পাঠান'
                    : '🔔 Auto-Send Due Reminder when marked UNPAID'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBangla
                    ? 'চালু থাকলে বকেয়া হিসেবে চিহ্নিত করলেই সদস্যের ইমেইলে অটো রিমাইন্ডার চলে যাবে।'
                    : 'Automatically sends due reminder email when marked UNPAID.'}
                </span>
              </div>
            </label>

            <label className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailSettings.autoOpenGmailOnPaid}
                onChange={(e) =>
                  setEmailSettings({ ...emailSettings, autoOpenGmailOnPaid: e.target.checked })
                }
                className="mt-1 w-4 h-4 text-sky-600 rounded"
              />
              <div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  {isBangla
                    ? '📧 ব্যাকগ্রাউন্ড সার্ভার না থাকলে অটো Gmail প্রি-ফিলড উইন্ডো ওপেন করুন'
                    : '📧 Auto-open Gmail Compose window if API is not connected'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isBangla
                    ? 'যদি নিচে অটো সার্ভার কানেক্ট করা না থাকে, তবে পেমেন্ট সেভ করার সাথে সাথে Gmail ওপেন হবে।'
                    : 'Fallback to ready-to-send Gmail window when marking PAID.'}
                </span>
              </div>
            </label>
          </div>

          {/* Brothers Badminton / Brothers King Domain & Sender Info */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              {isBangla
                ? '👑 Brothers Badminton • brothersking.cyou ডোমেইন ও প্রেরক পরিচয় (Active Domain Setup)'
                : '👑 Brothers Badminton • brothersking.cyou Sender & Domain Identity'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla
                    ? 'প্রেরকের নাম (From Name — ইমেইলের ইনবক্সে যে নাম দেখাবে)'
                    : 'Sender Display Name (From Name)'}
                </label>
                <input
                  type="text"
                  placeholder="Brothers Badminton (Brothers King)"
                  value={emailSettings.senderName}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, senderName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla
                    ? 'ইমেইল হেডার / ব্র্যান্ড টাইটেল (Brand Title)'
                    : 'Email Header Brand Title'}
                </label>
                <input
                  type="text"
                  placeholder="Brothers Badminton • brothersking.cyou"
                  value={emailSettings.senderBrandName || 'Brothers Badminton • brothersking.cyou'}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, senderBrandName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla
                    ? 'প্রেরকের ডোমেইন ইমেইল (From Domain Email — brothersking.cyou)'
                    : 'Sender Domain Email (brothersking.cyou)'}
                </label>
                <input
                  type="email"
                  placeholder="noreply@brothersking.cyou"
                  value={emailSettings.fromDomainEmail || 'noreply@brothersking.cyou'}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, fromDomainEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'ক্লাবের রিপ্লাই ইমেইল (Reply-To Email)' : 'Club Reply-To Email'}
                </label>
                <input
                  type="email"
                  placeholder="info@brothersking.cyou"
                  value={emailSettings.replyToEmail}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, replyToEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla
                    ? 'বকেয়া রিমাইন্ডারে প্রদর্শিত বিকাশ / নগদ পেমেন্ট নম্বরসমূহ'
                    : 'bKash / Nagad Payment Numbers shown in Due Reminders'}
                </label>
                <input
                  type="text"
                  value={emailSettings.paymentNumbersInfo}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, paymentNumbersInfo: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Delivery Mode Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
              {isBangla
                ? '🚀 অটোমেটিক ইমেইল প্রেরণ সার্ভার নির্বাচন করুন (brothersking.cyou Auto Engine):'
                : '🚀 Select Automatic Email Delivery Engine (brothersking.cyou):'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                {
                  id: 'CUSTOM_DOMAIN' as const,
                  title: isBangla
                    ? '🌐 brothersking.cyou অটো ডোমেইন'
                    : '🌐 brothersking.cyou Auto Domain',
                  desc: isBangla
                    ? 'সরাসরি noreply@brothersking.cyou ডোমেইন থেকে প্রেরণ'
                    : 'Send directly from noreply@brothersking.cyou',
                },
                {
                  id: 'WEBHOOK' as const,
                  title: isBangla
                    ? '⚡ ফ্রি ১০০% অটো সার্ভার (Google Script)'
                    : '⚡ Free 100% Auto (Google Script)',
                  desc: isBangla
                    ? 'Brothers Badminton (brothersking.cyou) নামে ফ্রি অটো মেইল'
                    : 'Sends automatic HTML emails with brothersking.cyou branding',
                },
                {
                  id: 'EMAILJS' as const,
                  title: isBangla ? '🚀 EmailJS অটো সার্ভার' : '🚀 EmailJS Auto API',
                  desc: isBangla
                    ? 'EmailJS দিয়ে ব্যাকগ্রাউন্ডে স্বয়ংক্রিয় ইমেইল প্রেরণ'
                    : '100% silent background email delivery via EmailJS',
                },
                {
                  id: 'GMAIL_DIRECT' as const,
                  title: isBangla ? '📧 ম্যানুয়াল Gmail / Mail App' : '📧 Manual Gmail / Mail App',
                  desc: isBangla
                    ? 'ক্লিক করলে প্রি-ফিলড Gmail ওপেন হবে'
                    : 'Opens pre-filled Gmail tab without background API',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setEmailSettings({ ...emailSettings, provider: m.id })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    emailSettings.provider === m.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {m.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>

            {emailSettings.provider === 'WEBHOOK' && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/70 border border-emerald-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {isBangla
                        ? '⚡ Google Apps Script Web App URL (১০০% ফ্রি অটোমেটিক ইমেইল সার্ভার)'
                        : '⚡ Google Apps Script Web App URL (100% Free Auto Mailer)'}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isBangla
                        ? 'নিচের বাটনে ক্লিক করে রেডিমেড স্ক্রিপ্টটি কপি করুন -> script.google.com-এ গিয়ে পেস্ট করে Deploy -> Web App করুন এবং প্রাপ্ত URL-টি নিচে বসান। এরপর পেমেন্ট PAID করলেই স্বয়ংক্রিয়ভাবে "Brothers Badminton (brothersking.cyou)" নামে ইমেইল চলে যাবে!'
                        : 'Copy the ready script below, deploy as Web App on script.google.com, and paste the URL here for 100% automatic emails.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_AUTO_MAILER_CODE);
                      showBanner(
                        'success',
                        isBangla
                          ? '📋 অটো-ইমেইল সার্ভার কোড কপি হয়েছে! এখন script.google.com-এ পেস্ট করে Deploy করুন।'
                          : '📋 Google Apps Script code copied to clipboard!'
                      );
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>
                      {isBangla ? '📋 ফ্রি অটো-মেইলার কোড কপি করুন' : '📋 Copy Auto-Mailer Code'}
                    </span>
                  </button>
                </div>

                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/....../exec"
                  value={emailSettings.webhookUrl || ''}
                  onChange={(e) =>
                    setEmailSettings({ ...emailSettings, webhookUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            )}

            {emailSettings.provider === 'CUSTOM_DOMAIN' && (
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800/70 border border-amber-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {isBangla
                        ? '🌐 brothersking.cyou অটো ডোমেইন কানেকশন (Brevo / Resend / Cloudflare Worker)'
                        : '🌐 brothersking.cyou Custom Domain Connection'}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {isBangla
                        ? 'আপনার ডোমেইন "brothersking.cyou" ইতিমধ্যে অ্যাপে সেটআপ করা হয়েছে (noreply@brothersking.cyou)। সরাসরি এই ডোমেইন থেকে অটো ইমেইল পাঠাতে নিচে আপনার Brevo/Resend API Key বসান অথবা Cloudflare Worker কোড কপি করে আপনার ডোমেইনে যুক্ত করুন।'
                        : 'Your domain brothersking.cyou is configured. Paste your Brevo/Resend API key or Cloudflare Worker URL below.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(CLOUDFLARE_WORKER_BROTHERSKING_CODE);
                      showBanner(
                        'success',
                        isBangla
                          ? '📋 brothersking.cyou-এর Cloudflare Worker কোড কপি হয়েছে!'
                          : '📋 Cloudflare Worker code for brothersking.cyou copied!'
                      );
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>
                      {isBangla
                        ? '📋 brothersking.cyou Worker কোড কপি'
                        : '📋 Copy Cloudflare Worker'}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla
                        ? 'Brevo বা Resend API Key (brothersking.cyou ভেরিফাইড)'
                        : 'Brevo (xkeysib-...) or Resend (re_...) API Key'}
                    </label>
                    <input
                      type="password"
                      placeholder="xkeysib-xxxxxx বা re_xxxxxx"
                      value={emailSettings.brevoApiKey || ''}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, brevoApiKey: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isBangla
                        ? 'অথবা ডোমেইন মেইল সার্ভার URL (Cloudflare / Script URL)'
                        : 'Or Domain Mail Worker URL'}
                    </label>
                    <input
                      type="url"
                      placeholder="https://mail.brothersking.cyou"
                      value={emailSettings.webhookUrl || 'https://mail.brothersking.cyou'}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, webhookUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {emailSettings.provider === 'EMAILJS' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    EmailJS Service ID
                  </label>
                  <input
                    type="text"
                    placeholder="service_xxxxxx"
                    value={emailSettings.emailJsServiceId || ''}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, emailJsServiceId: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    EmailJS Template ID
                  </label>
                  <input
                    type="text"
                    placeholder="template_xxxxxx"
                    value={emailSettings.emailJsTemplateId || ''}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, emailJsTemplateId: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    EmailJS Public Key
                  </label>
                  <input
                    type="text"
                    placeholder="public_key_xxxxxx"
                    value={emailSettings.emailJsPublicKey || ''}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, emailJsPublicKey: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="email"
                placeholder="টেস্ট ইমেইল প্রাপক (যেমন nabilkhane15@gmail.com)"
                value={testRecipientEmail}
                onChange={(e) => setTestRecipientEmail(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white min-w-[230px]"
              />
              <button
                type="button"
                onClick={async () => {
                  saveEmailSettings(emailSettings);
                  const testTo = testRecipientEmail.trim() || 'nabilkhane15@gmail.com';
                  const res = await sendEmailViaConfiguredApi(emailSettings, {
                    toEmail: testTo,
                    toName: 'Brothers King Admin',
                    subject: '✅ টেস্ট অটো ইমেইল — Brothers Badminton (brothersking.cyou)',
                    body: `আসসালামু আলাইকুম!\n\nএটি Brothers Badminton (brothersking.cyou)-এর Resend অটো ইমেইল সিস্টেম থেকে পাঠানো একটি পরীক্ষামূলক (Test) ইমেইল।\n\nপ্রেরক: ${emailSettings.senderName}\nডোমেইন: ${emailSettings.fromDomainEmail || 'noreply@brothersking.cyou'}`,
                    memberCode: 'ADMIN',
                    periodTitle: 'Test Period',
                    amount: 350,
                    isPaidReceipt: true,
                  });
                  if (res.ok) {
                    showBanner(
                      'success',
                      isBangla
                        ? `🎉 সফলভাবে ${testTo}-এ Resend (brothersking.cyou) থেকে অটোমেটিক টেস্ট ইমেইল পাঠানো হয়েছে!`
                        : `🎉 Test automatic email sent to ${testTo} via Resend!`
                    );
                  } else {
                    showBanner(
                      'error',
                      isBangla
                        ? `⚠️ ইমেইল পাঠাতে সমস্যা হয়েছে: ${res.error}`
                        : `⚠️ Failed to send test email: ${res.error}`
                    );
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {isBangla ? '🧪 টেস্ট অটো ইমেইল পাঠিয়ে চেক করুন' : '🧪 Send Test Auto Email'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                saveEmailSettings(emailSettings);
                showBanner(
                  'success',
                  isBangla
                    ? '✓ Brothers Badminton (brothersking.cyou) ও Resend API সেটিংস সফলভাবে সংরক্ষিত হয়েছে!'
                    : '✓ Auto-email settings saved!'
                );
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md"
            >
              {isBangla ? '✓ সেটিংস সেভ করুন' : '✓ Save Email Settings'}
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 4: SENT EMAIL LOGS / OUTBOX */}
      {/* ===================================================================== */}
      {subTab === 'HISTORY' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isBangla
                  ? '📜 পাঠানো ও অটো-জেনারেটেড ইমেইল লগ'
                  : '📜 Sent & Auto-Generated Email History'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBangla
                  ? 'কোন সদস্যকে কখন রসিদ বা বকেয়া রিমাইন্ডার ইমেইল পাঠানো হয়েছে তার সম্পূর্ণ হিসাব'
                  : 'Complete audit log of all payment receipts and due reminder emails'}
              </p>
            </div>
            {emailLogs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setEmailLogs([]);
                  saveEmailLogs([]);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 border border-rose-200 dark:border-rose-900 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBangla ? 'লগ পরিষ্কার করুন' : 'Clear Logs'}</span>
              </button>
            )}
          </div>

          {emailLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {isBangla ? 'এখনো কোনো ইমেইল লগ তৈরি হয়নি' : 'No emails logged yet'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[480px] overflow-y-auto">
              {emailLogs.map((log) => (
                <div
                  key={log.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {log.memberName} (#{log.memberCode})
                      </span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        {log.recipientEmail}
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          log.templateType === 'PAID_RECEIPT'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {log.templateType === 'PAID_RECEIPT'
                          ? isBangla
                            ? '✅ পরিশোধিত রসিদ'
                            : 'Paid Receipt'
                          : isBangla
                          ? '🔔 বকেয়া রিমাইন্ডার'
                          : 'Due Reminder'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {log.subject}
                    </p>
                    <span className="text-[10px] text-slate-400 block">{log.timestamp}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openGmailCompose(log.recipientEmail, log.subject, log.body)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 self-start sm:self-center transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isBangla ? 'পুনরায় পাঠান' : 'Resend'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
