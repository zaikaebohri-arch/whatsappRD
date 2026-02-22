"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchBookings() {
            setLoading(true);
            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .order("start_time", { ascending: true });

            if (error) console.error("Error fetching bookings:", error);
            else setBookings(data || []);
            setLoading(false);
        }

        fetchBookings();
    }, []);

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.start_time).toISOString().split('T')[0];
            const matchesDate = (!startDate || bookingDate >= startDate) && (!endDate || bookingDate <= endDate);
            const matchesSearch = !searchQuery ||
                booking.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                booking.summary.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesDate && matchesSearch;
        });
    }, [bookings, startDate, endDate, searchQuery]);

    if (loading) return <div className="text-center py-10 text-slate-500">Loading bookings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Client Bookings</h2>
                <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                    {filteredBookings.length} Showed
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Search</label>
                    <input
                        type="text"
                        placeholder="Phone or Summary..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">From Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">To Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                        No bookings match your filters.
                    </div>
                ) : (
                    filteredBookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900">{booking.summary}</h3>
                                    <p className="text-slate-500 text-sm mb-2">{booking.description || "No additional details"}</p>
                                    <div className="flex flex-wrap gap-3">
                                        <span className="inline-flex items-center text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                                            📱 {booking.phone}
                                        </span>
                                        <span className="inline-flex items-center text-xs bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-medium border border-emerald-100">
                                            📅 {new Date(booking.start_time).toLocaleDateString()}
                                        </span>
                                        <span className="inline-flex items-center text-xs bg-indigo-50 px-2 py-1 rounded text-indigo-700 font-medium border border-indigo-100">
                                            ⏰ {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        if (!confirm("Are you sure you want to cancel this booking?")) return;
                                        const { error } = await supabase.from('bookings').delete().eq('id', booking.id);
                                        if (!error) setBookings(prev => prev.filter(b => b.id !== booking.id));
                                    }}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                    title="Cancel Booking"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
