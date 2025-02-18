"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const UserInformation = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {   
    if (status === "unauthenticated") {
      router.push("/"); 
    }
  }, [status, router]);

  if (status === "loading") return null; 
  if (!session) return null; 

  return (
    <div className="flex items-center justify-center container mx-auto w-full h-screen px-[12px] ">
      <div className="max-w-md w-full mx-auto rounded-2xl p-8 py-12 md:py-12 space-y-4 shadow-input bg-white border border-[#1a1c24]">
        <div className="flex flex-col">
          Name<span className="font-bold">{session?.user?.name}</span>
        </div>
        <div className="flex flex-col">
          Email<span className="font-bold">{session?.user?.email}</span>
        </div> 
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex justify-center font-semibold border items-center gap-2 rounded-md py-2 px-8 w-full text-[16px]  cursor-pointer bg-[#f55418] hover:bg-transparent border-[#f55418] text-white ring-[#f55418]/20 hover:text-[#f55418]"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};
export default UserInformation;
