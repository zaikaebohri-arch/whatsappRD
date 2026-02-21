"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BlockedPage() {
    const [blocks, setBlocks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

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
        if (!date || !startTime || !endTime) return alert("Please fill date and times");

        const start = new Date(`${date}T${startTime}:00`).toISOString();
        const end = new Date(`${date}T${endTime}:00`).toISOString();

        const { error } = await supabase.from("blocked_slots").insert([{
            reason,
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
            fetchBlocks();
        }
    }

    async function deleteBlock(id: string) {
        const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
        if (!error) setBlocks(prev => prev.filter(b => b.id !== id));
    }

    return (
        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
            {/* Form Side */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Block New Slot</h2>
                <div className="space-y-3">
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
                    <div className="grid grid-cols-2 gap-3">
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
                    <button
                        onClick={handleBlock}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors mt-4 text-sm"
                    >
                        Block Slot
                    </button>
                </div>
            </div>

            {/* List Side */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Active Blocks</h2>
                {loading ? (
                    <div className="text-slate-500 py-4">Loading active blocks...</div>
                ) : blocks.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                        No blocked slots found.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {blocks.map(block => (
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
