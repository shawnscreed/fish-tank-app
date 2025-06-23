import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db'; // assumes you're using a db pool file like pg.Pool

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, referralCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await pool.query(
      'SELECT * FROM "User" WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Determine role from referralCode
    let role = 'user'; // default
    if (referralCode) {
      const referral = await pool.query(
        'SELECT * FROM "ReferralCode" WHERE code = $1 AND is_active = TRUE',
        [referralCode]
      );

      if (referral.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid or inactive referral code' }, { status: 400 });
      }

      role = referral.rows[0].role;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

   const result = await pool.query(
  `INSERT INTO "User" (name, email, password_hash, referral_code, role)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING id, name, email, role`,
  [name, email, hashedPassword, referralCode || null, role]
);


    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
