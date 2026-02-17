
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    await dbConnect();
    
    // Check if user exists and has admin privileges
    const user = await User.findById(decoded.userId);
    
    if (!user) {
        redirect("/admin/login");
    }

    const adminRoles = ["admin", "developer", "cr", "hod"];
    if (!adminRoles.includes(user.role)) {
        // Option: Show a 403 page or redirect. Redirecting to login for now.
        // We could also redirect to strictly user dashboard if one exists.
        redirect("/admin/login"); 
    }

    // Role is valid, proceed
    return <>{children}</>;

  } catch (error) {
    // Token invalid or expired
    redirect("/admin/login");
  }
}
