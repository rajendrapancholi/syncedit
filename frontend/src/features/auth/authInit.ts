"use client";

import { useGetUserQuery } from "./authApi";

export default function AuthInit() {
  useGetUserQuery(); 
  
  return null;
}
