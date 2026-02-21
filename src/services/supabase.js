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
        if (!startStr || !endStr) {
            console.error('[ERROR] isSlotAvailable: Missing timing arguments');
            return false;
        }

        const start = new Date(startStr);
        const end = new Date(endStr);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            console.error(`[ERROR] isSlotAvailable: Invalid date strings provided. Start: ${startStr}, End: ${endStr}`);
            return false;
        }

        // 1. Check existing bookings
        // Logic: A slot overlaps if (Existing Start < Requested End) AND (Existing End > Requested Start)
        const { data: bookings, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .lt('start_time', end.toISOString())
            .gt('end_time', start.toISOString());

        if (bookingError) {
            console.error('[ERROR] Supabase bookings query failed:', bookingError);
            throw bookingError;
        }
        if (bookings && bookings.length > 0) {
            console.log(`[DEBUG] Slot conflict found with ${bookings.length} existing bookings.`);
            return false;
        }

        // 2. Check blocked slots
        const { data: blocks, error: blockError } = await supabase
            .from('blocked_slots')
            .select('*')
            .lt('start_time', end.toISOString())
            .gt('end_time', start.toISOString());

        if (blockError) {
            console.error('[ERROR] Supabase blocks query failed:', blockError);
            throw blockError;
        }
        if (blocks && blocks.length > 0) {
            console.log(`[DEBUG] Slot conflict found with ${blocks.length} blocked slots.`);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[CRITICAL] Unexpected error in isSlotAvailable:', error.message || error);
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
