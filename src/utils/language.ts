export type Language = 'bn' | 'en';

const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaDigits(input: string | number): string {
  return input
    .toString()
    .replace(/[0-9]/g, (match) => banglaDigits[parseInt(match, 10)]);
}

export function formatCurrency(amount: number, isBangla: boolean = true): string {
  const formatted = Math.round(amount).toLocaleString('en-IN');
  if (isBangla) {
    return `৳${toBanglaDigits(formatted)}`;
  }
  return `৳${formatted}`;
}

export function formatNumber(num: number, isBangla: boolean = true): string {
  if (isBangla) {
    return toBanglaDigits(num);
  }
  return num.toString();
}

export function formatDate(dateStr?: string): string {
  if (dateStr) return dateStr;
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export const translations = {
  en: {
    app_title: 'Badminton Club Fund Manager',
    club_subtitle: 'Smashers Badminton Club • Dhaka',
    role_admin: 'Admin Mode',
    role_viewer: 'Member / Viewer',
    switch_role: 'Switch Role',
    admin_pin_title: 'Enter Admin PIN',
    admin_pin_hint: 'Default PIN is 1234',
    admin_pin_error: 'Incorrect PIN! Try 1234',
    unlock: 'Unlock Admin',
    cancel: 'Cancel',
    save: 'Save Changes',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add New',
    close: 'Close',
    search_member: 'Search member by name or phone...',

    // Navigation
    nav_dashboard: 'Dashboard',
    nav_members: 'Members',
    nav_weekly: 'Weekly',
    nav_funds: 'Funds & Projects',
    nav_tournament: 'Tournaments',
    nav_picnic: 'Picnic & Tours',
    nav_expenses: 'Expenses',
    nav_reports: 'Reports',
    nav_leaderboard: 'Hall of Fame',
    nav_season: 'Season',
    nav_settings: 'Settings',
    delete_week: 'Delete Week',
    delete_member: 'Remove Member',
    club_name_settings: 'Club Identity & Name',
    change_club_name: 'Change Club Name',
    tournament_title: 'Tournament Management',
    picnic_title: 'Picnic Management & Tour Booking',

    // Member Age Categories (বাচ্চা, কিশোর, যুবক)
    member_category: 'Member Age Group',
    category_child: 'Child / Junior (বাচ্চা) 🧒',
    category_teen: 'Teen / Adolescent (কিশোর) 🧑‍🦱',
    category_youth: 'Youth / Senior (যুবক) 👨‍🦱',
    participate_sports: 'Participates in Sports & Game Fees',
    participate_sports_hint: 'If unchecked, member pays 0 game fee (Funding/Patron member only)',
    participation_type: 'Participation Mode',
    part_sports_only: 'Sports Only 🏸',
    part_funds_only: 'Funding Only 🏛️',
    part_both: 'Both Sports & Funds 🌟',

    // Funds Management
    funds_title: 'Club & Special Funds Management',
    funds_subtitle: 'Manage multi-purpose funds: Medical, Club Development, Eid, Welfare & Donations',
    create_fund: 'Create New Fund',
    fund_name: 'Fund Title',
    fund_category: 'Category',
    fund_target: 'Target Goal',
    fund_balance: 'Net Fund Balance',
    fund_disbursed: 'Disbursed / Spent',
    fund_collected: 'Collected Fund',
    fund_members: 'Subscribed Members',
    collect_fund_tk: 'Collect Contribution',
    disburse_fund_tk: 'Disburse / Spend',
    enroll_members: 'Enroll Members',
    all_control_title: 'Smart All-Control Demographics',

    // Sports
    sport_badminton: 'Badminton 🏸',
    sport_cricket: 'Cricket 🏏',
    sport_football: 'Football ⚽',
    sport_multi: 'All Sports 🏆',
    select_sport: 'Club Primary Sport',
    sport_filter: 'Filter by Sport',

    // Collections & Sonsoy (Savings)
    collection_mode: 'Collection Frequency',
    type_weekly: 'Weekly Only',
    type_monthly: 'Monthly Only',
    type_both: 'Weekly & Monthly Sonsoy',
    tab_weekly: 'Weekly Fund',
    tab_monthly: 'Monthly Fund',
    tab_savings: 'Sonsoy / Savings Vault',
    deposit_savings: 'Deposit Savings',
    total_savings_fund: 'Total Club Savings Vault',
    member_savings_balance: 'Member Savings Balance',
    monthly_target: 'Monthly Target',
    monthly_collected: 'Collected This Month',
    create_month: 'Create New Month',
    sonsoy_records: 'Sonsoy / Savings History',
    sonsoy_subtitle: 'Monthly personal savings pool & emergency welfare fund',
    monthly_amount: 'Monthly Fee',
    monthly_records: 'Monthly Collection Records',

    // Dashboard metrics
    total_members: 'Total Members',
    weekly_target: 'Weekly Collection Target',
    collected_this_week: 'Amount Collected This Week',
    amount_remaining: 'Amount Remaining',
    total_due: 'Total Outstanding Due',
    total_expenses: 'Total Expenses',
    current_balance: 'Current Balance',
    season_collection: 'Season Total Collection',
    target_progress: 'Weekly Target Progress',
    completed: 'Completed',
    calc_formula: 'Current Balance = Total Collection - Total Expenses',

    // Statuses
    status_paid: 'Paid',
    status_partial: 'Partial',
    status_unpaid: 'Unpaid',
    filter_all: 'All',

    // Member Payment Table
    member_name: 'Member Name',
    weekly_amount: 'Weekly Amount',
    paid_amount: 'Paid Amount',
    due_amount: 'Due Amount',
    payment_status: 'Payment Status',
    payment_date: 'Payment Date',
    payment_method: 'Payment Method',
    actions: 'Actions',
    mark_paid: 'Mark Paid',
    mark_partial: 'Partial Payment',
    mark_unpaid: 'Mark Unpaid',

    // Weekly Collection
    weekly_records: 'Weekly Collection Records',
    create_week: 'Create New Week',
    paid_members: 'Paid Members',
    unpaid_members: 'Unpaid Members',
    target: 'Target',
    collected: 'Collected',
    remaining: 'Remaining',

    // Member Profile
    profile_title: 'Member Profile & History',
    joining_date: 'Joining Date',
    total_contribution: 'Total Contribution',
    current_due: 'Current Due',
    paid_weeks: 'Paid Weeks',
    missed_weeks: 'Missed Weeks',
    payment_history: 'Payment History',
    send_whatsapp: 'Send WhatsApp Reminder',
    view_receipt: 'Payment Receipt',
    add_member: 'Add Member',
    phone: 'Phone Number',
    role: 'Club Role',

    // Expenses
    expenses_title: 'Expense Management',
    add_expense: 'Add Expense',
    category: 'Category',
    description: 'Description',
    amount: 'Amount',
    added_by: 'Added By',
    date: 'Date',

    cat_court: 'Court Rent',
    cat_shuttle: 'Shuttlecock',
    cat_light: 'Lighting / Electricity',
    cat_tourney: 'Tournament',
    cat_equip: 'Equipment',
    cat_food: 'Food / Drinks',
    cat_other: 'Other',

    // Reports
    reports_title: 'Financial Reports',
    rep_this_week: 'This Week',
    rep_this_month: 'This Month',
    rep_entire_season: 'Entire Season',
    rep_leaderboard: 'Contribution Leaderboard',
    share_report: 'Share Financial Report',
    expense_breakdown: 'Expense Breakdown by Category',

    // Seasons
    season_management: 'Season Management',
    active_season: 'Active Season',
    archived_seasons: 'Archived Seasons (Read-Only)',
    create_season: 'Start New Season',
    season_name: 'Season Name (e.g. Badminton Season 2027)',

    // Settings
    settings_title: 'Settings & Preferences',
    lang_toggle: 'Language',
    dark_mode: 'Dark Mode',
    shared_link: 'Share Live Dashboard Link',
    shared_link_desc: 'All members can view live financials without edit permission',
    reset_data: 'Reset Sample Data',
    reset_desc: 'Restore fresh realistic club dataset'
  },
  bn: {
    app_title: 'ব্যাডমিন্টন ক্লাব ফান্ড ম্যানেজার',
    club_subtitle: 'স্ম্যাশার্স ব্যাডমিন্টন ক্লাব • ঢাকা',
    role_admin: 'অ্যাডমিন মোড',
    role_viewer: 'সদস্য / ভিউয়ার মোড',
    switch_role: 'রোল পরিবর্তন',
    admin_pin_title: 'অ্যাডমিন পিন দিন',
    admin_pin_hint: 'ডিফল্ট পিন: 1234',
    admin_pin_error: 'ভুল পিন! 1234 দিয়ে চেষ্টা করুন',
    unlock: 'অ্যাডমিন আনলক',
    cancel: 'বাতিল',
    save: 'সংরক্ষণ করুন',
    delete: 'মুছুন',
    edit: 'সম্পাদনা',
    add: 'নতুন যুক্ত করুন',
    close: 'বন্ধ করুন',
    search_member: 'নাম বা ফোন নম্বর দিয়ে খুঁজুন...',

    // Navigation
    nav_dashboard: 'ড্যাশবোর্ড',
    nav_members: 'সদস্যগণ',
    nav_weekly: 'সাপ্তাহিক',
    nav_funds: 'বিশেষ ফান্ডিং',
    nav_tournament: 'টুর্নামেন্ট',
    nav_picnic: 'পিকনিক ও ট্যুর',
    nav_expenses: 'খরচসমূহ',
    nav_reports: 'রিপোর্ট',
    nav_leaderboard: 'সেরা তারকা 🏆',
    nav_season: 'সিজন',
    nav_settings: 'সেটিংস',
    delete_week: 'সপ্তাহ মুছে ফেলুন',
    delete_member: 'সদস্য অপসারণ',
    club_name_settings: 'ক্লাবের নাম ও বিবরণ',
    change_club_name: 'ক্লাবের নাম পরিবর্তন করুন',
    tournament_title: 'টুর্নামেন্ট বুকিং ও ম্যানেজমেন্ট',
    picnic_title: 'পিকনিক ম্যানেজমেন্ট ও বুকিং',

    // Member Age Categories (বাচ্চা, কিশোর, যুবক)
    member_category: 'সদস্যের বয়স ক্যাটাগরি',
    category_child: 'বাচ্চা (শিশু/জুনিয়র) 🧒',
    category_teen: 'কিশোর (বয়ঃসন্ধি) 🧑‍🦱',
    category_youth: 'যুবক (তরুণ/সিনিয়র) 👨‍🦱',
    participate_sports: 'খেলাধুলায় অংশগ্রহণ ও খেলার চাঁদা দেয়',
    participate_sports_hint: 'টিক উঠিয়ে দিলে খেলার কোনো ফি ধার্য হবে না (শুধু ক্লাবের ফান্ডিং/পৃষ্ঠপোষক সদস্য)',
    participation_type: 'অংশগ্রহণের ধরন',
    part_sports_only: 'শুধু খেলার চাঁদা 🏸',
    part_funds_only: 'শুধু ফান্ডিং দাতা 🏛️',
    part_both: 'উভয়টি (খেলা ও ফান্ডিং) 🌟',

    // Funds Management
    funds_title: 'ক্লাব ও সামাজিক ফান্ড ম্যানেজমেন্ট',
    funds_subtitle: 'খেলাধুলো ছাড়াও চিকিৎসা, ঘর সংস্কার, ঈদ উপহার ও যেকোনো বিশেষ ফান্ড ট্র্যাকিং',
    create_fund: 'নতুন ফান্ড তৈরি করুন',
    fund_name: 'ফান্ডের নাম ও উদ্দেশ্য',
    fund_category: 'ফান্ডের ক্যাটাগরি',
    fund_target: 'লক্ষ্যমাত্রা (টার্গেট)',
    fund_balance: 'ফান্ডে অবশিষ্ট ব্যালেন্স',
    fund_disbursed: 'বিতরণ / খরচ',
    fund_collected: 'মোট সংগৃহীত চাঁদা',
    fund_members: 'যুক্ত সদস্য সংখ্যা',
    collect_fund_tk: 'ফান্ডে টাকা জমা নিন',
    disburse_fund_tk: 'ফান্ড থেকে ব্যয়/বিতরণ',
    enroll_members: 'সদস্য যুক্ত করুন',
    all_control_title: 'স্মার্ট অল-কন্ট্রোল ও সদস্য বিন্যাস',

    // Sports
    sport_badminton: 'ব্যাডমিন্টন 🏸',
    sport_cricket: 'ক্রিকেট 🏏',
    sport_football: 'ফুটবল ⚽',
    sport_multi: 'সকল খেলা (মাল্টি-স্পোর্টস) 🏆',
    select_sport: 'ক্লাবের মূল খেলা',
    sport_filter: 'খেলা অনুযায়ী ফিল্টার',

    // Collections & Sonsoy (Savings)
    collection_mode: 'সংগ্রহের ধরন',
    type_weekly: 'শুধু সাপ্তাহিক',
    type_monthly: 'শুধু মাসিক',
    type_both: 'সাপ্তাহিক ও মাসিক সঞ্চয়',
    tab_weekly: 'সাপ্তাহিক ফান্ড',
    tab_monthly: 'মাসিক ফান্ড',
    tab_savings: 'মাসিক সঞ্চয় খাতা (Sonsoy)',
    deposit_savings: 'সঞ্চয় জমা নিন',
    total_savings_fund: 'ক্লাবের মোট সঞ্চয় তহবিল (ভল্ট)',
    member_savings_balance: 'সদস্যের মোট সঞ্চয় স্থিতি',
    monthly_target: 'মাসিক লক্ষ্যমাত্রা',
    monthly_collected: 'চলতি মাসে সংগৃহীত',
    create_month: 'নতুন মাস যুক্ত করুন',
    sonsoy_records: 'মাসিক সঞ্চয় ও ডিপিএস খাতা',
    sonsoy_subtitle: 'সদস্যদের ব্যক্তিগত সঞ্চয় আমানত ও জরুরি কল্যাণ ফান্ড ট্র্যাকিং',
    monthly_amount: 'মাসিক ফি',
    monthly_records: 'মাসিক সংগ্রহের ইতিহাস',

    // Dashboard metrics
    total_members: 'মোট সদস্য',
    weekly_target: 'সাপ্তাহিক সংগ্রহের লক্ষ্যমাত্রা',
    collected_this_week: 'চলতি সপ্তাহে সংগৃহীত',
    amount_remaining: 'অবশিষ্ট বাকি',
    total_due: 'সর্বমোট বকেয়া',
    total_expenses: 'সর্বমোট খরচ',
    current_balance: 'বর্তমান ব্যালেন্স (তহবিল)',
    season_collection: 'সিজনের মোট সংগ্রহ',
    target_progress: 'সাপ্তাহিক টার্গেট অগ্রগতি',
    completed: 'সম্পন্ন',
    calc_formula: 'বর্তমান ব্যালেন্স = মোট সংগ্রহ - সর্বমোট খরচ',

    // Statuses
    status_paid: 'পরিশোধিত',
    status_partial: 'আংশিক',
    status_unpaid: 'বকেয়া',
    filter_all: 'সকল',

    // Member Payment Table
    member_name: 'সদস্যের নাম',
    weekly_amount: 'সাপ্তাহিক ফি',
    paid_amount: 'পরিশোধিত',
    due_amount: 'বকেয়া',
    payment_status: 'পেমেন্ট স্ট্যাটাস',
    payment_date: 'পেমেন্টের তারিখ',
    payment_method: 'পেমেন্ট মাধ্যম',
    actions: 'অ্যাকশন',
    mark_paid: 'পরিশোধ চিহ্নিত',
    mark_partial: 'আংশিক পেমেন্ট',
    mark_unpaid: 'বকেয়া চিহ্নিত',

    // Weekly Collection
    weekly_records: 'সাপ্তাহিক সংগ্রহের ইতিহাস',
    create_week: 'নতুন সপ্তাহ তৈরি',
    paid_members: 'পরিশোধিত সদস্য',
    unpaid_members: 'বকেয়া সদস্য',
    target: 'টার্গেট',
    collected: 'সংগৃহীত',
    remaining: 'বাকি',

    // Member Profile
    profile_title: 'সদস্যের প্রোফাইল ও ইতিহাস',
    joining_date: 'যোগদানের তারিখ',
    total_contribution: 'মোট অবদান',
    current_due: 'বর্তমান বকেয়া',
    paid_weeks: 'পরিশোধিত সপ্তাহ',
    missed_weeks: 'বকেয়া/অনুপস্থিত সপ্তাহ',
    payment_history: 'পেমেন্ট ইতিহাস',
    send_whatsapp: 'হোয়াটসঅ্যাপে তাগাদা পাঠান',
    view_receipt: 'পেমেন্ট রশিদ',
    add_member: 'নতুন সদস্য যুক্ত করুন',
    phone: 'মোবাইল নম্বর',
    role: 'ক্লাব পদবী',

    // Expenses
    expenses_title: 'খরচ ব্যবস্থাপনা',
    add_expense: 'নতুন খরচ যুক্ত করুন',
    category: 'ক্যাটেগরি',
    description: 'বিবরণ',
    amount: 'টাকার পরিমাণ',
    added_by: 'যুক্ত করেছেন',
    date: 'তারিখ',

    cat_court: 'কোর্ট ভাড়া',
    cat_shuttle: 'শাটলকক / ফেদার',
    cat_light: 'বিদ্যুৎ ও লাইটিং',
    cat_tourney: 'টুর্নামেন্ট',
    cat_equip: 'সরঞ্জাম ও নেট',
    cat_food: 'নাস্তা ও রিফ্রেশমেন্ট',
    cat_other: 'অন্যান্য',

    // Reports
    reports_title: 'আর্থিক হিসাব ও প্রতিবেদন',
    rep_this_week: 'চলতি সপ্তাহ',
    rep_this_month: 'চলতি মাস',
    rep_entire_season: 'পুরো সিজন',
    rep_leaderboard: 'সর্বোচ্চ অবদানকারী লিডারবোর্ড',
    share_report: 'আর্থিক রিপোর্ট শেয়ার করুন',
    expense_breakdown: 'খাতভিত্তিক খরচের অনুপাত',

    // Seasons
    season_management: 'সিজন ব্যবস্থাপনা',
    active_season: 'বর্তমান সক্রিয় সিজন',
    archived_seasons: 'পূর্ববর্তী সিজনসমূহ (আর্কাইভ)',
    create_season: 'নতুন সিজন শুরু করুন',
    season_name: 'সিজনের নাম (যেমন: সিজন ২০২৭)',

    // Settings
    settings_title: 'সেটিংস ও পছন্দসমূহ',
    lang_toggle: 'ভাষা (Language)',
    dark_mode: 'ডার্ক মোড',
    shared_link: 'লাইভ ড্যাশবোর্ড লিংক শেয়ার করুন',
    shared_link_desc: 'ক্লাবের সকল সদস্য এডিটের অনুমতি ছাড়া লাইভ হিসাব দেখতে পারবেন',
    reset_data: 'নমুনা ডাটা পুনরায় লোড করুন',
    reset_desc: 'ফ্রেশ ও বাস্তবসম্মত ক্লাব ডাটাবেজ রিস্টোর করুন'
  }
};
