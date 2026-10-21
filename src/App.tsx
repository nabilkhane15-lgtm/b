import React, { useState, useEffect, useRef } from 'react';
import {
  Season,
  Member,
  Week,
  MonthRecord,
  Payment,
  MonthlyPayment,
  SavingsDeposit,
  Expense,
  TabType,
  PaymentStatus,
  ClubSettings,
  Tournament,
  PicnicEvent,
  CustomFund,
  FundContribution,
  FundExpense,
  LeaderboardAward,
} from './types';
import {
  loadClubSettings,
  saveClubSettings,
  loadSeasons,
  saveSeasons,
  loadWeeks,
  saveWeeks,
  loadMonths,
  saveMonths,
  loadMembers,
  saveMembers,
  loadPayments,
  savePayments,
  loadMonthlyPayments,
  saveMonthlyPayments,
  loadSavingsDeposits,
  saveSavingsDeposits,
  loadExpenses,
  saveExpenses,
  loadTournaments,
  saveTournaments,
  loadPicnics,
  savePicnics,
  loadCustomFunds,
  saveCustomFunds,
  loadFundContributions,
  saveFundContributions,
  loadFundExpenses,
  saveFundExpenses,
  loadLeaderboardAwards,
  saveLeaderboardAwards,
  loadAdminProfile,
  saveAdminProfile,
  loadLoggedInMemberId,
  saveLoggedInMemberId,
  resetToDefaultData,
  subscribeToStorageSync,
} from './utils/storage';
import { Language, translations } from './utils/language';
import { AdminProfile } from './types';
import {
  subscribeToClubDataSnapshot,
  uploadClubDataToFirestore,
  downloadClubDataFromFirestore,
  isFirebaseSyncEnabled,
} from './utils/firebase';

// Components
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ReceiptModal } from './components/ReceiptModal';
import { PaymentModal } from './components/PaymentModal';
import { MemberProfileModal } from './components/MemberProfileModal';
import { AdminPinModal } from './components/AdminPinModal';
import { AdminProfileModal } from './components/AdminProfileModal';
import { MemberAuthModal } from './components/MemberAuthModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddMemberModal } from './components/AddMemberModal';
import { CreateWeekModal } from './components/CreateWeekModal';
import { CreateSeasonModal } from './components/CreateSeasonModal';
import { CreateMonthModal } from './components/CreateMonthModal';
import { MonthlyPaymentModal } from './components/MonthlyPaymentModal';
import { AddSavingsModal } from './components/AddSavingsModal';
import { MemberIdSearchModal } from './components/MemberIdSearchModal';
import { FirebaseModal } from './components/FirebaseModal';
import { SharePublicModal } from './components/SharePublicModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';

// Views
import { DashboardView } from './views/DashboardView';
import { MembersView } from './views/MembersView';
import { WeeklyCollectionView } from './views/WeeklyCollectionView';
import { TournamentView } from './views/TournamentView';
import { PicnicView } from './views/PicnicView';
import { FundsView } from './views/FundsView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { SeasonView } from './views/SeasonView';
import { SettingsView } from './views/SettingsView';
import { LeaderboardView } from './views/LeaderboardView';
import { MemberSettingsView } from './views/MemberSettingsView';

export const App: React.FC = () => {
  // Localization
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('badminton_lang') as Language) || 'bn';
  });

  // Dark Mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('badminton_theme') === 'dark';
  });

  // Role: Admin vs Viewer
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('badminton_is_admin') === 'true';
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Club Profile & Settings
  const [clubSettings, setClubSettings] = useState<ClubSettings>(loadClubSettings);

  // Core Data
  const [seasons, setSeasons] = useState<Season[]>(loadSeasons);
  const [activeSeasonId, setActiveSeasonId] = useState<string>(
    () => loadSeasons().find((s) => s.isActive)?.id || 'season-2026'
  );

  const [weeks, setWeeks] = useState<Week[]>(loadWeeks);
  const [activeWeekId, setActiveWeekId] = useState<string>(
    () => loadWeeks()[loadWeeks().length - 1]?.id || 'w4'
  );

  const [months, setMonths] = useState<MonthRecord[]>(loadMonths);
  const [activeMonthId, setActiveMonthId] = useState<string>(
    () => loadMonths()[loadMonths().length - 1]?.id || 'm1'
  );

  const [members, setMembers] = useState<Member[]>(loadMembers);
  const [payments, setPayments] = useState<Payment[]>(loadPayments);
  const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPayment[]>(loadMonthlyPayments);
  const [savingsDeposits, setSavingsDeposits] = useState<SavingsDeposit[]>(loadSavingsDeposits);
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [tournaments, setTournaments] = useState<Tournament[]>(loadTournaments);
  const [picnics, setPicnics] = useState<PicnicEvent[]>(loadPicnics);
  const [funds, setFunds] = useState<CustomFund[]>(loadCustomFunds);
  const [fundContributions, setFundContributions] = useState<FundContribution[]>(loadFundContributions);
  const [fundExpenses, setFundExpenses] = useState<FundExpense[]>(loadFundExpenses);
  const [leaderboardAwards, setLeaderboardAwards] = useState<LeaderboardAward[]>(loadLeaderboardAwards);

  // Active Modals
  const [receiptTarget, setReceiptTarget] = useState<{
    member: Member;
    payment: Payment;
    week: Week;
  } | null>(null);

  const [paymentEditTarget, setPaymentEditTarget] = useState<{
    member: Member;
    payment: Payment;
    week: Week;
  } | null>(null);

  const [monthlyPaymentTarget, setMonthlyPaymentTarget] = useState<{
    payment: MonthlyPayment;
    month: MonthRecord;
    member: Member;
  } | null>(null);

  const [savingsModalConfig, setSavingsModalConfig] = useState<{
    isOpen: boolean;
    defaultMemberId?: string;
  } | null>(null);

  const [selectedMemberProfile, setSelectedMemberProfile] = useState<Member | null>(null);
  const [showIdSearchModal, setShowIdSearchModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateWeekModal, setShowCreateWeekModal] = useState(false);
  const [showCreateMonthModal, setShowCreateMonthModal] = useState(false);
  const [showCreateSeasonModal, setShowCreateSeasonModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(loadAdminProfile);
  const [currentSubAdmin, setCurrentSubAdmin] = useState<Member | null>(null);
  const [currentLoggedInMember, setCurrentLoggedInMember] = useState<Member | null>(() => {
    const savedId = loadLoggedInMemberId();
    if (savedId) {
      return loadMembers().find((m) => m.id === savedId) || null;
    }
    return null;
  });
  const [showMemberAuthModal, setShowMemberAuthModal] = useState(false);
  const [memberAuthInitialTab, setMemberAuthInitialTab] = useState<'login' | 'signup' | 'admin'>('login');
  const isRemoteUpdatingRef = useRef(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Sync theme with HTML root class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('badminton_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('badminton_theme', 'light');
    }
  }, [isDark]);

  // Sync lang with localStorage
  useEffect(() => {
    localStorage.setItem('badminton_lang', lang);
  }, [lang]);

  // Sync admin mode with localStorage
  useEffect(() => {
    localStorage.setItem('badminton_is_admin', String(isAdmin));
  }, [isAdmin]);

  // Check for /admin or #admin route to trigger Admin login or switch to admin view
  useEffect(() => {
    const handleAdminRouteCheck = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      const isAdminRoute =
        path === '/admin' ||
        path.endsWith('/admin') ||
        hash === '#admin' ||
        hash === '#/admin' ||
        hash.startsWith('#admin') ||
        search.includes('admin');

      if (isAdminRoute) {
        if (!isAdmin) {
          setMemberAuthInitialTab('admin');
          setShowMemberAuthModal(true);
        } else {
          setActiveTab('settings');
        }
      }
    };

    handleAdminRouteCheck();
    window.addEventListener('popstate', handleAdminRouteCheck);
    window.addEventListener('hashchange', handleAdminRouteCheck);
    return () => {
      window.removeEventListener('popstate', handleAdminRouteCheck);
      window.removeEventListener('hashchange', handleAdminRouteCheck);
    };
  }, [isAdmin]);

  // Listen to BroadcastChannel for real-time synchronization between browser tabs
  useEffect(() => {
    const unsubscribe = subscribeToStorageSync(() => {
      setClubSettings(loadClubSettings());
      setSeasons(loadSeasons());
      setWeeks(loadWeeks());
      setMonths(loadMonths());
      setMembers(loadMembers());
      setPayments(loadPayments());
      setMonthlyPayments(loadMonthlyPayments());
      setSavingsDeposits(loadSavingsDeposits());
      setExpenses(loadExpenses());
      setTournaments(loadTournaments());
      setPicnics(loadPicnics());
      setFunds(loadCustomFunds());
      setFundContributions(loadFundContributions());
      setFundExpenses(loadFundExpenses());
      setLeaderboardAwards(loadLeaderboardAwards());
    });
    return unsubscribe;
  }, []);

  // Listen to Firestore for real-time synchronization across different devices & mobile browsers
  useEffect(() => {
    if (!isFirebaseSyncEnabled()) return;

    let isFirstEvent = true;
    const unsubscribe = subscribeToClubDataSnapshot(
      (cloudData) => {
        if (!cloudData) return;
        isRemoteUpdatingRef.current = true;
        handleRestoreClubData(cloudData, false);
        setTimeout(() => {
          isRemoteUpdatingRef.current = false;
        }, 1200);

        if (isFirstEvent) {
          isFirstEvent = false;
          console.log('Connected and synced with Firestore cloud snapshot');
        } else {
          showToast(lang === 'bn' ? 'ক্লাউড থেকে লাইভ ডাটা আপডেট হয়েছে! 🔄' : 'Live data synced from Cloud! 🔄');
        }
      },
      (err) => {
        console.warn('Firestore live listener note:', err);
      }
    );

    // Initial check: if cloud has no snapshot and admin is active, seed the database
    downloadClubDataFromFirestore()
      .then((res) => {
        if (!res.success || !res.data) {
          if (isAdmin) {
            uploadClubDataToFirestore(getAllClubData()).catch(() => {});
          }
        }
      })
      .catch(() => {});

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Auto-sync updates from Admin to Firestore cloud (debounced 1.5s)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isRemoteUpdatingRef.current) return;
    if (!isAdmin || !isFirebaseSyncEnabled()) return;

    const timer = setTimeout(async () => {
      try {
        const fullData = getAllClubData();
        await uploadClubDataToFirestore(fullData);
        console.log('Auto-synced club data to Firestore');
      } catch (err) {
        console.warn('Auto cloud sync failed:', err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    clubSettings,
    seasons,
    members,
    weeks,
    months,
    payments,
    monthlyPayments,
    savingsDeposits,
    expenses,
    tournaments,
    picnics,
    funds,
    fundContributions,
    fundExpenses,
    leaderboardAwards,
    isAdmin,
  ]);

  const activeSeason: Season =
    seasons.find((s) => s.id === activeSeasonId) ||
    seasons[0] || {
      id: 'season-2026',
      name: 'Season 2026',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      defaultWeeklyFee: 350,
      weeklyTarget: 5000,
      isActive: true,
    };

  const activeWeek: Week =
    weeks.find((w) => w.id === activeWeekId) ||
    weeks[weeks.length - 1] || {
      id: 'w1',
      seasonId: activeSeason.id,
      weekNumber: 1,
      title: 'Week 1',
      titleBangla: 'সপ্তাহ ১',
      startDate: '2026-01-01',
      endDate: '2026-01-07',
      weeklyTarget: 5000,
      isClosed: false,
    };

  // Helper actions
  const handleToggleLang = () => {
    setLang((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const handleToggleDark = () => {
    setIsDark((prev) => !prev);
  };

  // Delegated Sub-Admin Permissions Helpers
  const canManageStars = isAdmin || (currentSubAdmin?.delegatedPermissions?.includes('manage_stars') ?? false);
  const canManageMembers = isAdmin || (currentSubAdmin?.delegatedPermissions?.includes('manage_members') ?? false);
  const canManageCollection = isAdmin || (currentSubAdmin?.delegatedPermissions?.includes('manage_collection') ?? false);
  const canManageExpenses = isAdmin || (currentSubAdmin?.delegatedPermissions?.includes('manage_expenses') ?? false);
  const canManageTournaments = isAdmin || (currentSubAdmin?.delegatedPermissions?.includes('manage_tournaments') ?? false);
  const canManagePicnic = isAdmin || (currentSubAdmin?.delegatedPermissions?.includes('manage_picnic') ?? false);
  const canManageFunds = isAdmin || (currentSubAdmin?.delegatedPermissions?.includes('manage_funds') ?? false);

  const handleToggleAdmin = () => {
    if (isAdmin || currentSubAdmin) {
      setIsAdmin(false);
      setCurrentSubAdmin(null);
      if (
        window.location.pathname.toLowerCase().endsWith('/admin') ||
        window.location.pathname.toLowerCase().endsWith('/admin/') ||
        window.location.hash === '#admin'
      ) {
        window.history.replaceState({}, '', '/');
      }
      setActiveTab('dashboard');
      showToast(lang === 'bn' ? 'অ্যাডমিন মোড থেকে বের হয়ে সাধারণ ভিউতে যাওয়া হয়েছে' : 'Switched to Viewer Mode');
    } else {
      handleOpenAuth('admin');
    }
  };

  const handleAdminSuccess = (subAdmin?: Member) => {
    if (subAdmin) {
      setCurrentSubAdmin(subAdmin);
      setIsAdmin(false);
      showToast(
        lang === 'bn'
          ? `${subAdmin.banglaName || subAdmin.name} (${subAdmin.assignedDuty || 'সাব-অ্যাডমিন'}) হিসেবে লগইন হয়েছে 🎖️`
          : `Logged in as Sub-Admin: ${subAdmin.name}`
      );
    } else {
      setCurrentSubAdmin(null);
      setIsAdmin(true);
      setActiveTab('settings');
      showToast(lang === 'bn' ? 'প্রধান অ্যাডমিন মোড সক্রিয় হয়েছে! 👑' : 'Master Admin Mode Unlocked! 👑');
      try {
        if (
          window.location.pathname.toLowerCase().endsWith('/admin') ||
          window.location.pathname.toLowerCase().endsWith('/admin/') ||
          window.location.hash.toLowerCase().includes('admin')
        ) {
          window.history.replaceState({}, '', '/');
        }
      } catch {
        // ignore
      }
    }
    setShowPinModal(false);
    setShowMemberAuthModal(false);
  };

  const handleLogoutSubAdmin = () => {
    setCurrentSubAdmin(null);
    showToast(lang === 'bn' ? 'সাব-অ্যাডমিন থেকে লগআউট করা হয়েছে' : 'Logged out from Sub-Admin');
  };

  const handleSaveAdminProfile = (updated: AdminProfile) => {
    setAdminProfile(updated);
    saveAdminProfile(updated);
    showToast(lang === 'bn' ? 'অ্যাডমিন পরিচিতি সফলভাবে সংরক্ষিত হয়েছে 🎉' : 'Admin Profile saved successfully 🎉');
  };

  // Member Authentication Handlers
  const handleMemberLoginSuccess = (mem: Member) => {
    setCurrentLoggedInMember(mem);
    saveLoggedInMemberId(mem.id);
    setActiveTab('settings');
    showToast(
      lang === 'bn'
        ? `স্বাগতম ${mem.banglaName || mem.name}! আপনার মেম্বার পোর্টালে লগইন হয়েছে (#${mem.memberCode}) 👤`
        : `Logged in as ${mem.name} (#${mem.memberCode})`
    );
  };

  const handleLogoutMember = () => {
    setCurrentLoggedInMember(null);
    saveLoggedInMemberId(null);
    setActiveTab('dashboard');
    showToast(lang === 'bn' ? 'সদস্য একাউন্ট থেকে লগআউট করা হয়েছে' : 'Logged out from member account');
  };

  const handleOpenAuth = (tab: 'login' | 'signup' | 'admin' = 'login') => {
    setMemberAuthInitialTab(tab);
    setShowMemberAuthModal(true);
  };

  // Payment update
  const handleSavePayment = (updated: Payment) => {
    const updatedList = payments.map((p) => (p.id === updated.id ? updated : p));
    // If it was a new record
    if (!payments.some((p) => p.id === updated.id)) {
      updatedList.push(updated);
    }
    setPayments(updatedList);
    savePayments(updatedList);
    setPaymentEditTarget(null);
    showToast(lang === 'bn' ? 'পেমেন্ট সফলভাবে সংরক্ষিত হয়েছে' : 'Payment record updated');
  };

  // Quick mark paid
  const handleQuickMark = (paymentId: string, status: PaymentStatus, expected: number) => {
    const existing = payments.find((p) => p.id === paymentId);
    let updatedList: Payment[];
    if (existing) {
      updatedList = payments.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status,
              paidAmount: status === 'PAID' ? expected : 0,
              paymentDate: new Date().toLocaleDateString('en-GB'),
            }
          : p
      );
    } else {
      // Need to construct payment
      const parts = paymentId.split('-');
      const weekId = parts[1] || activeWeek.id;
      const memberId = parts[2] || '';
      const newPayment: Payment = {
        id: paymentId,
        seasonId: activeSeason.id,
        weekId,
        memberId,
        expectedAmount: expected,
        paidAmount: expected,
        status: 'PAID',
        paymentDate: new Date().toLocaleDateString('en-GB'),
        paymentMethod: 'bKash',
      };
      updatedList = [...payments, newPayment];
    }
    setPayments(updatedList);
    savePayments(updatedList);
    showToast(lang === 'bn' ? 'পেমেন্ট সম্পূর্ণ হিসেবে চিহ্নিত' : 'Marked as Paid');
  };

  // Add Member
  const handleSaveMember = (newMem: Omit<Member, 'id'>) => {
    const id = `m-${Date.now()}`;
    const member: Member = { ...newMem, id };
    const updatedMembers = [...members, member];
    setMembers(updatedMembers);
    saveMembers(updatedMembers);

    // Also auto-generate weekly payment slots for this member in all weeks
    const newPayments = [...payments];
    weeks.forEach((w) => {
      newPayments.push({
        id: `p-${w.id}-${id}`,
        seasonId: w.seasonId,
        weekId: w.id,
        memberId: id,
        expectedAmount: member.weeklyAmount,
        paidAmount: 0,
        status: 'UNPAID',
        paymentDate: '',
        paymentMethod: 'Cash',
      });
    });
    setPayments(newPayments);
    savePayments(newPayments);

    // Auto-generate monthly payment slots for this member in all months
    const newMonthlyPayments = [...monthlyPayments];
    months.forEach((m) => {
      newMonthlyPayments.push({
        id: `mp-${m.id}-${id}`,
        seasonId: m.seasonId,
        monthId: m.id,
        memberId: id,
        expectedAmount: member.monthlyAmount || clubSettings.defaultMonthlyFee || 1400,
        paidAmount: 0,
        status: 'UNPAID',
        paymentDate: '',
        paymentMethod: 'Cash',
      });
    });
    setMonthlyPayments(newMonthlyPayments);
    saveMonthlyPayments(newMonthlyPayments);

    showToast(
      lang === 'bn'
        ? `${member.banglaName || member.name} যুক্ত হয়েছেন`
        : `Added member ${member.name}`
    );
    return member;
  };

  // Delete Member
  const handleDeleteMember = (memberId: string) => {
    const updatedMembers = members.filter((m) => m.id !== memberId);
    setMembers(updatedMembers);
    saveMembers(updatedMembers);

    const updatedPayments = payments.filter((p) => p.memberId !== memberId);
    setPayments(updatedPayments);
    savePayments(updatedPayments);

    const updatedMonthlyPayments = monthlyPayments.filter((p) => p.memberId !== memberId);
    setMonthlyPayments(updatedMonthlyPayments);
    saveMonthlyPayments(updatedMonthlyPayments);

    const updatedSavings = savingsDeposits.filter((s) => s.memberId !== memberId);
    setSavingsDeposits(updatedSavings);
    saveSavingsDeposits(updatedSavings);

    showToast(lang === 'bn' ? 'সদস্য অপসারিত হয়েছে' : 'Member removed');
  };

  // Update Member (Demographics, Category, Role, Sports participation)
  const handleUpdateMember = (updatedMember: Member) => {
    const updated = members.map((m) => (m.id === updatedMember.id ? updatedMember : m));
    setMembers(updated);
    saveMembers(updated);
    if (selectedMemberProfile && selectedMemberProfile.id === updatedMember.id) {
      setSelectedMemberProfile(updatedMember);
    }
    if (currentLoggedInMember && currentLoggedInMember.id === updatedMember.id) {
      setCurrentLoggedInMember(updatedMember);
    }
    showToast(lang === 'bn' ? 'সদস্যের তথ্য সফলভাবে হালনাগাদ হয়েছে' : 'Member profile updated');
  };

  // Custom Funds Handlers
  const handleSaveFunds = (newFunds: CustomFund[]) => {
    setFunds(newFunds);
    saveCustomFunds(newFunds);
    showToast(lang === 'bn' ? 'ফান্ড তথ্য সংরক্ষিত হয়েছে' : 'Fund record saved');
  };

  const handleSaveFundContributions = (newContributions: FundContribution[]) => {
    setFundContributions(newContributions);
    saveFundContributions(newContributions);
    showToast(lang === 'bn' ? 'ফান্ড চাঁদা/অনুদান গ্রহণ সম্পন্ন' : 'Fund payment recorded');
  };

  const handleSaveFundExpenses = (newExpenses: FundExpense[]) => {
    setFundExpenses(newExpenses);
    saveFundExpenses(newExpenses);
    showToast(lang === 'bn' ? 'ফান্ড ব্যয় সংরক্ষিত হয়েছে' : 'Fund disbursement recorded');
  };

  // Add Expense
  const handleSaveExpense = (newExp: Omit<Expense, 'id'>) => {
    const exp: Expense = { ...newExp, id: `exp-${Date.now()}` };
    const updated = [exp, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    showToast(lang === 'bn' ? 'খরচ হিসাব যুক্ত হয়েছে' : 'Expense recorded');
  };

  // Delete Expense
  const handleDeleteExpense = (expenseId: string) => {
    const updated = expenses.filter((e) => e.id !== expenseId);
    setExpenses(updated);
    saveExpenses(updated);
    showToast(lang === 'bn' ? 'খরচ মুছে ফেলা হয়েছে' : 'Expense deleted');
  };

  // Create Week
  const handleSaveWeek = (newWk: Omit<Week, 'id'>) => {
    const id = `w-${Date.now()}`;
    const week: Week = { ...newWk, id };
    const updatedWeeks = [...weeks, week];
    setWeeks(updatedWeeks);
    saveWeeks(updatedWeeks);
    setActiveWeekId(id);

    // Generate payment slots for all members for this new week
    const newPayments = [...payments];
    members.forEach((m) => {
      newPayments.push({
        id: `p-${id}-${m.id}`,
        seasonId: week.seasonId,
        weekId: id,
        memberId: m.id,
        expectedAmount: m.weeklyAmount,
        paidAmount: 0,
        status: 'UNPAID',
        paymentDate: '',
        paymentMethod: 'Cash',
      });
    });
    setPayments(newPayments);
    savePayments(newPayments);

    showToast(
      lang === 'bn'
        ? `${week.titleBangla || week.title} তৈরি হয়েছে`
        : `Created ${week.title}`
    );
  };

  // Create Season
  const handleSaveSeason = (newSn: Omit<Season, 'id'>) => {
    const id = `season-${Date.now()}`;
    const season: Season = { ...newSn, id };
    const updatedSeasons = seasons.map((s) => ({ ...s, isActive: false })).concat(season);
    setSeasons(updatedSeasons);
    saveSeasons(updatedSeasons);
    setActiveSeasonId(id);
    showToast(lang === 'bn' ? 'নতুন সিজন তৈরি হয়েছে' : `Created season ${season.name}`);
  };

  // Delete Week
  const handleDeleteWeek = (weekId: string) => {
    if (weeks.length <= 1) {
      showToast(
        lang === 'bn'
          ? 'কমপক্ষে একটি সপ্তাহ সক্রিয় থাকতে হবে'
          : 'At least one week must remain active'
      );
      return;
    }

    const updatedWeeks = weeks.filter((w) => w.id !== weekId);
    setWeeks(updatedWeeks);
    saveWeeks(updatedWeeks);

    // Remove payments for this week
    const updatedPayments = payments.filter((p) => p.weekId !== weekId);
    setPayments(updatedPayments);
    savePayments(updatedPayments);

    if (activeWeekId === weekId) {
      setActiveWeekId(updatedWeeks[updatedWeeks.length - 1].id);
    }

    showToast(lang === 'bn' ? 'সপ্তাহ ও পেমেন্ট হিসাব মুছে ফেলা হয়েছে' : 'Week and records deleted');
  };

  // Update Club Settings
  const handleUpdateClubSettings = (newSettings: ClubSettings) => {
    setClubSettings(newSettings);
    saveClubSettings(newSettings);
    showToast(
      lang === 'bn' ? 'ক্লাবের তথ্য সফলভাবে আপডেট হয়েছে' : 'Club settings updated successfully'
    );
  };

  // Tournament Handlers
  const handleSaveTournament = (t: Tournament) => {
    const existing = tournaments.find((x) => x.id === t.id);
    const updated = existing
      ? tournaments.map((x) => (x.id === t.id ? t : x))
      : [t, ...tournaments];
    setTournaments(updated);
    saveTournaments(updated);
    showToast(lang === 'bn' ? 'টুর্নামেন্ট সংরক্ষিত হয়েছে' : 'Tournament saved');
  };

  const handleDeleteTournament = (id: string) => {
    const updated = tournaments.filter((x) => x.id !== id);
    setTournaments(updated);
    saveTournaments(updated);
    showToast(lang === 'bn' ? 'টুর্নামেন্ট মুছে ফেলা হয়েছে' : 'Tournament deleted');
  };

  const handleUpdateTournaments = (updated: Tournament[]) => {
    setTournaments(updated);
    saveTournaments(updated);
  };

  // Picnic Handlers
  const handleSavePicnic = (p: PicnicEvent) => {
    const existing = picnics.find((x) => x.id === p.id);
    const updated = existing
      ? picnics.map((x) => (x.id === p.id ? p : x))
      : [p, ...picnics];
    setPicnics(updated);
    savePicnics(updated);
    showToast(lang === 'bn' ? 'পিকনিক সংরক্ষিত হয়েছে' : 'Picnic event saved');
  };

  const handleDeletePicnic = (id: string) => {
    const updated = picnics.filter((x) => x.id !== id);
    setPicnics(updated);
    savePicnics(updated);
    showToast(lang === 'bn' ? 'পিকনিক মুছে ফেলা হয়েছে' : 'Picnic deleted');
  };

  const handleUpdatePicnics = (updated: PicnicEvent[]) => {
    setPicnics(updated);
    savePicnics(updated);
  };

  // Leaderboard Awards Handlers
  const handleSaveAward = (award: LeaderboardAward) => {
    const existingIndex = leaderboardAwards.findIndex((a) => a.id === award.id);
    let updated: LeaderboardAward[];
    if (existingIndex >= 0) {
      updated = [...leaderboardAwards];
      updated[existingIndex] = award;
    } else {
      updated = [award, ...leaderboardAwards];
    }
    setLeaderboardAwards(updated);
    saveLeaderboardAwards(updated);
    showToast(lang === 'bn' ? 'রেকর্ড ও অ্যাওয়ার্ড সংরক্ষিত হয়েছে 🏆' : 'Award saved successfully 🏆');
  };

  const handleDeleteAward = (awardId: string) => {
    const updated = leaderboardAwards.filter((a) => a.id !== awardId);
    setLeaderboardAwards(updated);
    saveLeaderboardAwards(updated);
    showToast(lang === 'bn' ? 'অ্যাওয়ার্ড মুছে ফেলা হয়েছে' : 'Award record deleted');
  };

  // Monthly Collection Handlers
  const handleSaveMonth = (newMonthData: Omit<MonthRecord, 'id'>) => {
    const id = `m-${Date.now()}`;
    const month: MonthRecord = { ...newMonthData, id };
    const updatedMonths = [...months, month];
    setMonths(updatedMonths);
    saveMonths(updatedMonths);
    setActiveMonthId(id);

    // Auto-generate monthly payment slots for all members
    const newMonthlyPayments = [...monthlyPayments];
    members.forEach((m) => {
      newMonthlyPayments.push({
        id: `mp-${id}-${m.id}`,
        seasonId: month.seasonId,
        monthId: id,
        memberId: m.id,
        expectedAmount: m.monthlyAmount || clubSettings.defaultMonthlyFee || 1400,
        paidAmount: 0,
        status: 'UNPAID',
        paymentDate: '',
        paymentMethod: 'Cash',
      });
    });
    setMonthlyPayments(newMonthlyPayments);
    saveMonthlyPayments(newMonthlyPayments);

    showToast(
      lang === 'bn'
        ? `${month.titleBangla || month.title} তৈরি হয়েছে`
        : `Created ${month.title}`
    );
  };

  const handleDeleteMonth = (monthId: string) => {
    if (months.length <= 1) {
      showToast(
        lang === 'bn'
          ? 'কমপক্ষে একটি মাস সক্রিয় থাকতে হবে'
          : 'At least one month record must remain active'
      );
      return;
    }

    const updatedMonths = months.filter((m) => m.id !== monthId);
    setMonths(updatedMonths);
    saveMonths(updatedMonths);

    const updatedMonthlyPayments = monthlyPayments.filter((p) => p.monthId !== monthId);
    setMonthlyPayments(updatedMonthlyPayments);
    saveMonthlyPayments(updatedMonthlyPayments);

    if (activeMonthId === monthId) {
      setActiveMonthId(updatedMonths[updatedMonths.length - 1].id);
    }

    showToast(lang === 'bn' ? 'মাসিক হিসাব মুছে ফেলা হয়েছে' : 'Month record deleted');
  };

  const handleSaveMonthlyPayment = (updated: MonthlyPayment) => {
    const updatedList = monthlyPayments.map((p) => (p.id === updated.id ? updated : p));
    if (!monthlyPayments.some((p) => p.id === updated.id)) {
      updatedList.push(updated);
    }
    setMonthlyPayments(updatedList);
    saveMonthlyPayments(updatedList);
    setMonthlyPaymentTarget(null);
    showToast(lang === 'bn' ? 'মাসিক চাঁদা সংরক্ষিত হয়েছে' : 'Monthly fee record updated');
  };

  // Sonsoy / Savings Fund Handlers
  const handleSaveSavingsDeposit = (deposit: SavingsDeposit) => {
    const existing = savingsDeposits.find((s) => s.id === deposit.id);
    const updated = existing
      ? savingsDeposits.map((s) => (s.id === deposit.id ? deposit : s))
      : [deposit, ...savingsDeposits];
    setSavingsDeposits(updated);
    saveSavingsDeposits(updated);
    setSavingsModalConfig(null);
    showToast(
      lang === 'bn'
        ? deposit.type === 'DEPOSIT'
          ? 'সঞ্চয় জমা সফল হয়েছে! 🏦'
          : 'সঞ্চয় উত্তোলন সফল হয়েছে'
        : 'Savings transaction recorded'
    );
  };

  const handleDeleteSavings = (savingsId: string) => {
    const updated = savingsDeposits.filter((s) => s.id !== savingsId);
    setSavingsDeposits(updated);
    saveSavingsDeposits(updated);
    showToast(lang === 'bn' ? 'সঞ্চয় লেনদেন মুছে ফেলা হয়েছে' : 'Savings entry deleted');
  };

  // Reset Demo Data
  const handleResetDemo = () => {
    resetToDefaultData();
    setClubSettings(loadClubSettings());
    setSeasons(loadSeasons());
    setWeeks(loadWeeks());
    setMonths(loadMonths());
    setMembers(loadMembers());
    setPayments(loadPayments());
    setMonthlyPayments(loadMonthlyPayments());
    setSavingsDeposits(loadSavingsDeposits());
    setExpenses(loadExpenses());
    setTournaments(loadTournaments());
    setPicnics(loadPicnics());
    setFunds(loadCustomFunds());
    setFundContributions(loadFundContributions());
    setFundExpenses(loadFundExpenses());
    showToast(lang === 'bn' ? 'নমুনা ডেটা রিসেট হয়েছে' : 'Sample database reloaded');
  };

  const getAllClubData = () => ({
    clubSettings,
    seasons,
    members,
    weeks,
    months,
    payments,
    monthlyPayments,
    savingsDeposits,
    expenses,
    tournaments,
    picnics,
    customFunds: funds,
    fundContributions,
    fundExpenses,
    leaderboardAwards,
    adminProfile,
  });

  const handleRestoreClubData = (data: any, notifyToast: boolean = true) => {
    if (data.clubSettings) {
      setClubSettings(data.clubSettings);
      saveClubSettings(data.clubSettings);
    }
    if (data.adminProfile) {
      setAdminProfile(data.adminProfile);
      saveAdminProfile(data.adminProfile);
    }
    if (data.members) {
      setMembers(data.members);
      saveMembers(data.members);
    }
    if (data.seasons) {
      setSeasons(data.seasons);
      saveSeasons(data.seasons);
    }
    if (data.weeks) {
      setWeeks(data.weeks);
      saveWeeks(data.weeks);
    }
    if (data.months) {
      setMonths(data.months);
      saveMonths(data.months);
    }
    if (data.payments) {
      setPayments(data.payments);
      savePayments(data.payments);
    }
    if (data.monthlyPayments) {
      setMonthlyPayments(data.monthlyPayments);
      saveMonthlyPayments(data.monthlyPayments);
    }
    if (data.savingsDeposits) {
      setSavingsDeposits(data.savingsDeposits);
      saveSavingsDeposits(data.savingsDeposits);
    }
    if (data.expenses) {
      setExpenses(data.expenses);
      saveExpenses(data.expenses);
    }
    if (data.tournaments) {
      setTournaments(data.tournaments);
      saveTournaments(data.tournaments);
    }
    if (data.picnics) {
      setPicnics(data.picnics);
      savePicnics(data.picnics);
    }
    if (data.customFunds) {
      setFunds(data.customFunds);
      saveCustomFunds(data.customFunds);
    }
    if (data.fundContributions) {
      setFundContributions(data.fundContributions);
      saveFundContributions(data.fundContributions);
    }
    if (data.fundExpenses) {
      setFundExpenses(data.fundExpenses);
      saveFundExpenses(data.fundExpenses);
    }
    if (data.leaderboardAwards) {
      setLeaderboardAwards(data.leaderboardAwards);
      saveLeaderboardAwards(data.leaderboardAwards);
    }
    if (notifyToast) {
      showToast(lang === 'bn' ? 'ফায়ারবেস থেকে সব ডাটা রিস্টোর হয়েছে' : 'Data restored from Firebase');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 animate-fade-in border border-slate-700 dark:border-slate-300">
          <span>🏸</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        isDark={isDark}
        onToggleDark={handleToggleDark}
        isAdmin={isAdmin}
        currentSubAdmin={currentSubAdmin}
        currentLoggedInMember={currentLoggedInMember}
        onToggleAdmin={handleToggleAdmin}
        onLogoutSubAdmin={handleLogoutSubAdmin}
        onLogoutMember={handleLogoutMember}
        onOpenAuth={handleOpenAuth}
        onOpenMemberProfile={(m) => setSelectedMemberProfile(m)}
        activeSeason={activeSeason}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
        clubSettings={clubSettings}
        onOpenIdSearch={() => setShowIdSearchModal(true)}
        onOpenFirebase={isAdmin ? () => setShowFirebaseModal(true) : undefined}
        onOpenShare={() => setShowShareModal(true)}
        onOpenAdminProfile={() => setShowAdminProfileModal(true)}
        onNavigateToSettings={() => setActiveTab('settings')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 pt-4 pb-20">
        {activeTab === 'dashboard' && (
          <DashboardView
            season={activeSeason}
            members={members}
            weeks={weeks}
            payments={payments}
            expenses={expenses}
            activeWeek={activeWeek}
            lang={lang}
            isAdmin={isAdmin}
            clubSettings={clubSettings}
            savingsDeposits={savingsDeposits}
            tournaments={tournaments}
            funds={funds}
            fundContributions={fundContributions}
            fundExpenses={fundExpenses}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectMember={(m) => setSelectedMemberProfile(m)}
            onOpenReceipt={(m, p, w) => setReceiptTarget({ member: m, payment: p, week: w })}
            onOpenAddExpense={() => setShowAddExpenseModal(true)}
            onOpenIdSearch={() => setShowIdSearchModal(true)}
            onOpenShare={() => setShowShareModal(true)}
            onOpenSignUp={() => handleOpenAuth('signup')}
            adminProfile={adminProfile}
            onOpenAdminProfile={() => setShowAdminProfileModal(true)}
          />
        )}

        {activeTab === 'members' && (
          <MembersView
            members={members}
            payments={payments}
            weeks={weeks}
            activeWeek={activeWeek}
            lang={lang}
            isAdmin={canManageMembers}
            onSelectMember={(m) => setSelectedMemberProfile(m)}
            onUpdatePayment={(m, p) =>
              setPaymentEditTarget({ member: m, payment: p, week: activeWeek })
            }
            onQuickMark={handleQuickMark}
            onOpenReceipt={(m, p, w) => setReceiptTarget({ member: m, payment: p, week: w })}
            onOpenAddMember={() => setShowAddMemberModal(true)}
            onDeleteMember={handleDeleteMember}
            onOpenIdSearch={() => setShowIdSearchModal(true)}
            onOpenSignUp={() => handleOpenAuth('signup')}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            awards={leaderboardAwards}
            members={members}
            isAdmin={canManageStars}
            onSaveAward={handleSaveAward}
            onDeleteAward={handleDeleteAward}
            onSelectMemberForSearch={(code) => {
              setShowIdSearchModal(true);
            }}
            isBangla={lang === 'bn'}
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyCollectionView
            season={activeSeason}
            weeks={weeks}
            months={months}
            payments={payments}
            monthlyPayments={monthlyPayments}
            savingsDeposits={savingsDeposits}
            members={members}
            activeWeekId={activeWeekId}
            activeMonthId={activeMonthId}
            lang={lang}
            isAdmin={canManageCollection}
            onSelectWeek={(wId) => {
              setActiveWeekId(wId);
              setActiveTab('members');
            }}
            onSelectMonth={(mId) => {
              setActiveMonthId(mId);
            }}
            onOpenCreateWeek={() => setShowCreateWeekModal(true)}
            onOpenCreateMonth={() => setShowCreateMonthModal(true)}
            onDeleteWeek={handleDeleteWeek}
            onDeleteMonth={handleDeleteMonth}
            onOpenMonthlyPaymentModal={(payment, month, member) =>
              setMonthlyPaymentTarget({ payment, month, member })
            }
            onOpenAddSavings={(memberId) =>
              setSavingsModalConfig({ isOpen: true, defaultMemberId: memberId })
            }
            onDeleteSavings={handleDeleteSavings}
          />
        )}

        {activeTab === 'funds' && (
          <FundsView
            funds={funds}
            contributions={fundContributions}
            expenses={fundExpenses}
            members={members}
            isAdmin={canManageFunds}
            lang={lang}
            onSaveFunds={handleSaveFunds}
            onSaveContributions={handleSaveFundContributions}
            onSaveExpenses={handleSaveFundExpenses}
            onOpenPinModal={() => handleOpenAuth('admin')}
          />
        )}

        {activeTab === 'tournament' && (
          <TournamentView
            tournaments={tournaments}
            lang={lang}
            isAdmin={canManageTournaments}
            onSaveTournament={handleSaveTournament}
            onDeleteTournament={handleDeleteTournament}
            onUpdateTournaments={handleUpdateTournaments}
          />
        )}

        {activeTab === 'picnic' && (
          <PicnicView
            picnics={picnics}
            lang={lang}
            isAdmin={canManagePicnic}
            onSavePicnic={handleSavePicnic}
            onDeletePicnic={handleDeletePicnic}
            onUpdatePicnics={handleUpdatePicnics}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            lang={lang}
            isAdmin={canManageExpenses}
            onOpenAddExpense={() => setShowAddExpenseModal(true)}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            season={activeSeason}
            members={members}
            weeks={weeks}
            payments={payments}
            expenses={expenses}
            activeWeek={activeWeek}
            lang={lang}
            funds={funds}
            fundContributions={fundContributions}
            fundExpenses={fundExpenses}
          />
        )}

        {activeTab === 'season' && (
          <SeasonView
            seasons={seasons}
            activeSeason={activeSeason}
            lang={lang}
            isAdmin={isAdmin}
            onSelectSeason={(s) => setActiveSeasonId(s.id)}
            onOpenCreateSeason={() => setShowCreateSeasonModal(true)}
          />
        )}

        {activeTab === 'settings' && (
          isAdmin ? (
            <SettingsView
              lang={lang}
              onToggleLang={handleToggleLang}
              isDark={isDark}
              onToggleDark={handleToggleDark}
              isAdmin={isAdmin}
              onToggleAdmin={handleToggleAdmin}
              onOpenPinModal={() => handleOpenAuth('admin')}
              onOpenChangePassword={() => setShowChangePasswordModal(true)}
              onResetDemo={handleResetDemo}
              clubSettings={clubSettings}
              onUpdateClubSettings={handleUpdateClubSettings}
              onOpenFirebaseModal={isAdmin ? () => setShowFirebaseModal(true) : undefined}
              adminProfile={adminProfile}
              onOpenAdminProfile={() => setShowAdminProfileModal(true)}
            />
          ) : currentLoggedInMember ? (
            <MemberSettingsView
              member={currentLoggedInMember}
              payments={payments}
              monthlyPayments={monthlyPayments}
              savingsDeposits={savingsDeposits}
              fundContributions={fundContributions}
              funds={funds}
              lang={lang}
              onToggleLang={handleToggleLang}
              isDark={isDark}
              onToggleDark={handleToggleDark}
              onUpdateMember={handleUpdateMember}
              onLogout={handleLogoutMember}
              onOpenReceipt={(payment) => {
                const week = weeks.find((w) => w.id === payment.weekId) || weeks[0];
                setReceiptTarget({
                  member: currentLoggedInMember,
                  payment,
                  week,
                });
              }}
            />
          ) : (
            /* Anonymous Visitor trying to access settings */
            <div className="max-w-md mx-auto my-12 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-sm">
                ⚙️
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {lang === 'bn' ? 'সেটিংস ও প্রোফাইল' : 'Settings & Profile'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                {lang === 'bn'
                  ? 'আপনার ব্যক্তিগত প্রোফাইল ও সেটিংস দেখতে অনুগ্রহ করে সাইন ইন বা লগইন করুন।'
                  : 'Please sign in or log in to view and manage your personal profile and settings.'}
              </p>
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenAuth('login')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>🔑</span>
                  <span>{lang === 'bn' ? 'সাইন ইন / লগইন করুন' : 'Sign In / Log In'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAuth('signup')}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                >
                  {lang === 'bn' ? '✨ নতুন মেম্বার সাইন-আপ' : 'New Member Sign Up'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {lang === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Bottom Tab Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        lang={lang}
        isAdmin={isAdmin}
        isLoggedIn={Boolean(currentLoggedInMember)}
        memberName={currentLoggedInMember?.name}
      />

      {/* Modals */}
      {receiptTarget && (
        <ReceiptModal
          member={receiptTarget.member}
          payment={receiptTarget.payment}
          week={receiptTarget.week}
          lang={lang}
          clubSettings={clubSettings}
          onClose={() => setReceiptTarget(null)}
        />
      )}

      {paymentEditTarget && (
        <PaymentModal
          member={paymentEditTarget.member}
          payment={paymentEditTarget.payment}
          week={paymentEditTarget.week}
          lang={lang}
          onSave={handleSavePayment}
          onClose={() => setPaymentEditTarget(null)}
        />
      )}

      {selectedMemberProfile && (
        <MemberProfileModal
          member={selectedMemberProfile}
          payments={payments}
          weeks={weeks}
          savingsDeposits={savingsDeposits}
          funds={funds}
          fundContributions={fundContributions}
          lang={lang}
          isAdmin={isAdmin}
          onClose={() => setSelectedMemberProfile(null)}
          onOpenReceipt={(pay) => {
            const week = weeks.find((w) => w.id === pay.weekId) || activeWeek;
            setReceiptTarget({ member: selectedMemberProfile, payment: pay, week });
          }}
          onDeleteMember={handleDeleteMember}
          onOpenAddSavings={(mId) => setSavingsModalConfig({ isOpen: true, defaultMemberId: mId })}
          onUpdateMember={handleUpdateMember}
        />
      )}

      {showPinModal && (
        <AdminPinModal
          lang={lang}
          onSuccess={handleAdminSuccess}
          onClose={() => setShowPinModal(false)}
          onOpenChangePassword={() => setShowChangePasswordModal(true)}
        />
      )}

      {showAddExpenseModal && (
        <AddExpenseModal
          lang={lang}
          seasonId={activeSeason.id}
          onSave={handleSaveExpense}
          onClose={() => setShowAddExpenseModal(false)}
        />
      )}

      {showAddMemberModal && (
        <AddMemberModal
          lang={lang}
          existingMembers={members}
          onSave={handleSaveMember}
          onClose={() => setShowAddMemberModal(false)}
        />
      )}

      {showIdSearchModal && (
        <MemberIdSearchModal
          isOpen={showIdSearchModal}
          onClose={() => setShowIdSearchModal(false)}
          members={members}
          weeks={weeks}
          months={months}
          payments={payments}
          monthlyPayments={monthlyPayments}
          savingsDeposits={savingsDeposits}
          customFunds={funds}
          fundContributions={fundContributions}
          leaderboardAwards={leaderboardAwards}
          activeWeekId={activeWeekId}
          activeMonthId={activeMonthId}
          onUpdateMember={handleUpdateMember}
          isBangla={lang === 'bn'}
        />
      )}

      {showCreateWeekModal && (
        <CreateWeekModal
          lang={lang}
          nextWeekNumber={weeks.length + 1}
          seasonId={activeSeason.id}
          defaultTarget={activeSeason.weeklyTarget}
          onSave={handleSaveWeek}
          onClose={() => setShowCreateWeekModal(false)}
        />
      )}

      {showCreateMonthModal && (
        <CreateMonthModal
          lang={lang}
          seasonId={activeSeason.id}
          defaultTarget={
            (clubSettings.defaultMonthlyFee || 1400) * (members.length || 1)
          }
          onSave={handleSaveMonth}
          onClose={() => setShowCreateMonthModal(false)}
        />
      )}

      {monthlyPaymentTarget && (
        <MonthlyPaymentModal
          member={monthlyPaymentTarget.member}
          payment={monthlyPaymentTarget.payment}
          month={monthlyPaymentTarget.month}
          lang={lang}
          onSave={handleSaveMonthlyPayment}
          onClose={() => setMonthlyPaymentTarget(null)}
        />
      )}

      {savingsModalConfig?.isOpen && (
        <AddSavingsModal
          members={members}
          savingsDeposits={savingsDeposits}
          lang={lang}
          defaultMemberId={savingsModalConfig.defaultMemberId}
          seasonId={activeSeason.id}
          onSave={handleSaveSavingsDeposit}
          onClose={() => setSavingsModalConfig(null)}
        />
      )}

      {showCreateSeasonModal && (
        <CreateSeasonModal
          lang={lang}
          onSave={handleSaveSeason}
          onClose={() => setShowCreateSeasonModal(false)}
        />
      )}

      {isAdmin && showFirebaseModal && (
        <FirebaseModal
          isOpen={showFirebaseModal}
          onClose={() => setShowFirebaseModal(false)}
          lang={lang}
          getAllClubData={getAllClubData}
          onRestoreClubData={handleRestoreClubData}
          isAdmin={isAdmin}
        />
      )}

      {showShareModal && (
        <SharePublicModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          lang={lang}
          clubName={lang === 'bn' && clubSettings.clubNameBangla ? clubSettings.clubNameBangla : clubSettings.clubName}
        />
      )}

      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          lang={lang}
          onSuccess={() => {
            showToast(lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে! 🔑' : 'Admin Password Saved! 🔑');
          }}
        />
      )}

      {showAdminProfileModal && (
        <AdminProfileModal
          isOpen={showAdminProfileModal}
          onClose={() => setShowAdminProfileModal(false)}
          profile={adminProfile}
          onSaveProfile={handleSaveAdminProfile}
          isAdmin={isAdmin}
          lang={lang}
        />
      )}

      {showMemberAuthModal && (
        <MemberAuthModal
          isOpen={showMemberAuthModal}
          onClose={() => {
            setShowMemberAuthModal(false);
            try {
              if (
                window.location.pathname.toLowerCase().endsWith('/admin') ||
                window.location.pathname.toLowerCase().endsWith('/admin/') ||
                window.location.hash.toLowerCase().includes('admin')
              ) {
                window.history.replaceState({}, '', '/');
              }
            } catch {
              // ignore
            }
          }}
          initialTab={memberAuthInitialTab}
          members={members}
          clubSettings={clubSettings}
          lang={lang}
          onSignUp={handleSaveMember}
          onLoginSuccess={handleMemberLoginSuccess}
          onAdminSuccess={handleAdminSuccess}
          onOpenChangePassword={() => setShowChangePasswordModal(true)}
          onOpenMemberProfile={(m) => setSelectedMemberProfile(m)}
        />
      )}
    </div>
  );
};
export default App;
