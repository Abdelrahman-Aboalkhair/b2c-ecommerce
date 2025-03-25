"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearAuthState } from "../../store/slices/AuthSlice";
import { useSignOutMutation } from "../../store/apis/AuthApi";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Home, User, LogOut } from "lucide-react";
import Button from "../atoms/Button";

const UserMenu = ({ menuOpen, closeMenu }: any) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [signOut] = useSignOutMutation();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      dispatch(clearAuthState());
      router.push("/sign-in");
    } catch (error) {
      console.error("Error occurred while signing out", error);
    }
  };

  return (
    menuOpen && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute right-0 top-[3rem] w-56 bg-white shadow-lg rounded-lg z-[2200] border border-gray-200 overflow-hidden"
      >
        <div className="absolute top-[-10px] right-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>

        <div className="flex flex-col text-gray-700">
          <Link
            href={`/${user?.role || "driver"}-dashboard`}
            className="flex items-center px-4 py-3 gap-2 hover:bg-gray-100 transition"
            onClick={closeMenu}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/"
            className="flex items-center px-4 py-3 gap-2 hover:bg-gray-100 transition"
            onClick={closeMenu}
          >
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link
            href="/me"
            className="flex items-center px-4 py-3 gap-2 hover:bg-gray-100 transition"
            onClick={closeMenu}
          >
            <User size={18} />
            <span>Your Profile</span>
          </Link>
          <Button
            onClick={() => {
              handleSignOut();
              closeMenu();
            }}
            className="flex items-center text-left w-full px-4 py-3 gap-2 hover:bg-red-50 text-red-600 transition"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </Button>
        </div>
      </motion.div>
    )
  );
};

export default UserMenu;
