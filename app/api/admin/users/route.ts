import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcrypt";
import { insertAuditLog } from "@/lib/audit";
// GET /api/admin/users
export async function GET() {
  try {
    await requireAdmin();

    const result = await query(`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        account_number,
        balance,
        created_at, 
        last_login 
      FROM users 
      ORDER BY created_at DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users. Please try again." },
      { status: 500 }
    );
  }
}

// POST /api/admin/users
// // POST /api/admin/users
// export async function POST(request: Request) {
//   try {
//     const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("host") || null
//     const admin = await requireAdmin()

//     const body = await request.json()
//     const { name, email, password, role, account_number, balance } = body

//     // Validate required fields
//     if (!name || !email || !password || !role || !account_number || balance === undefined) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       )
//     }

//     // Check if email already exists
//     const existingUser = await query(
//       'SELECT id FROM users WHERE email = $1',
//       [email]
//     )

//     if (existingUser.rows.length > 0) {
//       return NextResponse.json(
//         { error: 'Email already exists' },
//         { status: 400 }
//       )
//     }

//     // Check if account number already exists
//     const existingAccount = await query(
//       'SELECT id FROM users WHERE account_number = $1',
//       [account_number]
//     )

//     if (existingAccount.rows.length > 0) {
//       return NextResponse.json(
//         { error: 'Account number already exists' },
//         { status: 400 }
//       )
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10)

//     // Create user
//     const result = await query(
//       `INSERT INTO users (
//         name,
//         email,
//         password,
//         role,
//         account_number,
//         balance
//       ) VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING id, name, email, role, account_number, balance, created_at`,
//       [name, email, hashedPassword, role, account_number, balance]
//     )

//     const newUser = result.rows[0]

//     // Insert audit log
//     await insertAuditLog({
//       //@ts-ignore
//       userId: admin.user.id,
//       action: "create",
//       entityId: newUser.id,
//       details: `Created user: ${name} (${email}), role: ${role}, account: ${account_number}`,
//       ipAddress: ipAddress || undefined,
//     })

//     return NextResponse.json(newUser)
//   } catch (error) {
//     console.error('Error creating user:', error)

//     // Handle specific error cases
//     if (error instanceof Error) {
//       if (error.message.includes('timeout')) {
//         return NextResponse.json(
//           { error: 'Database connection timed out. Please try again.' },
//           { status: 504 }
//         )
//       }
//       if (error.message.includes('duplicate key')) {
//         return NextResponse.json(
//           { error: 'A user with this email or account number already exists.' },
//           { status: 400 }
//         )
//       }
//     }

//     return NextResponse.json(
//       { error: 'Failed to create user. Please try again.' },
//       { status: 500 }
//     )
//   }
// }

// POST /api/admin/users
export async function POST(request: Request) {
  try {
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("host") ||
      null;
    const admin = await requireAdmin();

    const body = await request.json();
    const {
      name,
      first_name,
      last_name,
      email,
      password,
      role,
      account_number,
      balance,
      phone_number, // ✅ 1. Accept phone_number
    } = body;

    // ✅ 2. Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !role ||
      !account_number ||
      balance === undefined ||
      !phone_number
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Check if account number already exists
    const existingAccount = await query(
      "SELECT id FROM users WHERE account_number = $1",
      [account_number]
    );

    if (existingAccount.rows.length > 0) {
      return NextResponse.json(
        { error: "Account number already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 3. Insert user including phone_number
const result = await query(
  `INSERT INTO users (
    name,
    first_name,
    last_name,
    email,
    password,
    role,
    account_number,
    balance,
    phone_number
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING id, name, first_name, last_name, email, role, account_number, balance, phone_number, created_at`,
  [
    name,
    first_name,
    last_name,
    email,
    hashedPassword,
    role,
    account_number,
    balance,
    phone_number,
  ]
);


    const newUser = result.rows[0];

    // ✅ 4. Insert audit log
    // await insertAuditLog({
    //   // @ts-ignore
    //   userId: admin.user.id,
    //   action: "create",
    //   entityId: newUser.id,
    //   details: `Created user: ${name} (${email}), role: ${role}, account: ${account_number}, phone: ${phone_number}`,
    //   ipAddress: ipAddress || undefined,
    // });
        await insertAuditLog({
          request, // <-- pass the full Request object here
          // @ts-ignore
          userId: null, // or leave out if optional
          action: "create",
          entityId: newUser.id,
          details: `Created user: ${name} (${email}), role: ${role}, account: ${account_number}, phone: ${phone_number}`,
        });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);

    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          {
            error: "Database connection timed out. Please try again.",
          },
          { status: 504 }
        );
      }
      if (error.message.includes("duplicate key")) {
        return NextResponse.json(
          {
            error: "A user with this email or account number already exists.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create user. Please try again." },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users
// export async function PUT(request: Request) {
//   try {
//     await requireAdmin()

//     const body = await request.json()
//     const { userId, role } = body

//     if (!userId || !role) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       )
//     }

//     const result = await query(
//       `UPDATE users
//        SET role = $1
//        WHERE id = $2
//        RETURNING id, name, email, role, account_number, balance, created_at`,
//       [role, userId]
//     )

//     return NextResponse.json(result.rows[0])
//   } catch (error) {
//     console.error('Error updating user:', error)

//     // Handle specific error cases
//     if (error instanceof Error) {
//       if (error.message.includes('timeout')) {
//         return NextResponse.json(
//           { error: 'Database connection timed out. Please try again.' },
//           { status: 504 }
//         )
//       }
//     }

//     return NextResponse.json(
//       { error: 'Failed to update user. Please try again.' },
//       { status: 500 }
//     )
//   }
// }

export async function PUT(request: Request) {
  try {
    const session = await requireAdmin();

    const body = await request.json();
    console.log("The body check",body)
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE users 
       SET role = $1 
       WHERE id = $2 
       RETURNING id, name, email, role, account_number, balance, created_at`,
      [role, userId]
    );

    // Insert into audit log
    // await insertAuditLog({
    //   //@ts-ignore
    //   userId: session.user.id,
    //   action: "update-role",
    //   entityId: userId,
    //   details: `Changed role to ${role}`,
    //   ipAddress: request.headers.get("x-forwarded-for") || undefined,
    // });
      await insertAuditLog({
        request, // <-- pass the full Request object here
        // @ts-ignore
        userId: admin.user.id,
        action: "update-role",
        //@ts-ignore
        entityId: admin.user.id,
        details: `Changed role to ${role}`,
      });

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);

    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Database connection timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update user. Please try again." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users
// export async function DELETE(request: Request) {
//   try {
//     await requireAdmin()

//     const body = await request.json()
//     const { userId } = body

//     if (!userId) {
//       return NextResponse.json(
//         { error: 'User ID is required' },
//         { status: 400 }
//       )
//     }

//     // First, check if the user exists
//     const userCheck = await query(
//       'SELECT id FROM users WHERE id = $1',
//       [userId]
//     )

//     if (userCheck.rows.length === 0) {
//       return NextResponse.json(
//         { error: 'User not found' },
//         { status: 404 }
//       )
//     }

//     // Delete the user
//     await query(
//       'DELETE FROM users WHERE id = $1',
//       [userId]
//     )

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error('Error deleting user:', error)

//     // Handle specific error cases
//     if (error instanceof Error) {
//       if (error.message.includes('timeout')) {
//         return NextResponse.json(
//           { error: 'Database connection timed out. Please try again.' },
//           { status: 504 }
//         )
//       }
//     }

//     return NextResponse.json(
//       { error: 'Failed to delete user. Please try again.' },
//       { status: 500 }
//     )
//   }
// }

export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin();

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userCheck = await query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const deletedUser = userCheck.rows[0];

    // Delete the user
    await query("DELETE FROM users WHERE id = $1", [userId]);

    // Insert audit log
    // await insertAuditLog({
    //   //@ts-ignore
    //   userId: session.user.id,
    //   action: "delete-user",
    //   entityId: userId,
    //   details: `Deleted user ${deletedUser.name} (${deletedUser.email})`,
    //   ipAddress: request.headers.get("x-forwarded-for") || undefined,
    // });

      await insertAuditLog({
        request, // <-- pass the full Request object here
        // @ts-ignore
        userId: admin.user.id,
        action: "delete-user",
        //@ts-ignore
        entityId: admin.user.id,
        details: `Deleted user ${deletedUser.name} (${deletedUser.email})`,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);

    if (error instanceof Error && error.message.includes("timeout")) {
      return NextResponse.json(
        { error: "Database connection timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete user. Please try again." },
      { status: 500 }
    );
  }
}
