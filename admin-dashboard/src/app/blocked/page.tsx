"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

export default function BlockedPage() {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isAllDay, setIsAllDay] = useState(false);

    // Filtering states
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    useEffect(() => {
        fetchBlocks();
    }, []);

    async function fetchBlocks() {
        setLoading(true);
        const { data, error } = await supabase
            .from("blocked_slots")
            .select("*")
            .order("start_time", { ascending: true });

        if (error) console.error("Error fetching blocks:", error);
        else setBlocks(data || []);
        setLoading(false);
    }

    async function handleBlock() {
        if (!date) return alert("Please select a date");
        if (!isAllDay && (!startTime || !endTime)) return alert("Please fill start and end times");

        const start = isAllDay
            ? new Date(`${date}T00:00:00`).toISOString()
            : new Date(`${date}T${startTime}:00`).toISOString();

        const end = isAllDay
            ? new Date(`${date}T23:59:59`).toISOString()
            : new Date(`${date}T${endTime}:00`).toISOString();

        const { error } = await supabase.from("blocked_slots").insert([{
            reason: reason || (isAllDay ? "All Day Block" : "Manual Block"),
            start_time: start,
            end_time: end
        }]);

        if (error) {
            console.error("Error blocking slot:", error);
            alert("Error blocking slot. Check console.");
        } else {
            setReason("");
            setStartTime("");
            setEndTime("");
            setIsAllDay(false);
            fetchBlocks();
        }
    }

    async function deleteBlock(id: string) {
        if (!confirm("Are you sure you want to remove this block?")) return;
        const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
        if (!error) setBlocks(prev => prev.filter(b => b.id !== id));
    }

    const filteredBlocks = useMemo(() => {
        return blocks.filter(block => {
            const blockDate = new Date(block.start_time).toISOString().split('T')[0];
            return (!filterStartDate || blockDate >= filterStartDate) &&
                (!filterEndDate || blockDate <= filterEndDate);
        });
    }, [blocks, filterStartDate, filterEndDate]);

    return (
        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
            {/* Form Side */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Block New Slot</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g., Staff Lunch, Maintenance"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            id="allDay"
                            checked={isAllDay}
                            onChange={e => setIsAllDay(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="allDay" className="text-sm font-medium text-slate-700 cursor-pointer">Block Entire Day</label>
                    </div>

                    {!isAllDay && (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleBlock}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors mt-4 text-sm"
                    >
                        {isAllDay ? 'Block Full Day' : 'Block Slot'}
                    </button>
                </div>
            </div>

            {/* List Side */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Active Blocks</h2>
                    <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {filteredBlocks.length} Result{filteredBlocks.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tight">From Date</label>
                        <input
                            type="date"
                            value={filterStartDate}
                            onChange={e => setFilterStartDate(e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tight">To Date</label>
                        <input
                            type="date"
                            value={filterEndDate}
                            onChange={e => setFilterEndDate(e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={() => { setFilterStartDate(""); setFilterEndDate(""); }}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
                    >
                        Reset
                    </button>
                </div>

                {loading ? (
                    <div className="text-slate-500 py-4">Loading active blocks...</div>
                ) : filteredBlocks.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                        No blocked slots found for these filters.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {filteredBlocks.map(block => (
                            <div key={block.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center group">
                                <div>
                                    <h4 className="font-semibold text-slate-900">{block.reason || "Manual Block"}</h4>
                                    <p className="text-slate-500 text-xs">
                                        {new Date(block.start_time).toLocaleDateString()} | {new Date(block.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(block.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteBlock(block.id)}
                                    className="bg-slate-50 group-hover:bg-red-50 text-slate-400 group-hover:text-red-500 p-2 rounded-lg transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
