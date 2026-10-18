import React, { useState, useMemo } from 'react';
import {
  CustomFund,
  FundContribution,
  FundExpense,
  Member,
  PaymentStatus,
  FundCategory,
} from '../types';
import { Language, translations, formatCurrency, formatNumber, formatDate } from '../utils/language';
import {
  HeartHandshake,
  PlusCircle,
  Building2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  UserPlus,
  Filter,
} from 'lucide-react';

interface Props {
  funds: CustomFund[];
  contributions: FundContribution[];
  expenses: FundExpense[];
  members: Member[];
  isAdmin: boolean;
  lang: Language;
  onSaveFunds: (funds: CustomFund[]) => void;
  onSaveContributions: (contributions: FundContribution[]) => void;
  onSaveExpenses: (expenses: FundExpense[]) => void;
  onOpenPinModal: () => void;
}

export const FundsView: React.FC<Props> = ({
  funds,
  contributions,
  expenses,
  members,
  isAdmin,
  lang,
  onSaveFunds,
  onSaveContributions,
  onSaveExpenses,
  onOpenPinModal,
}) => {
  const t = translations[lang];
  const isBangla = lang === 'bn';

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedFundId, setExpandedFundId] = useState<string | null>(funds[0]?.id || null);

  // Modals
  const [isCreateFundOpen, setIsCreateFundOpen] = useState(false);
  const [isCollectPaymentOpen, setIsCollectPaymentOpen] = useState(false);
  const [isDisburseOpen, setIsDisburseOpen] = useState(false);
  const [isEnrollMemberOpen, setIsEnrollMemberOpen] = useState(false);

  // Target Fund for actions
  const [activeFundForAction, setActiveFundForAction] = useState<CustomFund | null>(null);
  const [targetMemberForPay, setTargetMemberForPay] = useState<Member | null>(null);

  // Form states - Create Fund
  const [newFundTitle, setNewFundTitle] = useState('');
  const [newFundTitleBangla, setNewFundTitleBangla] = useState('');
  const [newFundCategory, setNewFundCategory] = useState<FundCategory>('Welfare');
  const [newFundTarget, setNewFundTarget] = useState<number | ''>(10000);
  const [newFundDefaultAmount, setNewFundDefaultAmount] = useState<number | ''>(500);
  const [newFundIcon, setNewFundIcon] = useState('🤝');
  const [newFundDesc, setNewFundDesc] = useState('');
  const [autoEnrollGroup, setAutoEnrollGroup] = useState<'all' | 'youth' | 'none'>('youth');

  // Form states - Collect Payment
  const [payMemberId, setPayMemberId] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<'bKash' | 'Nagad' | 'Cash' | 'Bank'>('bKash');
  const [payNotes, setPayNotes] = useState('');

  // Form states - Disburse
  const [disburseTitle, setDisburseTitle] = useState('');
  const [disburseAmount, setDisburseAmount] = useState<number | ''>('');
  const [disburseRecipient, setDisburseRecipient] = useState('');
  const [disburseNotes, setDisburseNotes] = useState('');

  // Form states - Enroll
  const [enrollMemberId, setEnrollMemberId] = useState('');
  const [enrollExpectedAmount, setEnrollExpectedAmount] = useState<number | ''>(500);

  // Filtered funds
  const filteredFunds = useMemo(() => {
    return funds.filter((f) => {
      const matchSearch =
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.titleBangla && f.titleBangla.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = selectedCategory === 'ALL' || f.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [funds, searchTerm, selectedCategory]);

  // Global calculations
  const globalStats = useMemo(() => {
    let totalRaised = 0;
    let totalDisbursed = 0;

    contributions.forEach((c) => {
      totalRaised += c.paidAmount;
    });

    expenses.forEach((e) => {
      totalDisbursed += e.amount;
    });

    const netVaultBalance = totalRaised - totalDisbursed;

    return {
      totalRaised,
      totalDisbursed,
      netVaultBalance,
      activeFundsCount: funds.filter((f) => f.status === 'ACTIVE').length,
    };
  }, [funds, contributions, expenses]);

  // Demographics stats
  const memberDemographics = useMemo(() => {
    let children = 0;
    let teens = 0;
    let youths = 0;
    let sportsOnly = 0;
    let fundsOnly = 0;
    let both = 0;

    members.forEach((m) => {
      if (m.memberCategory === 'child') children++;
      else if (m.memberCategory === 'teen') teens++;
      else youths++;

      const isSports = m.participatesInSports !== false;
      const isInAnyFund = contributions.some((c) => c.memberId === m.id);

      if (isSports && !isInAnyFund) sportsOnly++;
      else if (!isSports && isInAnyFund) fundsOnly++;
      else both++;
    });

    return { children, teens, youths, sportsOnly, fundsOnly, both };
  }, [members, contributions]);

  // Helper calculation for individual fund
  const getFundMetrics = (fundId: string) => {
    const fundConts = contributions.filter((c) => c.fundId === fundId);
    const fundExps = expenses.filter((e) => e.fundId === fundId);

    const totalCollected = fundConts.reduce((acc, c) => acc + c.paidAmount, 0);
    const totalExpected = fundConts.reduce((acc, c) => acc + c.expectedAmount, 0);
    const totalDisbursed = fundExps.reduce((acc, e) => acc + e.amount, 0);
    const balance = totalCollected - totalDisbursed;

    const paidCount = fundConts.filter((c) => c.status === 'PAID').length;
    const partialCount = fundConts.filter((c) => c.status === 'PARTIAL').length;
    const unpaidCount = fundConts.filter((c) => c.status === 'UNPAID').length;

    return {
      totalCollected,
      totalExpected,
      totalDisbursed,
      balance,
      enrolledCount: fundConts.length,
      paidCount,
      partialCount,
      unpaidCount,
    };
  };

  // Actions
  const handleOpenCreateFund = () => {
    if (!isAdmin) {
      onOpenPinModal();
      return;
    }
    setNewFundTitle('');
    setNewFundTitleBangla('');
    setNewFundCategory('Welfare');
    setNewFundTarget(10000);
    setNewFundDefaultAmount(500);
    setNewFundIcon('🤝');
    setNewFundDesc('');
    setAutoEnrollGroup('youth');
    setIsCreateFundOpen(true);
  };

  const handleSaveNewFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFundTitle.trim()) return;

    const fundId = `fund-${Date.now()}`;
    const targetAmt = Number(newFundTarget) || 0;
    const defaultAmt = Number(newFundDefaultAmount) || 0;

    const newFund: CustomFund = {
      id: fundId,
      title: newFundTitle.trim(),
      titleBangla: newFundTitleBangla.trim() || newFundTitle.trim(),
      category: newFundCategory,
      description: newFundDesc.trim(),
      targetAmount: targetAmt,
      defaultTargetPerMember: defaultAmt,
      status: 'ACTIVE',
      createdDate: formatDate(),
      icon: newFundIcon || '🤝',
    };

    // Auto-enroll members if selected
    const newContribs: FundContribution[] = [];
    if (autoEnrollGroup !== 'none') {
      members.forEach((m) => {
        let shouldEnroll = false;
        if (autoEnrollGroup === 'all') shouldEnroll = true;
        if (autoEnrollGroup === 'youth' && m.memberCategory === 'youth') shouldEnroll = true;

        if (shouldEnroll) {
          newContribs.push({
            id: `fc-${Date.now()}-${m.id}`,
            fundId,
            memberId: m.id,
            expectedAmount: defaultAmt,
            paidAmount: 0,
            status: 'UNPAID',
            date: '',
            paymentMethod: 'Cash',
            notes: 'Auto-enrolled',
          });
        }
      });
    }

    onSaveFunds([newFund, ...funds]);
    if (newContribs.length > 0) {
      onSaveContributions([...contributions, ...newContribs]);
    }

    setExpandedFundId(fundId);
    setIsCreateFundOpen(false);
  };

  const handleDeleteFund = (fundId: string) => {
    if (!isAdmin) {
      onOpenPinModal();
      return;
    }
    const fund = funds.find((f) => f.id === fundId);
    if (!fund) return;

    const confirmMsg = isBangla
      ? `আপনি কি নিশ্চিতভাবে "${fund.titleBangla || fund.title}" ফান্ডটি মুছে ফেলতে চান?`
      : `Are you sure you want to delete the fund "${fund.title}"?`;

    if (window.confirm(confirmMsg)) {
      onSaveFunds(funds.filter((f) => f.id !== fundId));
      onSaveContributions(contributions.filter((c) => c.fundId !== fundId));
      onSaveExpenses(expenses.filter((e) => e.fundId !== fundId));
    }
  };

  const handleOpenCollectPayment = (fund: CustomFund, member?: Member) => {
    setActiveFundForAction(fund);
    if (member) {
      setTargetMemberForPay(member);
      setPayMemberId(member.id);
      const existing = contributions.find((c) => c.fundId === fund.id && c.memberId === member.id);
      const due = existing ? Math.max(0, existing.expectedAmount - existing.paidAmount) : fund.defaultTargetPerMember || 500;
      setPayAmount(due || fund.defaultTargetPerMember || 500);
    } else {
      setTargetMemberForPay(null);
      setPayMemberId('');
      setPayAmount(fund.defaultTargetPerMember || 500);
    }
    setPayMethod('bKash');
    setPayNotes('');
    setIsCollectPaymentOpen(true);
  };

  const handleSaveCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFundForAction || !payMemberId || payAmount === '' || Number(payAmount) <= 0) return;

    const amount = Number(payAmount);
    const existingIndex = contributions.findIndex(
      (c) => c.fundId === activeFundForAction.id && c.memberId === payMemberId
    );

    let updatedContribs = [...contributions];
    if (existingIndex >= 0) {
      const existing = updatedContribs[existingIndex];
      const newPaid = existing.paidAmount + amount;
      const newStatus: PaymentStatus =
        newPaid >= existing.expectedAmount ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'UNPAID';

      updatedContribs[existingIndex] = {
        ...existing,
        paidAmount: newPaid,
        status: newStatus,
        date: formatDate(),
        paymentMethod: payMethod,
        notes: payNotes.trim() || existing.notes,
      };
    } else {
      // New contribution record
      const expected = activeFundForAction.defaultTargetPerMember || amount;
      const status: PaymentStatus = amount >= expected ? 'PAID' : 'PARTIAL';
      updatedContribs.push({
        id: `fc-${Date.now()}-${payMemberId}`,
        fundId: activeFundForAction.id,
        memberId: payMemberId,
        expectedAmount: expected,
        paidAmount: amount,
        status,
        date: formatDate(),
        paymentMethod: payMethod,
        notes: payNotes.trim(),
      });
    }

    onSaveContributions(updatedContribs);
    setIsCollectPaymentOpen(false);
  };

  const handleOpenDisburse = (fund: CustomFund) => {
    if (!isAdmin) {
      onOpenPinModal();
      return;
    }
    setActiveFundForAction(fund);
    setDisburseTitle('');
    setDisburseAmount('');
    setDisburseRecipient('');
    setDisburseNotes('');
    setIsDisburseOpen(true);
  };

  const handleSaveDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFundForAction || !disburseTitle.trim() || disburseAmount === '' || Number(disburseAmount) <= 0) return;

    const newExp: FundExpense = {
      id: `fe-${Date.now()}`,
      fundId: activeFundForAction.id,
      date: formatDate(),
      title: disburseTitle.trim(),
      amount: Number(disburseAmount),
      disbursedTo: disburseRecipient.trim(),
      notes: disburseNotes.trim(),
    };

    onSaveExpenses([newExp, ...expenses]);
    setIsDisburseOpen(false);
  };

  const handleOpenEnrollMember = (fund: CustomFund) => {
    setActiveFundForAction(fund);
    setEnrollMemberId('');
    setEnrollExpectedAmount(fund.defaultTargetPerMember || 500);
    setIsEnrollMemberOpen(true);
  };

  const handleSaveEnrollMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFundForAction || !enrollMemberId) return;

    const alreadyEnrolled = contributions.some(
      (c) => c.fundId === activeFundForAction.id && c.memberId === enrollMemberId
    );

    if (alreadyEnrolled) {
      alert(isBangla ? 'সদস্যটি ইতিমধ্যেই এই ফান্ডে যুক্ত আছেন!' : 'Member is already enrolled in this fund!');
      return;
    }

    const expAmt = Number(enrollExpectedAmount) || 0;
    const newContrib: FundContribution = {
      id: `fc-${Date.now()}-${enrollMemberId}`,
      fundId: activeFundForAction.id,
      memberId: enrollMemberId,
      expectedAmount: expAmt,
      paidAmount: 0,
      status: 'UNPAID',
      date: '',
      paymentMethod: 'Cash',
      notes: 'Manually enrolled',
    };

    onSaveContributions([...contributions, newContrib]);
    setIsEnrollMemberOpen(false);
  };

  const handleRemoveMemberFromFund = (fundId: string, memberId: string) => {
    if (!isAdmin) {
      onOpenPinModal();
      return;
    }
    const member = members.find((m) => m.id === memberId);
    const confirmMsg = isBangla
      ? `আপনি কি "${member?.name}" কে এই ফান্ড থেকে অপসারণ করতে চান?`
      : `Remove "${member?.name}" from this fund?`;
    if (window.confirm(confirmMsg)) {
      onSaveContributions(
        contributions.filter((c) => !(c.fundId === fundId && c.memberId === memberId))
      );
    }
  };

  const handleSendReminder = (fund: CustomFund, member: Member, due: number) => {
    const text = isBangla
      ? `আসসালামু আলাইকুম ${member.banglaName || member.name}, ক্লাবের "${fund.titleBangla || fund.title}" ফান্ডে আপনার বকেয়া ৳${due} টাকা। অনুগ্রহ করে দ্রুত পরিশোধ করার অনুরোধ রইল। ধন্যবাদ!`
      : `Assalamu Alaikum ${member.name}, you have a pending contribution of ৳${due} for "${fund.title}". Please clear when possible. Thank you!`;
    const cleanPhone = member.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2 border border-teal-500/30">
                <HeartHandshake className="w-3.5 h-3.5" />
                {isBangla ? 'স্মার্ট অল-কন্ট্রোল ও যেকোনো ফান্ড' : 'Custom & General Welfare Funds'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t.funds_title}
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                {t.funds_subtitle}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenCreateFund}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 shrink-0"
              >
                <PlusCircle className="w-5 h-5" />
                {t.create_fund}
              </button>
            )}
          </div>

          {/* Global Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-xs text-slate-300 font-medium block">
                {isBangla ? 'সক্রিয় ফান্ড' : 'Active Funds'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                {formatNumber(globalStats.activeFundsCount, isBangla)}
              </span>
            </div>

            <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/30">
              <span className="text-xs text-emerald-200 font-medium block">
                {isBangla ? 'মোট উত্তোলিত' : 'Total Raised'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-300 mt-1 block">
                {formatCurrency(globalStats.totalRaised, isBangla)}
              </span>
            </div>

            <div className="bg-rose-500/20 backdrop-blur-md rounded-2xl p-4 border border-rose-500/30">
              <span className="text-xs text-rose-200 font-medium block">
                {isBangla ? 'মোট খরচ / বিতরণ' : 'Total Disbursed'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-300 mt-1 block">
                {formatCurrency(globalStats.totalDisbursed, isBangla)}
              </span>
            </div>

            <div className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-4 border border-amber-500/30">
              <span className="text-xs text-amber-200 font-medium block">
                {isBangla ? 'হাতে নিট ফান্ড ব্যালেন্স' : 'Net Fund Vault'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 mt-1 block">
                {formatCurrency(globalStats.netVaultBalance, isBangla)}
              </span>
            </div>
          </div>

          {/* Demographics & All-Control Strip */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-300 mr-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-teal-400" />
              {isBangla ? 'সদস্য ধরণ ও পার্টিসিপেশন:' : 'Demographics & Participation:'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold">
              🧒 {isBangla ? 'বাচ্চা' : 'Children'}: {formatNumber(memberDemographics.children, isBangla)}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 font-semibold">
              🧑‍🦱 {isBangla ? 'কিশোর' : 'Teens'}: {formatNumber(memberDemographics.teens, isBangla)}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
              👨‍🦱 {isBangla ? 'যুবক' : 'Youths'}: {formatNumber(memberDemographics.youths, isBangla)}
            </span>
            <span className="text-slate-400 mx-1">|</span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-semibold">
              🏸 {isBangla ? 'শুধু খেলা' : 'Sports Only'}: {formatNumber(memberDemographics.sportsOnly, isBangla)}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 font-semibold">
              🏛️ {isBangla ? 'শুধু ফান্ডিং (পৃষ্ঠপোষক)' : 'Funding Only'}: {formatNumber(memberDemographics.fundsOnly, isBangla)}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 font-semibold">
              🌟 {isBangla ? 'উভয়টি' : 'Both'}: {formatNumber(memberDemographics.both, isBangla)}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar: Category Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isBangla ? 'ফান্ড খুঁজুন (চিকিৎসা, সংস্কার, ঈদ...)' : 'Search funds...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'ALL', label: isBangla ? 'সকল ফান্ড' : 'All' },
            { id: 'Emergency', label: isBangla ? '🏥 জরুরি চিকিৎসা' : '🏥 Emergency' },
            { id: 'Infrastructure', label: isBangla ? '🏢 ক্লাব সংস্কার' : '🏢 Development' },
            { id: 'Religious', label: isBangla ? '🌙 ঈদ ও রমজান' : '🌙 Religious' },
            { id: 'Welfare', label: isBangla ? '🤝 জনকল্যাণ' : '🤝 Welfare' },
            { id: 'Social', label: isBangla ? '🎉 সামাজিক' : '🎉 Social' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Funds List */}
      <div className="space-y-4">
        {filteredFunds.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <HeartHandshake className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {isBangla ? 'কোনো ফান্ড পাওয়া যায়নি' : 'No Funds Found'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBangla
                ? 'নতুন যেকোনো কল্যাণ বা বিশেষ ফান্ড তৈরি করতে উপরের বোতামে ক্লিক করুন'
                : 'Click create fund to start tracking multi-purpose projects'}
            </p>
          </div>
        ) : (
          filteredFunds.map((fund) => {
            const metrics = getFundMetrics(fund.id);
            const isExpanded = expandedFundId === fund.id;
            const fundContribs = contributions.filter((c) => c.fundId === fund.id);
            const fundExps = expenses.filter((e) => e.fundId === fund.id);
            const percentRaised = fund.targetAmount > 0
              ? Math.min(100, Math.round((metrics.totalCollected / fund.targetAmount) * 100))
              : 100;

            return (
              <div
                key={fund.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
              >
                {/* Fund Header Card */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Title & Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-2xl border border-indigo-200 dark:border-indigo-800 shrink-0">
                        {fund.icon || '🤝'}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                            {isBangla && fund.titleBangla ? fund.titleBangla : fund.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {fund.category}
                          </span>
                          {fund.status === 'ACTIVE' ? (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                              {isBangla ? 'সক্রিয়' : 'Active'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500">
                              {isBangla ? 'সম্পন্ন' : 'Closed'}
                            </span>
                          )}
                        </div>
                        {fund.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                            {fund.description}
                          </p>
                        )}
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          {isBangla ? 'শুরুর তারিখ: ' : 'Created: '}
                          {fund.createdDate} • {isBangla ? 'টার্গেট/সদস্য: ' : 'Target/Member: '}
                          {formatCurrency(fund.defaultTargetPerMember || 0, isBangla)}
                        </span>
                      </div>
                    </div>

                    {/* Balance & Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-right">
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                          {isBangla ? 'হাতে ব্যালেন্স' : 'Net Balance'}
                        </span>
                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                          {formatCurrency(metrics.balance, isBangla)}
                        </span>
                      </div>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenCollectPayment(fund)}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <DollarSign className="w-4 h-4" />
                            {isBangla ? 'টাকা জমা নিন' : 'Collect'}
                          </button>

                          <button
                            onClick={() => handleOpenDisburse(fund)}
                            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            {isBangla ? 'বিতরণ / খরচ' : 'Disburse'}
                          </button>

                          <button
                            onClick={() => handleOpenEnrollMember(fund)}
                            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <UserPlus className="w-4 h-4" />
                            {isBangla ? 'সদস্য যুক্ত' : 'Enroll'}
                          </button>

                          <button
                            onClick={() => handleDeleteFund(fund.id)}
                            title={isBangla ? 'ফান্ড মুছুন' : 'Delete Fund'}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Financial Progress & Metrics Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-xs">
                      <div>
                        <span className="text-slate-400">{isBangla ? 'লক্ষ্যমাত্রা' : 'Target Goal'}:</span>{' '}
                        <span className="font-bold text-slate-800 dark:text-white">
                          {fund.targetAmount > 0 ? formatCurrency(fund.targetAmount, isBangla) : (isBangla ? 'উন্মুক্ত' : 'Open')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">{isBangla ? 'উত্তোলিত' : 'Total Raised'}:</span>{' '}
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(metrics.totalCollected, isBangla)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">{isBangla ? 'বিতরণ/ব্যয়' : 'Disbursed'}:</span>{' '}
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(metrics.totalDisbursed, isBangla)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">{isBangla ? 'যুক্ত সদস্য' : 'Members'}:</span>{' '}
                        <span className="font-bold text-slate-800 dark:text-white">
                          {formatNumber(metrics.enrolledCount, isBangla)} {isBangla ? 'জন' : ''} (
                          <span className="text-emerald-500">{metrics.paidCount} পরিশোধ</span> /{' '}
                          <span className="text-rose-500">{metrics.unpaidCount} বাকি</span>)
                        </span>
                      </div>
                    </div>

                    {fund.targetAmount > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                          <span>{isBangla ? 'সংগ্রহ অগ্রগতি' : 'Progress'} ({percentRaised}%)</span>
                          <span>
                            {formatCurrency(metrics.totalCollected, isBangla)} / {formatCurrency(fund.targetAmount, isBangla)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentRaised}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Toggle Accordion for Members & Expenses */}
                  <div className="mt-4 flex justify-between items-center pt-2">
                    <button
                      onClick={() => setExpandedFundId(isExpanded ? null : fund.id)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          {isBangla ? 'তালিকা লুকান' : 'Hide Details'}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          {isBangla ? `সদস্য ও ব্যয়ের বিস্তারিত দেখুন (${fundContribs.length} জন সদস্য)` : `View Members & Expenses (${fundContribs.length})`}
                        </>
                      )}
                    </button>

                    <span className="text-[11px] text-slate-400">
                      {fundExps.length} {isBangla ? 'টি খরচ রেকর্ড' : 'disbursements logged'}
                    </span>
                  </div>
                </div>

                {/* Expanded Section: Member Ledger & Disbursements */}
                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-5 border-t border-slate-200 dark:border-slate-800 space-y-6">
                    {/* Members in Fund */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-emerald-500" />
                          {isBangla ? 'ফান্ডে যুক্ত সদস্যদের তালিকা ও চাঁদার স্থিতি' : 'Enrolled Members & Payment Status'}
                        </h4>
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenEnrollMember(fund)}
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            {isBangla ? 'আরও সদস্য যুক্ত করুন' : 'Add Member'}
                          </button>
                        )}
                      </div>

                      {fundContribs.length === 0 ? (
                        <div className="text-center py-6 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                          {isBangla
                            ? 'এই ফান্ডে এখনো কোনো সদস্য যুক্ত করা হয়নি।'
                            : 'No members enrolled in this fund yet.'}
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-bold">
                              <tr>
                                <th className="px-4 py-3">{isBangla ? 'সদস্যের নাম' : 'Member'}</th>
                                <th className="px-4 py-3">{isBangla ? 'ক্যাটাগরি' : 'Age Group'}</th>
                                <th className="px-4 py-3">{isBangla ? 'টার্গেট' : 'Expected'}</th>
                                <th className="px-4 py-3">{isBangla ? 'পরিশোধিত' : 'Paid'}</th>
                                <th className="px-4 py-3">{isBangla ? 'বকেয়া' : 'Due'}</th>
                                <th className="px-4 py-3">{isBangla ? 'স্ট্যাটাস' : 'Status'}</th>
                                <th className="px-4 py-3 text-right">{isBangla ? 'অ্যাকশন' : 'Actions'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {fundContribs.map((contrib) => {
                                const member = members.find((m) => m.id === contrib.memberId);
                                const due = Math.max(0, contrib.expectedAmount - contrib.paidAmount);

                                return (
                                  <tr
                                    key={contrib.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                  >
                                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                      <div className="flex flex-col">
                                        <span>
                                          {member
                                            ? isBangla && member.banglaName
                                              ? member.banglaName
                                              : member.name
                                            : contrib.memberId}
                                        </span>
                                        {member?.phone && (
                                          <span className="text-[10px] text-slate-400 font-normal">
                                            {member.phone}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      {member?.memberCategory === 'child' && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                          🧒 {isBangla ? 'বাচ্চা' : 'Child'}
                                        </span>
                                      )}
                                      {member?.memberCategory === 'teen' && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                          🧑‍🦱 {isBangla ? 'কিশোর' : 'Teen'}
                                        </span>
                                      )}
                                      {(!member?.memberCategory || member?.memberCategory === 'youth') && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                          👨‍🦱 {isBangla ? 'যুবক' : 'Youth'}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                                      {formatCurrency(contrib.expectedAmount, isBangla)}
                                    </td>
                                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                                      {formatCurrency(contrib.paidAmount, isBangla)}
                                    </td>
                                    <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">
                                      {due > 0 ? formatCurrency(due, isBangla) : '৳০'}
                                    </td>
                                    <td className="px-4 py-3">
                                      {contrib.status === 'PAID' ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          {isBangla ? 'পরিশোধিত' : 'Paid'}
                                        </span>
                                      ) : contrib.status === 'PARTIAL' ? (
                                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                                          <Clock className="w-3.5 h-3.5" />
                                          {isBangla ? 'আংশিক' : 'Partial'}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                                          <AlertCircle className="w-3.5 h-3.5" />
                                          {isBangla ? 'বকেয়া' : 'Unpaid'}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {isAdmin && (
                                          <button
                                            onClick={() => handleOpenCollectPayment(fund, member)}
                                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800"
                                          >
                                            {isBangla ? 'টাকা জমা' : 'Pay'}
                                          </button>
                                        )}
                                        {due > 0 && member?.phone && (
                                          <button
                                            onClick={() => handleSendReminder(fund, member, due)}
                                            title={isBangla ? 'হোয়াটসঅ্যাপ রিমাইন্ডার' : 'Send WhatsApp Reminder'}
                                            className="p-1 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950"
                                          >
                                            <Send className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                        {isAdmin && (
                                          <button
                                            onClick={() => handleRemoveMemberFromFund(fund.id, contrib.memberId)}
                                            title={isBangla ? 'ফান্ড থেকে সরান' : 'Remove from fund'}
                                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Expenses / Disbursements from this Fund */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Receipt className="w-4 h-4 text-rose-500" />
                          {isBangla ? 'এই ফান্ড থেকে বিতরণ / ব্যয়ের বিবরণ' : 'Disbursements & Expenses from this Fund'}
                        </h4>
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenDisburse(fund)}
                            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            {isBangla ? 'খরচ রেকর্ড করুন' : 'Add Expense'}
                          </button>
                        )}
                      </div>

                      {fundExps.length === 0 ? (
                        <div className="text-center py-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
                          {isBangla
                            ? 'এই ফান্ড থেকে এখনো কোনো ব্যয় বা বিতরণ করা হয়নি।'
                            : 'No disbursements recorded for this fund.'}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {fundExps.map((exp) => (
                            <div
                              key={exp.id}
                              className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <h5 className="font-bold text-slate-900 dark:text-white">
                                  {exp.title}
                                </h5>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>{exp.date}</span>
                                  {exp.disbursedTo && (
                                    <span>
                                      • {isBangla ? 'প্রাপক: ' : 'Paid to: '}
                                      {exp.disbursedTo}
                                    </span>
                                  )}
                                  {exp.notes && <span>• {exp.notes}</span>}
                                </div>
                              </div>
                              <span className="font-black text-rose-600 dark:text-rose-400 text-sm shrink-0">
                                -{formatCurrency(exp.amount, isBangla)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create New Fund */}
      {isCreateFundOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 text-lg">
                  🤝
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {t.create_fund}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isBangla ? 'যেকোনো সামাজিক, চিকিৎসা, ঈদ বা ক্লাব উন্নয়ন ফান্ড' : 'Create any custom non-sports fund'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateFundOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewFund} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBangla ? 'ফান্ডের নাম (বাংলায়)' : 'Fund Title (Bangla)'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBangla ? 'যেমন: জরুরি চিকিৎসা ও রক্তদান ফান্ড' : 'e.g. Emergency Medical Fund'}
                  value={newFundTitleBangla}
                  onChange={(e) => {
                    setNewFundTitleBangla(e.target.value);
                    if (!newFundTitle) setNewFundTitle(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBangla ? 'ফান্ডের নাম (ইংরেজিতে)' : 'Fund Title (English)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Medical Fund"
                  value={newFundTitle}
                  onChange={(e) => setNewFundTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.fund_category}
                  </label>
                  <select
                    value={newFundCategory}
                    onChange={(e) => setNewFundCategory(e.target.value as FundCategory)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Emergency">{isBangla ? 'জরুরি ও চিকিৎসা' : 'Emergency & Medical'}</option>
                    <option value="Infrastructure">{isBangla ? 'ক্লাব ঘর / মাঠ সংস্কার' : 'Club Infrastructure'}</option>
                    <option value="Religious">{isBangla ? 'রমজান / ঈদ উপহার' : 'Ramadan / Eid'}</option>
                    <option value="Welfare">{isBangla ? 'জনকল্যাণ ও ত্রাণ' : 'Welfare'}</option>
                    <option value="Social">{isBangla ? 'সামাজিক উৎসব' : 'Social Events'}</option>
                    <option value="General">{isBangla ? 'সাধারণ তহবিল' : 'General'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBangla ? 'আইকন ইমোজি' : 'Icon Emoji'}
                  </label>
                  <input
                    type="text"
                    value={newFundIcon}
                    onChange={(e) => setNewFundIcon(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.fund_target} (৳)
                  </label>
                  <input
                    type="number"
                    value={newFundTarget}
                    onChange={(e) => setNewFundTarget(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="20000"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBangla ? 'সদস্য প্রতি চাঁদা (৳)' : 'Target per Member (৳)'}
                  </label>
                  <input
                    type="number"
                    value={newFundDefaultAmount}
                    onChange={(e) => setNewFundDefaultAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="500"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBangla ? 'স্বয়ংক্রিয় সদস্য অন্তর্ভুক্তি' : 'Auto-Enroll Members'}
                </label>
                <select
                  value={autoEnrollGroup}
                  onChange={(e) => setAutoEnrollGroup(e.target.value as 'all' | 'youth' | 'none')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="youth">
                    {isBangla ? '👨‍🦱 সকল যুবক ও তরুণ সদস্যদের যুক্ত করুন' : 'Auto-enroll all Youth/Senior members'}
                  </option>
                  <option value="all">
                    {isBangla ? '👥 সকল সদস্যকে (বাচ্চা, কিশোর, যুবক) যুক্ত করুন' : 'Auto-enroll all club members'}
                  </option>
                  <option value="none">
                    {isBangla ? '❌ কাউকে নয় (পরে একা একা যুক্ত করব)' : 'Do not auto-enroll (Enroll manually)'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBangla ? 'বিবরণ ও উদ্দেশ্য' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={newFundDesc}
                  onChange={(e) => setNewFundDesc(e.target.value)}
                  placeholder={isBangla ? 'এই ফান্ড কীভাবে কাজে লাগানো হবে...' : 'Purpose of this fund...'}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFundOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Collect Payment / Contribution */}
      {isCollectPaymentOpen && activeFundForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t.collect_fund_tk}
                </h3>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                  {activeFundForAction.titleBangla || activeFundForAction.title}
                </p>
              </div>
              <button
                onClick={() => setIsCollectPaymentOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCollectPayment} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.member_name} *
                </label>
                <select
                  required
                  value={payMemberId}
                  onChange={(e) => setPayMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{isBangla ? '-- সদস্য নির্বাচন করুন --' : '-- Select Member --'}</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {isBangla && m.banglaName ? m.banglaName : m.name} (
                      {m.memberCategory === 'child' ? '🧒 বাচ্চা' : m.memberCategory === 'teen' ? '🧑‍🦱 কিশোর' : '👨‍🦱 যুবক'}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBangla ? 'জমার পরিমাণ (৳)' : 'Contribution Amount (৳)'} *
                </label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="500"
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.payment_method}
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                  {(['bKash', 'Nagad', 'Cash', 'Bank'] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPayMethod(method)}
                      className={`py-2 rounded-xl border text-center transition-all ${
                        payMethod === method
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBangla ? 'নোট / ট্রানজেকশন আইডি' : 'Notes / Txn ID'}
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder={isBangla ? 'যেমন: বিকাশ Txn #BK8821' : 'Optional notes...'}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCollectPaymentOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  {isBangla ? 'জমা নিশ্চিত করুন' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Disburse / Expense from Fund */}
      {isDisburseOpen && activeFundForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t.disburse_fund_tk}
                </h3>
                <p className="text-xs text-rose-600 font-semibold mt-0.5">
                  {activeFundForAction.titleBangla || activeFundForAction.title}
                </p>
              </div>
              <button
                onClick={() => setIsDisburseOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDisburse} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBangla ? 'ব্যয় বা বিতরণের বিবরণ' : 'Disbursement Purpose / Title'} *
                </label>
                <input
                  type="text"
                  required
                  value={disburseTitle}
                  onChange={(e) => setDisburseTitle(e.target.value)}
                  placeholder={isBangla ? 'যেমন: খেলোয়াড়ের চিকিৎসা বাবদ ফার্মেসিতে বিল' : 'e.g. Medicine purchase for injured player'}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBangla ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'} *
                  </label>
                  <input
                    type="number"
                    required
                    value={disburseAmount}
                    onChange={(e) => setDisburseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="2500"
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isBangla ? 'প্রাপক ব্যক্তি / প্রতিষ্ঠান' : 'Recipient / Vendor'}
                  </label>
                  <input
                    type="text"
                    value={disburseRecipient}
                    onChange={(e) => setDisburseRecipient(e.target.value)}
                    placeholder={isBangla ? 'যেমন: ঢাকা ফার্মেসি' : 'e.g. Dhaka Pharmacy'}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBangla ? 'মন্তব্য বা অতিরিক্ত তথ্য' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={disburseNotes}
                  onChange={(e) => setDisburseNotes(e.target.value)}
                  placeholder={isBangla ? 'রসিদ বা ভাউচার নম্বর' : 'Voucher or receipt #'}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisburseOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
                >
                  {isBangla ? 'খরচ রেকর্ড করুন' : 'Confirm Disbursement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enroll Member into Fund */}
      {isEnrollMemberOpen && activeFundForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {t.enroll_members}
                </h3>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                  {activeFundForAction.titleBangla || activeFundForAction.title}
                </p>
              </div>
              <button
                onClick={() => setIsEnrollMemberOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEnrollMember} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBangla ? 'সদস্য নির্বাচন করুন' : 'Select Member'} *
                </label>
                <select
                  required
                  value={enrollMemberId}
                  onChange={(e) => setEnrollMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{isBangla ? '-- সদস্য বেছে নিন --' : '-- Choose Member --'}</option>
                  {members.map((m) => {
                    const alreadyIn = contributions.some(
                      (c) => c.fundId === activeFundForAction.id && c.memberId === m.id
                    );
                    return (
                      <option key={m.id} value={m.id} disabled={alreadyIn}>
                        {isBangla && m.banglaName ? m.banglaName : m.name} (
                        {m.memberCategory === 'child' ? '🧒 বাচ্চা' : m.memberCategory === 'teen' ? '🧑‍🦱 কিশোর' : '👨‍🦱 যুবক'}
                        ) {alreadyIn ? (isBangla ? '✓ ইতিমধ্যে যুক্ত' : '✓ Enrolled') : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isBangla ? 'এই সদস্যের জন্য লক্ষ্যমাত্রা (৳)' : 'Target Amount for this Member (৳)'}
                </label>
                <input
                  type="number"
                  value={enrollExpectedAmount}
                  onChange={(e) => setEnrollExpectedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="500"
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollMemberOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                >
                  {isBangla ? 'ফান্ডে যুক্ত করুন' : 'Enroll Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
