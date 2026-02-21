const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

/**
 * Check if a requested time slot is available (not booked and not blocked).
 * @param {string} startStr - ISO string
 * @param {string} endStr - ISO string
 */
async function isSlotAvailable(startStr, endStr) {
    try {
        const start = new Date(startStr);
        const end = new Date(endStr);

        // 1. Check existing bookings
        const { data: bookings, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .or(`start_time.lt.${end.toISOString()},end_time.gt.${start.toISOString()}`);

        if (bookingError) throw bookingError;
        if (bookings && bookings.length > 0) return false;

        // 2. Check blocked slots
        const { data: blocks, error: blockError } = await supabase
            .from('blocked_slots')
            .select('*')
            .or(`start_time.lt.${end.toISOString()},end_time.gt.${start.toISOString()}`);

        if (blockError) throw blockError;
        if (blocks && blocks.length > 0) return false;

        return true;
    } catch (error) {
        console.error('Error checking availability:', error);
        return false;
    }
}

/**
 * Fetch all booked and blocked slots in a window.
 * @param {string} startWindow - ISO string
 * @param {string} endWindow - ISO string
 */
async function getSlotsInWindow(startWindow, endWindow) {
    try {
        const { data: bookings } = await supabase
            .from('bookings')
            .select('summary, start_time, end_time')
            .gte('start_time', startWindow)
            .lte('end_time', endWindow);

        const { data: blocks } = await supabase
            .from('blocked_slots')
            .select('reason, start_time, end_time')
            .gte('start_time', startWindow)
            .lte('end_time', endWindow);

        const allSlots = [
            ...(bookings || []).map(b => ({ type: 'Booking', info: b.summary, start: b.start_time, end: b.end_time })),
            ...(blocks || []).map(b => ({ type: 'Blocked', info: b.reason || 'Blocked by Admin', start: b.start_time, end: b.end_time }))
        ];

        return allSlots;
    } catch (error) {
        console.error('Error fetching slots:', error);
        return [];
    }
}

/**
 * Create a new booking.
 */
async function createBooking(phone, summary, description, startTime, endTime) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                phone,
                summary,
                description,
                start_time: startTime,
                end_time: endTime
            }])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

module.exports = {
    isSlotAvailable,
    getSlotsInWindow,
    createBooking,
    supabase
};
