import { NextResponse } from "next/server";
import User from "@/models/User";
import connectToDatabase from "@/lib/db";

/**
 * Get the currently logged-in user from the session cookie.
 * Returns null if not authenticated.
 */
export async function getSessionUser(req) {
    await connectToDatabase();
    const token = req.cookies.get("session")?.value;
    if (!token) return null;
    return User.findOne({ sessionToken: token });
}

/**
 * Require authentication. Returns { user } on success, { error } on failure.
 * Usage: const { user, error } = await requireAuth(req);
 *        if (error) return error;
 */
export async function requireAuth(req) {
    const user = await getSessionUser(req);
    if (!user) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    return { user };
}

/**
 * Require owner privileges. Returns { user } on success, { error } on failure.
 * Usage: const { user, error } = await requireOwner(req);
 *        if (error) return error;
 */
export async function requireOwner(req) {
    const { user, error } = await requireAuth(req);
    if (error) return { error };
    if (!user.isOwner) {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { user };
}

/**
 * Sanitize user object for client response.
 */
export function sanitizeUser(u) {
    return {
        username: u.username,
        email: u.email,
        isOwner: u.isOwner,
        firstName: u.firstName || null,
        lastName: u.lastName || null,
        phoneNumber: u.phoneNumber || null,
        avatar: u.avatar || null,
        addresses: Array.isArray(u.addresses) ? u.addresses : [],
    };
}
