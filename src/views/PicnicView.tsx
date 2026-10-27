import React, { useState } from 'react';
import { PicnicEvent, PicnicParticipant } from '../types';
import { translations, Language, formatCurrency, formatNumber } from '../utils/language';
import {
  Palmtree,
  Plus,
  Calendar,
  MapPin,
  Users,
  Bus,
  Check,
  AlertCircle,
  Clock,
  Trash2,
  X,
  CreditCard,
  DollarSign,
  Send,
} from 'lucide-react';

interface Props {
  picnics: PicnicEvent[];
  lang: Language;
  isAdmin: boolean;
  onSavePicnic: (picnic: PicnicEvent) => void;
  onDeletePicnic: (id: string) => void;
  onUpdatePicnics: (picnics: PicnicEvent[]) => void;
}

export const PicnicView: React.FC<Props> = ({
  picnics,
  lang,
  isAdmin,
  onSavePicnic,
  onDeletePicnic,
  onUpdatePicnics,
}) => {
  const isBangla = lang === 'bn';
  const [selectedPicnicId, setSelectedPicnicId] = useState<string>(
    picnics[0]?.id || ''
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // New Picnic Event Form State
  const [title, setTitle] = useState('');
  const [titleBangla, setTitleBangla] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [feePerPerson, setFeePerPerson] = useState<number>(1200);
  const [estimatedBudget, setEstimatedBudget] = useState<number>(35000);
  const [busNumber, setBusNumber] = useState('');
  const [notes, setNotes] = useState('');

  // New Booking Form State
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('+880');
  const [membersCount, setMembersCount] = useState<number>(1);
  const [paidAmount, setPaidAmount] = useState<number>(1200);
  const [busSeat, setBusSeat] = useState('');

  const selectedPicnic =
    picnics.find((p) => p.id === selectedPicnicId) || picnics[0];

  const handleCreatePicnic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) return;

    const newPicnic: PicnicEvent = {
      id: `picnic-${Date.now()}`,
      title: title.trim(),
      titleBangla: titleBangla.trim() || undefined,
      destination: destination.trim(),
      date: date || new Date().toLocaleDateString('en-GB'),
      feePerPerson: Number(feePerPerson) || 1000,
      estimatedBudget: Number(estimatedBudget) || 20000,
      busNumber: busNumber.trim() || undefined,
      status: 'BOOKING_OPEN',
      participants: [],
      notes: notes.trim() || undefined,
    };

    onSavePicnic(newPicnic);
    setSelectedPicnicId(newPicnic.id);
    setShowAddModal(false);
    setTitle('');
    setTitleBangla('');
    setDestination('');
    setNotes('');
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPicnic || !pName.trim()) return;

    const count = Number(membersCount) || 1;
    const totalFee = count * selectedPicnic.feePerPerson;
    const paid = Number(paidAmount) || 0;

    let status: 'PAID' | 'PARTIAL' | 'UNPAID' = 'UNPAID';
    if (paid >= totalFee) status = 'PAID';
    else if (paid > 0) status = 'PARTIAL';

    const newParticipant: PicnicParticipant = {
      id: `part-${Date.now()}`,
      name: pName.trim(),
      phone: pPhone.trim() || '+880',
      membersCount: count,
      feePerPerson: selectedPicnic.feePerPerson,
      totalFee,
      paidAmount: paid,
      status,
      busSeat: busSeat.trim() || undefined,
    };

    const updated = picnics.map((p) =>
      p.id === selectedPicnic.id
        ? { ...p, participants: [...p.participants, newParticipant] }
        : p
    );

    onUpdatePicnics(updated);
    setShowBookingModal(false);
    setPName('');
    setPPhone('+880');
    setMembersCount(1);
    setPaidAmount(selectedPicnic.feePerPerson);
    setBusSeat('');
  };

  const handleUpdatePayment = (
    picnicId: string,
    participantId: string,
    paid: number
  ) => {
    const updated = picnics.map((p) => {
      if (p.id !== picnicId) return p;
      return {
        ...p,
        participants: p.participants.map((pt) => {
          if (pt.id !== participantId) return pt;
          let status: 'PAID' | 'PARTIAL' | 'UNPAID' = 'UNPAID';
          if (paid >= pt.totalFee) status = 'PAID';
          else if (paid > 0) status = 'PARTIAL';
          return {
            ...pt,
            paidAmount: paid,
            status,
          };
        }),
      };
    });
    onUpdatePicnics(updated);
  };

  const handleDeleteParticipant = (picnicId: string, participantId: string) => {
    const updated = picnics.map((p) => {
      if (p.id !== picnicId) return p;
      return {
        ...p,
        participants: p.participants.filter((pt) => pt.id !== participantId),
      };
    });
    onUpdatePicnics(updated);
  };

  const totalCollected = selectedPicnic
    ? selectedPicnic.participants.reduce((sum, pt) => sum + pt.paidAmount, 0)
    : 0;

  const totalTarget = selectedPicnic
    ? selectedPicnic.participants.reduce((sum, pt) => sum + pt.totalFee, 0)
    : 0;

  const totalPersons = selectedPicnic
    ? selectedPicnic.participants.reduce((sum, pt) => sum + pt.membersCount, 0)
    : 0;

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Palmtree className="w-6 h-6 text-emerald-600" />
            <span>{isBangla ? 'পিকনিক ও ডে-ট্যুর ম্যানেজমেন্ট' : 'Picnic Management'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBangla
              ? 'বার্ষিক পিকনিক আয়োজন, ফ্যামিলি মেম্বার বুকিং, বাস সিট ও চাঁদা কালেকশন'
              : 'Annual club picnic booking, seat allocations, fees and fund collection'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isBangla ? 'নতুন পিকনিক ইভেন্ট' : 'Create Picnic Event'}</span>
          </button>
        )}
      </div>

      {/* Picnic Selector Tabs */}
      {picnics.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {picnics.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPicnicId(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                p.id === selectedPicnic?.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {isBangla && p.titleBangla ? p.titleBangla : p.title}
            </button>
          ))}
        </div>
      )}

      {selectedPicnic ? (
        <div className="space-y-5">
          {/* Banner Card */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-emerald-800 text-white p-6 shadow-lg shadow-emerald-700/20 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 text-9xl translate-x-4 translate-y-6 pointer-events-none">
              🏖️
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white backdrop-blur-md">
                    {selectedPicnic.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-teal-100 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedPicnic.date}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  {isBangla && selectedPicnic.titleBangla
                    ? selectedPicnic.titleBangla
                    : selectedPicnic.title}
                </h3>
                <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedPicnic.destination}
                </p>
                {selectedPicnic.busNumber && (
                  <p className="text-xs text-emerald-200 mt-1 flex items-center gap-1">
                    <Bus className="w-3.5 h-3.5" />
                    {selectedPicnic.busNumber}
                  </p>
                )}
                {selectedPicnic.notes && (
                  <p className="text-xs text-emerald-200/90 mt-2 bg-black/15 px-3 py-1.5 rounded-lg max-w-xl">
                    ℹ️ {selectedPicnic.notes}
                  </p>
                )}
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20">
                <div>
                  <span className="text-[10px] text-teal-200 block uppercase tracking-wider">
                    {isBangla ? 'মাথাপিছু ফি' : 'Per Person'}
                  </span>
                  <span className="text-base font-black">
                    {formatCurrency(selectedPicnic.feePerPerson, isBangla)}
                  </span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <span className="text-[10px] text-teal-200 block uppercase tracking-wider">
                    {isBangla ? 'মোট যাত্রী' : 'Persons'}
                  </span>
                  <span className="text-base font-black text-amber-300">
                    {formatNumber(totalPersons, isBangla)}
                  </span>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <span className="text-[10px] text-teal-200 block uppercase tracking-wider">
                    {isBangla ? 'ফান্ড আদায়' : 'Collected'}
                  </span>
                  <span className="text-base font-black text-emerald-200">
                    {formatCurrency(totalCollected, isBangla)}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-4 pt-3 border-t border-white/15 flex justify-end">
                <button
                  onClick={() => {
                    if (
                      confirm(
                        isBangla
                          ? 'আপনি কি নিশ্চিত যে এই পিকনিক ইভেন্টটি মুছে ফেলতে চান?'
                          : 'Are you sure you want to delete this picnic event?'
                      )
                    ) {
                      onDeletePicnic(selectedPicnic.id);
                    }
                  }}
                  className="text-xs text-rose-200 hover:text-white flex items-center gap-1 bg-black/20 hover:bg-rose-600/60 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'পিকনিক মুছুন' : 'Delete Picnic'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Participant Booking Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>{isBangla ? 'অংশগ্রহণকারী ও সিট বুকিং' : 'Participants & Seat Bookings'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {formatNumber(selectedPicnic.participants.length, isBangla)} {isBangla ? 'টি বুকিং' : 'bookings'}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  {isBangla
                    ? 'সদস্য ও ফ্যামিলি মেম্বারদের টিকিট বুকিং ও চাঁদা'
                    : 'Track ticket reservations and fee status'}
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setPaidAmount(selectedPicnic.feePerPerson);
                    setShowBookingModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'নতুন সিট বুকিং' : 'Book Seat / Ticket'}</span>
                </button>
              )}
            </div>

            {selectedPicnic.participants.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                {isBangla
                  ? 'এখনও কোনো পিকনিক বুকিং নেই। "নতুন সিট বুকিং" বাটনে ক্লিক করে যোগ করুন।'
                  : 'No picnic bookings yet. Click "Book Seat / Ticket" to add.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold rounded-lg">
                    <tr>
                      <th className="px-3 py-2.5 rounded-l-lg">{isBangla ? 'নাম' : 'Name'}</th>
                      <th className="px-3 py-2.5">{isBangla ? 'ফোন' : 'Phone'}</th>
                      <th className="px-3 py-2.5 text-center">{isBangla ? 'সদস্য সংখ্যা' : 'Persons'}</th>
                      <th className="px-3 py-2.5">{isBangla ? 'বাস সিট' : 'Bus Seat'}</th>
                      <th className="px-3 py-2.5">{isBangla ? 'মোট ফি' : 'Total Fee'}</th>
                      <th className="px-3 py-2.5">{isBangla ? 'পরিশোধিত' : 'Paid'}</th>
                      <th className="px-3 py-2.5">{isBangla ? 'অবস্থা' : 'Status'}</th>
                      <th className="px-3 py-2.5 text-right rounded-r-lg">{isBangla ? 'অ্যাকশন' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedPicnic.participants.map((pt) => {
                      const due = pt.totalFee - pt.paidAmount;
                      return (
                        <tr key={pt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-3 py-3 font-extrabold text-slate-900 dark:text-white">
                            {pt.name}
                          </td>
                          <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                            {pt.phone}
                          </td>
                          <td className="px-3 py-3 text-center font-bold">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                              {formatNumber(pt.membersCount, isBangla)} {isBangla ? 'জন' : 'pers'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-emerald-600 font-bold">
                            {pt.busSeat || (isBangla ? 'অনির্ধারিত' : 'Unassigned')}
                          </td>
                          <td className="px-3 py-3 font-extrabold">
                            {formatCurrency(pt.totalFee, isBangla)}
                          </td>
                          <td className="px-3 py-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(pt.paidAmount, isBangla)}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                pt.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : pt.status === 'PARTIAL'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {pt.status === 'PAID'
                                ? (isBangla ? 'পরিশোধিত' : 'Paid')
                                : pt.status === 'PARTIAL'
                                ? (isBangla ? `আংশিক (বাকি ${formatCurrency(due, isBangla)})` : `Partial (Due ${formatCurrency(due, isBangla)})`)
                                : (isBangla ? 'বকেয়া' : 'Unpaid')}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isAdmin && pt.status !== 'PAID' && (
                                <button
                                  onClick={() =>
                                    handleUpdatePayment(
                                      selectedPicnic.id,
                                      pt.id,
                                      pt.totalFee
                                    )
                                  }
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px]"
                                  title="Mark Full Paid"
                                >
                                  {isBangla ? 'পূর্ণ পরিশোধ' : 'Mark Paid'}
                                </button>
                              )}
                              {isAdmin && pt.status !== 'UNPAID' && (
                                <button
                                  onClick={() =>
                                    handleUpdatePayment(
                                      selectedPicnic.id,
                                      pt.id,
                                      0
                                    )
                                  }
                                  className="px-2 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 rounded-lg font-bold text-[10px]"
                                  title="Mark Unpaid"
                                >
                                  {isBangla ? 'বকেয়া করুন' : 'Mark Unpaid'}
                                </button>
                              )}
                              {isAdmin && (
                                <button
                                  onClick={() =>
                                    handleDeleteParticipant(
                                      selectedPicnic.id,
                                      pt.id
                                    )
                                  }
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  title="Delete Participant"
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
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 mb-3 text-sm">
            {isBangla ? 'কোনো পিকনিক ইভেন্ট নেই' : 'No picnic events'}
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              {isBangla ? 'পিকনিক তৈরি করুন' : 'Create Picnic'}
            </button>
          )}
        </div>
      )}

      {/* Modal: Create Picnic */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Palmtree className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isBangla ? 'নতুন পিকনিক ইভেন্ট তৈরি' : 'Create Picnic Event'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePicnic} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'ইভেন্টের নাম (English) *' : 'Event Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Badminton Club Picnic 2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'ইভেন্টের নাম (বাংলা)' : 'Event Title in Bengali'}
                </label>
                <input
                  type="text"
                  value={titleBangla}
                  onChange={(e) => setTitleBangla(e.target.value)}
                  placeholder="যেমন: ক্লাবের বার্ষিক পিকনিক ও ফ্যামিলি ডে ২০২৬"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'গন্তব্য / রিসোর্টের নাম *' : 'Destination / Spot *'}
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Bhawal Resort, Gazipur"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'মাথাপিছু ফি (টাকা) *' : 'Fee Per Person (৳) *'}
                  </label>
                  <input
                    type="number"
                    value={feePerPerson}
                    onChange={(e) => setFeePerPerson(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'আনুমানিক বাজেট (টাকা)' : 'Estimated Budget (৳)'}
                  </label>
                  <input
                    type="number"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'তারিখ' : 'Date'}
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'বাসের তথ্য' : 'Bus Info'}
                  </label>
                  <input
                    type="text"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                    placeholder="e.g. AC Bus Dhaka-Metro Cha 11"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'প্যাকেজের বিবরণ ও মেন্যু' : 'Package Details'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Breakfast, Buffet lunch, pool access, raffle draw"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {isBangla ? 'ইভেন্ট সেভ করুন' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Book Seat / Ticket */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isBangla ? 'পিকনিক সিট ও টিকিট বুকিং' : 'Book Picnic Ticket'}
                </h3>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddParticipant} className="p-5 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'সদস্যের নাম *' : 'Member / Participant Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'মোবাইল নম্বর' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  value={pPhone}
                  onChange={(e) => setPPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'মোট মানুষ সংখ্যা (জন) *' : 'Number of Persons *'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={membersCount}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      setMembersCount(count);
                      setPaidAmount(count * (selectedPicnic?.feePerPerson || 1000));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'বাস সিট নম্বর' : 'Bus Seat No'}
                  </label>
                  <input
                    type="text"
                    value={busSeat}
                    onChange={(e) => setBusSeat(e.target.value)}
                    placeholder="e.g. A1, A2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'পরিশোধিত ফি (টাকা)' : 'Paid Amount (৳)'}
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {isBangla
                    ? `মোট ফি: ${formatCurrency((Number(membersCount) || 1) * (selectedPicnic?.feePerPerson || 1000), true)}`
                    : `Total Fee: ${formatCurrency((Number(membersCount) || 1) * (selectedPicnic?.feePerPerson || 1000), false)}`}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  {isBangla ? 'বুকিং নিশ্চিত করুন' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
