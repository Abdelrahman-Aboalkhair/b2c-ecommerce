"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { useGetMeQuery } from "./store/apis/UserApi";
import { clearUser, setUser } from "./store/slices/AuthSlice";
import CustomLoader from "./components/feedback/CustomLoader";

interface SessionWrapperProps {
  children: React.ReactNode;
}

const EXCLUDED_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

const SessionWrapper = ({ children }: SessionWrapperProps) => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const shouldSkip = EXCLUDED_ROUTES.includes(pathname);
  const { data, isFetching, error } = useGetMeQuery({}, { skip: shouldSkip });
  const user = data?.user;

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    } else if (error && !shouldSkip) {
      dispatch(clearUser());
    }
  }, [user, error, shouldSkip, dispatch]);

  if (isFetching) {
    return <CustomLoader />;
  }

  return <>{children}</>;
};

export default SessionWrapper;
