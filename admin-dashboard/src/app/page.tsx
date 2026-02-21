"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBookings() {
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

    if (loading) return <div className="text-center py-10 text-slate-500">Loading bookings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Client Bookings</h2>
                <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                    {bookings.length} Total
                </div>
            </div>

            <div className="grid gap-4">
                {bookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                        No bookings found.
                    </div>
                ) : (
                    bookings.map((booking) => (
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
