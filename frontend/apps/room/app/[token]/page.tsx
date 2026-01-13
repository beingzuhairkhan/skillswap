"use client";
export const dynamic = "force-dynamic"; 
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TokenPage() {
  const { token } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/room/decodeRoom`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetLink: `${process.env.NEXT_PUBLIC_ROOM_URL}/${token}` }),
        });

        const data = await res.json();

        if (data.status && data.roomId) {
            localStorage.setItem("meet", JSON.stringify(data.roomId));
          // Redirect to actual room page
          router.replace(`${process.env.NEXT_PUBLIC_ROOM_URL}`);
        } else {
          alert("Invalid meet link");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to verify meet link");
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-white text-lg">Verifying meet link...</p>
    </div>
  );
}
